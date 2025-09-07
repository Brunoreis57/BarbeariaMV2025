-- =====================================================
-- FUNÇÕES AVANÇADAS E PROCEDURES PARA SUPABASE
-- Sistema de Gestão para Barbearia MV 2025
-- =====================================================

-- =====================================================
-- FUNÇÕES DE AUTENTICAÇÃO E SEGURANÇA
-- =====================================================

-- Função para login de funcionário
CREATE OR REPLACE FUNCTION login_funcionario(
    usuario_input TEXT,
    senha_input TEXT
)
RETURNS TABLE(
    id UUID,
    nome TEXT,
    cargo TEXT,
    percentual_comissao DECIMAL(5,2),
    success BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.nome,
        f.cargo,
        f.percentual_comissao,
        CASE 
            WHEN fc.senha_hash IS NOT NULL AND crypt(senha_input, fc.senha_hash) = fc.senha_hash 
            THEN true
            ELSE false
        END as success
    FROM funcionarios f
    JOIN funcionario_credenciais fc ON f.id = fc.funcionario_id
    WHERE fc.usuario = usuario_input 
      AND f.ativo = true 
      AND fc.ativo = true;
    
    -- Atualizar último login se autenticação bem-sucedida
    UPDATE funcionario_credenciais 
    SET ultimo_login = NOW()
    WHERE usuario = usuario_input 
      AND crypt(senha_input, senha_hash) = senha_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar credenciais de funcionário com hash seguro
CREATE OR REPLACE FUNCTION create_funcionario_credentials(
    funcionario_id UUID,
    usuario_input TEXT,
    senha_input TEXT
)
RETURNS UUID AS $$
DECLARE
    credential_id UUID;
BEGIN
    INSERT INTO funcionario_credenciais (funcionario_id, usuario, senha_hash)
    VALUES (
        funcionario_id,
        usuario_input,
        crypt(senha_input, gen_salt('bf'))
    )
    RETURNING id INTO credential_id;
    
    RETURN credential_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para alterar senha
CREATE OR REPLACE FUNCTION change_password(
    funcionario_id UUID,
    senha_atual TEXT,
    senha_nova TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    senha_hash_atual TEXT;
BEGIN
    -- Verificar senha atual
    SELECT senha_hash INTO senha_hash_atual
    FROM funcionario_credenciais
    WHERE funcionario_id = change_password.funcionario_id;
    
    IF crypt(senha_atual, senha_hash_atual) = senha_hash_atual THEN
        -- Atualizar para nova senha
        UPDATE funcionario_credenciais
        SET senha_hash = crypt(senha_nova, gen_salt('bf')),
            data_atualizacao = NOW()
        WHERE funcionario_id = change_password.funcionario_id;
        
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÕES DE AGENDAMENTO
-- =====================================================

-- Função para verificar disponibilidade de horário
CREATE OR REPLACE FUNCTION check_availability(
    funcionario_id UUID,
    data_inicio TIMESTAMP WITH TIME ZONE,
    duracao_minutos INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    data_fim TIMESTAMP WITH TIME ZONE;
    conflitos INTEGER;
BEGIN
    data_fim := data_inicio + (duracao_minutos || ' minutes')::INTERVAL;
    
    SELECT COUNT(*)
    INTO conflitos
    FROM agendamentos
    WHERE funcionario_id = check_availability.funcionario_id
      AND status NOT IN ('cancelado', 'nao_compareceu')
      AND (
          (data_agendamento <= data_inicio AND data_fim > data_inicio) OR
          (data_agendamento < data_fim AND data_fim >= data_fim) OR
          (data_agendamento >= data_inicio AND data_fim <= data_fim)
      );
    
    RETURN conflitos = 0;
END;
$$ LANGUAGE plpgsql;

-- Função para criar agendamento com validação
CREATE OR REPLACE FUNCTION create_agendamento_safe(
    cliente_id UUID,
    funcionario_id UUID,
    servico_id UUID,
    data_agendamento TIMESTAMP WITH TIME ZONE,
    observacoes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    agendamento_id UUID;
    duracao INTEGER;
    preco DECIMAL(10,2);
BEGIN
    -- Buscar duração e preço do serviço
    SELECT duracao_minutos, preco
    INTO duracao, preco
    FROM servicos
    WHERE id = servico_id AND ativo = true;
    
    IF duracao IS NULL THEN
        RAISE EXCEPTION 'Serviço não encontrado ou inativo';
    END IF;
    
    -- Verificar disponibilidade
    IF NOT check_availability(funcionario_id, data_agendamento, duracao) THEN
        RAISE EXCEPTION 'Horário não disponível';
    END IF;
    
    -- Criar agendamento
    INSERT INTO agendamentos (
        cliente_id, funcionario_id, servico_id, 
        data_agendamento, data_fim, valor_servico, observacoes
    )
    VALUES (
        cliente_id, funcionario_id, servico_id,
        data_agendamento, 
        data_agendamento + (duracao || ' minutes')::INTERVAL,
        preco, observacoes
    )
    RETURNING id INTO agendamento_id;
    
    RETURN agendamento_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÕES DE VENDAS E PAGAMENTOS
-- =====================================================

-- Função para finalizar corte e criar venda
CREATE OR REPLACE FUNCTION finalizar_corte(
    agendamento_id UUID,
    servicos_extras JSONB DEFAULT '[]'::JSONB,
    produtos JSONB DEFAULT '[]'::JSONB,
    pagamentos JSONB DEFAULT '[]'::JSONB,
    desconto DECIMAL(10,2) DEFAULT 0.00,
    observacoes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    venda_id UUID;
    agendamento_record RECORD;
    valor_total DECIMAL(10,2) := 0;
    valor_final DECIMAL(10,2);
    item JSONB;
BEGIN
    -- Buscar dados do agendamento
    SELECT a.*, s.preco as preco_servico
    INTO agendamento_record
    FROM agendamentos a
    JOIN servicos s ON a.servico_id = s.id
    WHERE a.id = agendamento_id AND a.status = 'agendado';
    
    IF agendamento_record.id IS NULL THEN
        RAISE EXCEPTION 'Agendamento não encontrado ou já finalizado';
    END IF;
    
    -- Calcular valor total
    valor_total := agendamento_record.preco_servico;
    
    -- Somar serviços extras
    FOR item IN SELECT * FROM jsonb_array_elements(servicos_extras)
    LOOP
        valor_total := valor_total + (item->>'preco')::DECIMAL(10,2) * (item->>'quantidade')::INTEGER;
    END LOOP;
    
    -- Somar produtos
    FOR item IN SELECT * FROM jsonb_array_elements(produtos)
    LOOP
        valor_total := valor_total + (item->>'preco')::DECIMAL(10,2) * (item->>'quantidade')::INTEGER;
    END LOOP;
    
    valor_final := valor_total - desconto;
    
    -- Criar venda
    INSERT INTO vendas (
        agendamento_id, cliente_id, funcionario_id,
        valor_total, desconto, valor_final, observacoes
    )
    VALUES (
        agendamento_id, agendamento_record.cliente_id, agendamento_record.funcionario_id,
        valor_total, desconto, valor_final, observacoes
    )
    RETURNING id INTO venda_id;
    
    -- Inserir item do serviço principal
    INSERT INTO venda_itens (venda_id, tipo_item, item_id, quantidade, preco_unitario, subtotal)
    VALUES (venda_id, 'servico', agendamento_record.servico_id, 1, agendamento_record.preco_servico, agendamento_record.preco_servico);
    
    -- Inserir serviços extras
    FOR item IN SELECT * FROM jsonb_array_elements(servicos_extras)
    LOOP
        INSERT INTO venda_itens (venda_id, tipo_item, item_id, quantidade, preco_unitario, subtotal)
        VALUES (
            venda_id, 'servico', (item->>'id')::UUID, 
            (item->>'quantidade')::INTEGER, (item->>'preco')::DECIMAL(10,2),
            (item->>'preco')::DECIMAL(10,2) * (item->>'quantidade')::INTEGER
        );
    END LOOP;
    
    -- Inserir produtos
    FOR item IN SELECT * FROM jsonb_array_elements(produtos)
    LOOP
        INSERT INTO venda_itens (venda_id, tipo_item, item_id, quantidade, preco_unitario, subtotal)
        VALUES (
            venda_id, 'produto', (item->>'id')::UUID,
            (item->>'quantidade')::INTEGER, (item->>'preco')::DECIMAL(10,2),
            (item->>'preco')::DECIMAL(10,2) * (item->>'quantidade')::INTEGER
        );
        
        -- Atualizar estoque do produto
        UPDATE produtos 
        SET estoque = estoque - (item->>'quantidade')::INTEGER
        WHERE id = (item->>'id')::UUID;
    END LOOP;
    
    -- Inserir pagamentos
    FOR item IN SELECT * FROM jsonb_array_elements(pagamentos)
    LOOP
        INSERT INTO pagamentos (venda_id, forma_pagamento, valor, status)
        VALUES (
            venda_id, item->>'forma_pagamento', 
            (item->>'valor')::DECIMAL(10,2), 'aprovado'
        );
    END LOOP;
    
    -- Atualizar status do agendamento
    UPDATE agendamentos 
    SET status = 'concluido', data_atualizacao = NOW()
    WHERE id = agendamento_id;
    
    RETURN venda_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÕES DE RELATÓRIOS
-- =====================================================

-- Função para relatório de vendas por período
CREATE OR REPLACE FUNCTION relatorio_vendas(
    data_inicio DATE,
    data_fim DATE,
    funcionario_id UUID DEFAULT NULL
)
RETURNS TABLE(
    data DATE,
    funcionario TEXT,
    total_vendas BIGINT,
    receita_total DECIMAL(10,2),
    total_comissoes DECIMAL(10,2),
    lucro_liquido DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(v.data_venda) as data,
        f.nome as funcionario,
        COUNT(v.id) as total_vendas,
        SUM(v.valor_final) as receita_total,
        COALESCE(SUM(c.valor_comissao), 0) as total_comissoes,
        SUM(v.valor_final) - COALESCE(SUM(c.valor_comissao), 0) as lucro_liquido
    FROM vendas v
    JOIN funcionarios f ON v.funcionario_id = f.id
    LEFT JOIN comissoes c ON v.id = c.venda_id
    WHERE DATE(v.data_venda) BETWEEN data_inicio AND data_fim
      AND (relatorio_vendas.funcionario_id IS NULL OR v.funcionario_id = relatorio_vendas.funcionario_id)
    GROUP BY DATE(v.data_venda), f.id, f.nome
    ORDER BY data DESC, funcionario;
END;
$$ LANGUAGE plpgsql;

-- Função para ranking de funcionários
CREATE OR REPLACE FUNCTION ranking_funcionarios(
    mes INTEGER,
    ano INTEGER
)
RETURNS TABLE(
    funcionario TEXT,
    total_vendas BIGINT,
    receita_gerada DECIMAL(10,2),
    total_comissoes DECIMAL(10,2),
    ticket_medio DECIMAL(10,2),
    posicao INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH ranking AS (
        SELECT 
            f.nome as funcionario,
            COUNT(v.id) as total_vendas,
            COALESCE(SUM(v.valor_final), 0) as receita_gerada,
            COALESCE(SUM(c.valor_comissao), 0) as total_comissoes,
            COALESCE(AVG(v.valor_final), 0) as ticket_medio,
            ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(v.valor_final), 0) DESC) as posicao
        FROM funcionarios f
        LEFT JOIN vendas v ON f.id = v.funcionario_id 
            AND EXTRACT(MONTH FROM v.data_venda) = mes
            AND EXTRACT(YEAR FROM v.data_venda) = ano
        LEFT JOIN comissoes c ON v.id = c.venda_id
        WHERE f.ativo = true
        GROUP BY f.id, f.nome
    )
    SELECT * FROM ranking ORDER BY posicao;
END;
$$ LANGUAGE plpgsql;

-- Função para análise de formas de pagamento
CREATE OR REPLACE FUNCTION analise_pagamentos(
    data_inicio DATE,
    data_fim DATE
)
RETURNS TABLE(
    forma_pagamento TEXT,
    total_transacoes BIGINT,
    valor_total DECIMAL(10,2),
    percentual DECIMAL(5,2)
) AS $$
DECLARE
    total_geral DECIMAL(10,2);
BEGIN
    -- Calcular total geral
    SELECT SUM(p.valor) INTO total_geral
    FROM pagamentos p
    JOIN vendas v ON p.venda_id = v.id
    WHERE DATE(v.data_venda) BETWEEN data_inicio AND data_fim;
    
    RETURN QUERY
    SELECT 
        p.forma_pagamento,
        COUNT(p.id) as total_transacoes,
        SUM(p.valor) as valor_total,
        CASE 
            WHEN total_geral > 0 THEN ROUND((SUM(p.valor) / total_geral * 100), 2)
            ELSE 0
        END as percentual
    FROM pagamentos p
    JOIN vendas v ON p.venda_id = v.id
    WHERE DATE(v.data_venda) BETWEEN data_inicio AND data_fim
    GROUP BY p.forma_pagamento
    ORDER BY valor_total DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÕES DE GESTÃO DE ESTOQUE
-- =====================================================

-- Função para atualizar estoque
CREATE OR REPLACE FUNCTION update_stock(
    produto_id UUID,
    quantidade INTEGER,
    operacao TEXT -- 'add' ou 'subtract'
)
RETURNS BOOLEAN AS $$
DECLARE
    estoque_atual INTEGER;
BEGIN
    SELECT estoque INTO estoque_atual
    FROM produtos
    WHERE id = produto_id;
    
    IF estoque_atual IS NULL THEN
        RAISE EXCEPTION 'Produto não encontrado';
    END IF;
    
    IF operacao = 'subtract' AND estoque_atual < quantidade THEN
        RAISE EXCEPTION 'Estoque insuficiente. Disponível: %, Solicitado: %', estoque_atual, quantidade;
    END IF;
    
    UPDATE produtos
    SET estoque = CASE 
        WHEN operacao = 'add' THEN estoque + quantidade
        WHEN operacao = 'subtract' THEN estoque - quantidade
        ELSE estoque
    END,
    data_atualizacao = NOW()
    WHERE id = produto_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Função para produtos com estoque baixo
CREATE OR REPLACE FUNCTION produtos_estoque_baixo(
    limite INTEGER DEFAULT 5
)
RETURNS TABLE(
    id UUID,
    nome TEXT,
    estoque_atual INTEGER,
    categoria TEXT,
    preco DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.nome, p.estoque, p.categoria, p.preco
    FROM produtos p
    WHERE p.ativo = true AND p.estoque <= limite
    ORDER BY p.estoque ASC, p.nome;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÕES DE COMISSÕES
-- =====================================================

-- Função para calcular comissões em lote
CREATE OR REPLACE FUNCTION calcular_comissoes_periodo(
    data_inicio DATE,
    data_fim DATE
)
RETURNS INTEGER AS $$
DECLARE
    vendas_cursor CURSOR FOR 
        SELECT v.id, v.funcionario_id, v.valor_final, f.percentual_comissao
        FROM vendas v
        JOIN funcionarios f ON v.funcionario_id = f.id
        WHERE DATE(v.data_venda) BETWEEN data_inicio AND data_fim
          AND NOT EXISTS (SELECT 1 FROM comissoes c WHERE c.venda_id = v.id);
    
    venda_record RECORD;
    comissoes_criadas INTEGER := 0;
BEGIN
    FOR venda_record IN vendas_cursor LOOP
        INSERT INTO comissoes (
            funcionario_id, venda_id, valor_base, 
            percentual, valor_comissao
        )
        VALUES (
            venda_record.funcionario_id,
            venda_record.id,
            venda_record.valor_final,
            venda_record.percentual_comissao,
            venda_record.valor_final * (venda_record.percentual_comissao / 100)
        );
        
        comissoes_criadas := comissoes_criadas + 1;
    END LOOP;
    
    RETURN comissoes_criadas;
END;
$$ LANGUAGE plpgsql;

-- Função para marcar comissões como pagas
CREATE OR REPLACE FUNCTION pagar_comissoes(
    funcionario_id UUID,
    mes INTEGER,
    ano INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    comissoes_pagas INTEGER;
BEGIN
    UPDATE comissoes
    SET pago = true,
        data_pagamento = NOW(),
        observacoes = COALESCE(observacoes, '') || ' Pago em ' || NOW()::DATE
    WHERE funcionario_id = pagar_comissoes.funcionario_id
      AND pago = false
      AND EXTRACT(MONTH FROM data_calculo) = mes
      AND EXTRACT(YEAR FROM data_calculo) = ano;
    
    GET DIAGNOSTICS comissoes_pagas = ROW_COUNT;
    
    RETURN comissoes_pagas;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÕES DE BACKUP E MANUTENÇÃO
-- =====================================================

-- Função para limpeza de dados antigos
CREATE OR REPLACE FUNCTION cleanup_old_data(
    dias_manter INTEGER DEFAULT 365
)
RETURNS TEXT AS $$
DECLARE
    data_limite TIMESTAMP WITH TIME ZONE;
    registros_removidos INTEGER := 0;
    resultado TEXT := '';
BEGIN
    data_limite := NOW() - (dias_manter || ' days')::INTERVAL;
    
    -- Remover atividades antigas
    DELETE FROM atividades_recentes 
    WHERE data_atividade < data_limite;
    GET DIAGNOSTICS registros_removidos = ROW_COUNT;
    resultado := resultado || 'Atividades removidas: ' || registros_removidos || E'\n';
    
    -- Remover logs de auditoria antigos
    DELETE FROM audit_logs 
    WHERE timestamp < data_limite;
    GET DIAGNOSTICS registros_removidos = ROW_COUNT;
    resultado := resultado || 'Logs de auditoria removidos: ' || registros_removidos || E'\n';
    
    -- Arquivar agendamentos muito antigos cancelados
    UPDATE agendamentos 
    SET observacoes = COALESCE(observacoes, '') || ' [ARQUIVADO]'
    WHERE data_agendamento < data_limite 
      AND status IN ('cancelado', 'nao_compareceu')
      AND observacoes NOT LIKE '%[ARQUIVADO]%';
    GET DIAGNOSTICS registros_removidos = ROW_COUNT;
    resultado := resultado || 'Agendamentos arquivados: ' || registros_removidos || E'\n';
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql;

-- Função para estatísticas do sistema
CREATE OR REPLACE FUNCTION system_stats()
RETURNS TABLE(
    tabela TEXT,
    total_registros BIGINT,
    registros_ativos BIGINT,
    ultimo_registro TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'funcionarios'::TEXT, 
           COUNT(*)::BIGINT, 
           COUNT(*) FILTER (WHERE ativo = true)::BIGINT,
           MAX(data_criacao)
    FROM funcionarios
    UNION ALL
    SELECT 'clientes'::TEXT, 
           COUNT(*)::BIGINT, 
           COUNT(*) FILTER (WHERE ativo = true)::BIGINT,
           MAX(data_criacao)
    FROM clientes
    UNION ALL
    SELECT 'agendamentos'::TEXT, 
           COUNT(*)::BIGINT, 
           COUNT(*) FILTER (WHERE status NOT IN ('cancelado', 'nao_compareceu'))::BIGINT,
           MAX(data_criacao)
    FROM agendamentos
    UNION ALL
    SELECT 'vendas'::TEXT, 
           COUNT(*)::BIGINT, 
           COUNT(*)::BIGINT,
           MAX(data_criacao)
    FROM vendas
    UNION ALL
    SELECT 'produtos'::TEXT, 
           COUNT(*)::BIGINT, 
           COUNT(*) FILTER (WHERE ativo = true)::BIGINT,
           MAX(data_criacao)
    FROM produtos;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

-- Comentários nas funções principais
COMMENT ON FUNCTION login_funcionario(TEXT, TEXT) IS 'Autentica funcionário e retorna dados básicos';
COMMENT ON FUNCTION create_funcionario_credentials(UUID, TEXT, TEXT) IS 'Cria credenciais seguras para funcionário';
COMMENT ON FUNCTION check_availability(UUID, TIMESTAMP WITH TIME ZONE, INTEGER) IS 'Verifica disponibilidade de horário para agendamento';
COMMENT ON FUNCTION finalizar_corte(UUID, JSONB, JSONB, JSONB, DECIMAL, TEXT) IS 'Finaliza corte criando venda completa com itens e pagamentos';
COMMENT ON FUNCTION relatorio_vendas(DATE, DATE, UUID) IS 'Gera relatório de vendas por período e funcionário';
COMMENT ON FUNCTION ranking_funcionarios(INTEGER, INTEGER) IS 'Ranking de performance dos funcionários por mês';
COMMENT ON FUNCTION cleanup_old_data(INTEGER) IS 'Remove dados antigos para manutenção do banco';

-- Grants de execução para as funções (ajustar conforme necessário)
GRANT EXECUTE ON FUNCTION login_funcionario(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_funcionario_credentials(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_availability(UUID, TIMESTAMP WITH TIME ZONE, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION finalizar_corte(UUID, JSONB, JSONB, JSONB, DECIMAL, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION relatorio_vendas(DATE, DATE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION ranking_funcionarios(INTEGER, INTEGER) TO authenticated;

-- =====================================================
-- EXEMPLO DE USO DAS FUNÇÕES
-- =====================================================

/*
-- Exemplo 1: Login de funcionário
SELECT * FROM login_funcionario('48933002321', 'matheus2025');

-- Exemplo 2: Verificar disponibilidade
SELECT check_availability(
    'uuid-do-funcionario',
    '2025-01-20 14:00:00+00',
    30
);

-- Exemplo 3: Criar agendamento seguro
SELECT create_agendamento_safe(
    'uuid-do-cliente',
    'uuid-do-funcionario', 
    'uuid-do-servico',
    '2025-01-20 14:00:00+00',
    'Cliente preferencial'
);

-- Exemplo 4: Finalizar corte com produtos extras
SELECT finalizar_corte(
    'uuid-do-agendamento',
    '[]'::JSONB, -- sem serviços extras
    '[{"id": "uuid-produto", "quantidade": 1, "preco": 35.00}]'::JSONB,
    '[{"forma_pagamento": "pix", "valor": 60.00}]'::JSONB,
    0.00, -- sem desconto
    'Cliente satisfeito'
);

-- Exemplo 5: Relatório de vendas do mês
SELECT * FROM relatorio_vendas('2025-01-01', '2025-01-31');

-- Exemplo 6: Ranking do mês atual
SELECT * FROM ranking_funcionarios(1, 2025);

-- Exemplo 7: Produtos com estoque baixo
SELECT * FROM produtos_estoque_baixo(10);

-- Exemplo 8: Estatísticas do sistema
SELECT * FROM system_stats();
*/