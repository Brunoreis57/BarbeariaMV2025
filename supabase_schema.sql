-- =====================================================
-- ESQUEMA COMPLETO DO BANCO DE DADOS SUPABASE
-- Sistema de Gestão para Barbearia MV 2025
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de Funcionários
CREATE TABLE funcionarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE,
    cargo VARCHAR(50) NOT NULL CHECK (cargo IN ('barbeiro', 'gerente', 'recepcionista')),
    percentual_comissao DECIMAL(5,2) DEFAULT 0.00,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Credenciais dos Funcionários
CREATE TABLE funcionario_credenciais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    funcionario_id UUID NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    ativo BOOLEAN DEFAULT true,
    ultimo_login TIMESTAMP WITH TIME ZONE,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Clientes
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    data_nascimento DATE,
    endereco TEXT,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Serviços
CREATE TABLE servicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    duracao_minutos INTEGER NOT NULL DEFAULT 30,
    ativo BOOLEAN DEFAULT true,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Produtos
CREATE TABLE produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    estoque INTEGER DEFAULT 0,
    categoria VARCHAR(50),
    ativo BOOLEAN DEFAULT true,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Agendamentos
CREATE TABLE agendamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID REFERENCES clientes(id),
    funcionario_id UUID REFERENCES funcionarios(id),
    servico_id UUID NOT NULL REFERENCES servicos(id),
    data_agendamento TIMESTAMP WITH TIME ZONE NOT NULL,
    data_fim TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'agendado' CHECK (status IN ('agendado', 'em_andamento', 'concluido', 'cancelado', 'nao_compareceu')),
    observacoes TEXT,
    valor_servico DECIMAL(10,2),
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELAS DE TRANSAÇÕES FINANCEIRAS
-- =====================================================

-- Tabela de Vendas (Cortes Finalizados)
CREATE TABLE vendas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agendamento_id UUID REFERENCES agendamentos(id),
    cliente_id UUID REFERENCES clientes(id),
    funcionario_id UUID NOT NULL REFERENCES funcionarios(id),
    data_venda TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valor_total DECIMAL(10,2) NOT NULL,
    desconto DECIMAL(10,2) DEFAULT 0.00,
    valor_final DECIMAL(10,2) NOT NULL,
    observacoes TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Itens da Venda (Serviços e Produtos)
CREATE TABLE venda_itens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
    tipo_item VARCHAR(20) NOT NULL CHECK (tipo_item IN ('servico', 'produto')),
    item_id UUID NOT NULL, -- Referência para servicos.id ou produtos.id
    quantidade INTEGER DEFAULT 1,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Pagamentos
CREATE TABLE pagamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
    forma_pagamento VARCHAR(20) NOT NULL CHECK (forma_pagamento IN ('dinheiro', 'pix', 'cartao_debito', 'cartao_credito')),
    valor DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
    data_pagamento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    observacoes TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Comissões
CREATE TABLE comissoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    funcionario_id UUID NOT NULL REFERENCES funcionarios(id),
    venda_id UUID NOT NULL REFERENCES vendas(id),
    valor_base DECIMAL(10,2) NOT NULL,
    percentual DECIMAL(5,2) NOT NULL,
    valor_comissao DECIMAL(10,2) NOT NULL,
    data_calculo TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pago BOOLEAN DEFAULT false,
    data_pagamento TIMESTAMP WITH TIME ZONE,
    observacoes TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELAS DE CONTROLE E AUDITORIA
-- =====================================================

-- Tabela de Dados Diários (Resumos)
CREATE TABLE dados_diarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_referencia DATE NOT NULL UNIQUE,
    total_vendas DECIMAL(10,2) DEFAULT 0.00,
    total_cortes INTEGER DEFAULT 0,
    total_comissoes DECIMAL(10,2) DEFAULT 0.00,
    lucro_liquido DECIMAL(10,2) DEFAULT 0.00,
    pagamentos_dinheiro DECIMAL(10,2) DEFAULT 0.00,
    pagamentos_pix DECIMAL(10,2) DEFAULT 0.00,
    pagamentos_cartao DECIMAL(10,2) DEFAULT 0.00,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Atividades Recentes
CREATE TABLE atividades_recentes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    funcionario_id UUID REFERENCES funcionarios(id),
    data_atividade TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadados JSONB
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para funcionários
CREATE INDEX idx_funcionarios_ativo ON funcionarios(ativo);
CREATE INDEX idx_funcionarios_cargo ON funcionarios(cargo);

-- Índices para credenciais
CREATE INDEX idx_funcionario_credenciais_usuario ON funcionario_credenciais(usuario);
CREATE INDEX idx_funcionario_credenciais_ativo ON funcionario_credenciais(ativo);

-- Índices para clientes
CREATE INDEX idx_clientes_nome ON clientes(nome);
CREATE INDEX idx_clientes_telefone ON clientes(telefone);
CREATE INDEX idx_clientes_ativo ON clientes(ativo);

-- Índices para agendamentos
CREATE INDEX idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);
CREATE INDEX idx_agendamentos_funcionario ON agendamentos(funcionario_id);
CREATE INDEX idx_agendamentos_cliente ON agendamentos(cliente_id);

-- Índices para vendas
CREATE INDEX idx_vendas_data ON vendas(data_venda);
CREATE INDEX idx_vendas_funcionario ON vendas(funcionario_id);
CREATE INDEX idx_vendas_cliente ON vendas(cliente_id);

-- Índices para pagamentos
CREATE INDEX idx_pagamentos_forma ON pagamentos(forma_pagamento);
CREATE INDEX idx_pagamentos_status ON pagamentos(status);
CREATE INDEX idx_pagamentos_data ON pagamentos(data_pagamento);

-- Índices para comissões
CREATE INDEX idx_comissoes_funcionario ON comissoes(funcionario_id);
CREATE INDEX idx_comissoes_pago ON comissoes(pago);
CREATE INDEX idx_comissoes_data ON comissoes(data_calculo);

-- Índices para dados diários
CREATE INDEX idx_dados_diarios_data ON dados_diarios(data_referencia);

-- Índices para atividades
CREATE INDEX idx_atividades_data ON atividades_recentes(data_atividade);
CREATE INDEX idx_atividades_tipo ON atividades_recentes(tipo);

-- =====================================================
-- TRIGGERS E FUNÇÕES
-- =====================================================

-- Função para atualizar timestamp de atualização
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar data_atualizacao
CREATE TRIGGER update_funcionarios_updated_at BEFORE UPDATE ON funcionarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_funcionario_credenciais_updated_at BEFORE UPDATE ON funcionario_credenciais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_servicos_updated_at BEFORE UPDATE ON servicos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agendamentos_updated_at BEFORE UPDATE ON agendamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dados_diarios_updated_at BEFORE UPDATE ON dados_diarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular comissão automaticamente
CREATE OR REPLACE FUNCTION calcular_comissao()
RETURNS TRIGGER AS $$
DECLARE
    percentual_func DECIMAL(5,2);
BEGIN
    -- Buscar percentual de comissão do funcionário
    SELECT percentual_comissao INTO percentual_func 
    FROM funcionarios 
    WHERE id = NEW.funcionario_id;
    
    -- Inserir comissão
    INSERT INTO comissoes (funcionario_id, venda_id, valor_base, percentual, valor_comissao)
    VALUES (
        NEW.funcionario_id,
        NEW.id,
        NEW.valor_final,
        percentual_func,
        NEW.valor_final * (percentual_func / 100)
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para calcular comissão após inserir venda
CREATE TRIGGER trigger_calcular_comissao 
    AFTER INSERT ON vendas 
    FOR EACH ROW 
    EXECUTE FUNCTION calcular_comissao();

-- Função para atualizar dados diários
CREATE OR REPLACE FUNCTION atualizar_dados_diarios()
RETURNS TRIGGER AS $$
DECLARE
    data_ref DATE;
    total_vendas_dia DECIMAL(10,2);
    total_cortes_dia INTEGER;
    total_comissoes_dia DECIMAL(10,2);
    lucro_dia DECIMAL(10,2);
    pag_dinheiro DECIMAL(10,2);
    pag_pix DECIMAL(10,2);
    pag_cartao DECIMAL(10,2);
BEGIN
    data_ref := DATE(NEW.data_venda);
    
    -- Calcular totais do dia
    SELECT 
        COALESCE(SUM(valor_final), 0),
        COUNT(*)
    INTO total_vendas_dia, total_cortes_dia
    FROM vendas 
    WHERE DATE(data_venda) = data_ref;
    
    -- Calcular comissões do dia
    SELECT COALESCE(SUM(valor_comissao), 0)
    INTO total_comissoes_dia
    FROM comissoes c
    JOIN vendas v ON c.venda_id = v.id
    WHERE DATE(v.data_venda) = data_ref;
    
    -- Calcular pagamentos por forma
    SELECT 
        COALESCE(SUM(CASE WHEN forma_pagamento = 'dinheiro' THEN valor ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN forma_pagamento = 'pix' THEN valor ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN forma_pagamento IN ('cartao_debito', 'cartao_credito') THEN valor ELSE 0 END), 0)
    INTO pag_dinheiro, pag_pix, pag_cartao
    FROM pagamentos p
    JOIN vendas v ON p.venda_id = v.id
    WHERE DATE(v.data_venda) = data_ref;
    
    lucro_dia := total_vendas_dia - total_comissoes_dia;
    
    -- Inserir ou atualizar dados diários
    INSERT INTO dados_diarios (
        data_referencia, total_vendas, total_cortes, total_comissoes, 
        lucro_liquido, pagamentos_dinheiro, pagamentos_pix, pagamentos_cartao
    ) VALUES (
        data_ref, total_vendas_dia, total_cortes_dia, total_comissoes_dia,
        lucro_dia, pag_dinheiro, pag_pix, pag_cartao
    )
    ON CONFLICT (data_referencia) DO UPDATE SET
        total_vendas = EXCLUDED.total_vendas,
        total_cortes = EXCLUDED.total_cortes,
        total_comissoes = EXCLUDED.total_comissoes,
        lucro_liquido = EXCLUDED.lucro_liquido,
        pagamentos_dinheiro = EXCLUDED.pagamentos_dinheiro,
        pagamentos_pix = EXCLUDED.pagamentos_pix,
        pagamentos_cartao = EXCLUDED.pagamentos_cartao,
        data_atualizacao = NOW();
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar dados diários após inserir venda
CREATE TRIGGER trigger_atualizar_dados_diarios 
    AFTER INSERT ON vendas 
    FOR EACH ROW 
    EXECUTE FUNCTION atualizar_dados_diarios();

-- =====================================================
-- DADOS INICIAIS (SEED DATA)
-- =====================================================

-- Inserir funcionários padrão
INSERT INTO funcionarios (nome, telefone, email, cargo, percentual_comissao, observacoes) VALUES
('Matheus', '(48) 93300-2321', 'matheus@barbearia.com', 'gerente', 50.0, 'Administrador'),
('Vitor', '(48) 99119-9474', 'vitor@barbearia.com', 'gerente', 50.0, 'Administrador'),
('Marcelo', '(48) 99620-1178', 'marcelo@barbearia.com', 'gerente', 50.0, 'Administrador');

-- Inserir credenciais dos funcionários
INSERT INTO funcionario_credenciais (funcionario_id, usuario, senha_hash) 
SELECT 
    f.id,
    CASE 
        WHEN f.nome = 'Matheus' THEN '48933002321'
        WHEN f.nome = 'Vitor' THEN '48991199474'
        WHEN f.nome = 'Marcelo' THEN '48996201178'
    END,
    CASE 
        WHEN f.nome = 'Matheus' THEN crypt('matheus2025', gen_salt('bf'))
        WHEN f.nome = 'Vitor' THEN crypt('vitor2025', gen_salt('bf'))
        WHEN f.nome = 'Marcelo' THEN crypt('marcelo2025', gen_salt('bf'))
    END
FROM funcionarios f;

-- Inserir serviços padrão
INSERT INTO servicos (nome, descricao, preco, duracao_minutos) VALUES
('Corte Masculino', 'Corte tradicional masculino com acabamento', 25.00, 30),
('Barba Completa', 'Aparar e modelar barba com navalha', 20.00, 25),
('Corte + Barba', 'Pacote completo: corte de cabelo e barba', 40.00, 50),
('Corte Infantil', 'Corte especial para crianças até 12 anos', 20.00, 25),
('Sobrancelha', 'Design e limpeza de sobrancelhas', 15.00, 15);

-- Inserir produtos padrão
INSERT INTO produtos (nome, descricao, preco, estoque, categoria) VALUES
('Pomada Modeladora', 'Pomada para modelar e fixar o cabelo', 35.00, 15, 'cabelo'),
('Óleo para Barba', 'Óleo hidratante para barba', 28.00, 8, 'barba'),
('Shampoo Anticaspa', 'Shampoo especial para combater a caspa', 22.00, 12, 'cabelo'),
('Cera Modeladora', 'Cera para fixação e brilho', 30.00, 10, 'cabelo'),
('Balm para Barba', 'Hidratante e modelador para barba', 25.00, 6, 'barba');

-- =====================================================
-- POLÍTICAS DE SEGURANÇA RLS
-- =====================================================

-- Habilitar RLS nas tabelas principais
ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE funcionario_credenciais ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venda_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comissoes ENABLE ROW LEVEL SECURITY;

-- Políticas para funcionários (apenas gerentes podem ver todos)
CREATE POLICY "Funcionarios podem ver próprios dados" ON funcionarios
    FOR ALL USING (auth.uid()::text = id::text OR 
                   EXISTS (SELECT 1 FROM funcionarios f 
                          JOIN funcionario_credenciais fc ON f.id = fc.funcionario_id 
                          WHERE fc.usuario = auth.jwt() ->> 'sub' AND f.cargo = 'gerente'));

-- Políticas para agendamentos (funcionários veem seus próprios)
CREATE POLICY "Funcionarios podem ver próprios agendamentos" ON agendamentos
    FOR ALL USING (funcionario_id::text = auth.uid()::text OR 
                   EXISTS (SELECT 1 FROM funcionarios f 
                          JOIN funcionario_credenciais fc ON f.id = fc.funcionario_id 
                          WHERE fc.usuario = auth.jwt() ->> 'sub' AND f.cargo = 'gerente'));

-- Políticas para vendas (funcionários veem suas próprias)
CREATE POLICY "Funcionarios podem ver próprias vendas" ON vendas
    FOR ALL USING (funcionario_id::text = auth.uid()::text OR 
                   EXISTS (SELECT 1 FROM funcionarios f 
                          JOIN funcionario_credenciais fc ON f.id = fc.funcionario_id 
                          WHERE fc.usuario = auth.jwt() ->> 'sub' AND f.cargo = 'gerente'));

-- Políticas para comissões (funcionários veem suas próprias)
CREATE POLICY "Funcionarios podem ver próprias comissoes" ON comissoes
    FOR ALL USING (funcionario_id::text = auth.uid()::text OR 
                   EXISTS (SELECT 1 FROM funcionarios f 
                          JOIN funcionario_credenciais fc ON f.id = fc.funcionario_id 
                          WHERE fc.usuario = auth.jwt() ->> 'sub' AND f.cargo = 'gerente'));

-- =====================================================
-- VIEWS ÚTEIS PARA RELATÓRIOS
-- =====================================================

-- View para relatório de vendas diárias
CREATE VIEW vw_vendas_diarias AS
SELECT 
    DATE(v.data_venda) as data,
    COUNT(*) as total_vendas,
    SUM(v.valor_final) as receita_total,
    SUM(c.valor_comissao) as total_comissoes,
    SUM(v.valor_final) - SUM(c.valor_comissao) as lucro_liquido,
    f.nome as funcionario
FROM vendas v
JOIN funcionarios f ON v.funcionario_id = f.id
LEFT JOIN comissoes c ON v.id = c.venda_id
GROUP BY DATE(v.data_venda), f.id, f.nome
ORDER BY data DESC;

-- View para ranking de funcionários
CREATE VIEW vw_ranking_funcionarios AS
SELECT 
    f.nome,
    COUNT(v.id) as total_vendas,
    SUM(v.valor_final) as receita_gerada,
    SUM(c.valor_comissao) as total_comissoes,
    AVG(v.valor_final) as ticket_medio
FROM funcionarios f
LEFT JOIN vendas v ON f.id = v.funcionario_id
LEFT JOIN comissoes c ON v.id = c.venda_id
WHERE f.ativo = true
GROUP BY f.id, f.nome
ORDER BY receita_gerada DESC;

-- View para serviços mais vendidos
CREATE VIEW vw_servicos_populares AS
SELECT 
    s.nome,
    s.preco,
    COUNT(vi.id) as quantidade_vendida,
    SUM(vi.subtotal) as receita_total
FROM servicos s
JOIN venda_itens vi ON s.id = vi.item_id AND vi.tipo_item = 'servico'
JOIN vendas v ON vi.venda_id = v.id
GROUP BY s.id, s.nome, s.preco
ORDER BY quantidade_vendida DESC;

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================

-- Este esquema fornece:
-- 1. Estrutura completa para gestão de funcionários, clientes, serviços e agendamentos
-- 2. Sistema de vendas e pagamentos robusto
-- 3. Cálculo automático de comissões
-- 4. Controle de dados diários para relatórios
-- 5. Políticas de segurança RLS
-- 6. Índices para performance otimizada
-- 7. Triggers para automação de processos
-- 8. Views para relatórios gerenciais

-- Para usar este esquema:
-- 1. Execute este script no seu projeto Supabase
-- 2. Configure as políticas de autenticação conforme necessário
-- 3. Ajuste as permissões de acordo com seus requisitos de segurança
-- 4. Implemente as APIs no frontend para interagir com estas tabelas

COMMENT ON SCHEMA public IS 'Esquema completo para Sistema de Gestão de Barbearia MV 2025';