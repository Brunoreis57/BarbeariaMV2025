-- =====================================================
-- INSERÇÃO DOS FUNCIONÁRIOS INICIAIS (COM VERIFICAÇÃO)
-- Sistema de Gestão para Barbearia MV 2025
-- =====================================================

-- Inserir funcionários apenas se não existirem
INSERT INTO funcionarios (nome, telefone, cargo, percentual_comissao, ativo) 
SELECT 'Matheus', '48933002321', 'gerente', 15.00, true
WHERE NOT EXISTS (SELECT 1 FROM funcionarios WHERE telefone = '48933002321');

INSERT INTO funcionarios (nome, telefone, cargo, percentual_comissao, ativo) 
SELECT 'Vitor', '48991199474', 'gerente', 15.00, true
WHERE NOT EXISTS (SELECT 1 FROM funcionarios WHERE telefone = '48991199474');

INSERT INTO funcionarios (nome, telefone, cargo, percentual_comissao, ativo) 
SELECT 'Marcelo', '48996201178', 'gerente', 15.00, true
WHERE NOT EXISTS (SELECT 1 FROM funcionarios WHERE telefone = '48996201178');

INSERT INTO funcionarios (nome, telefone, cargo, percentual_comissao, ativo) 
SELECT 'Alisson', '48988768443', 'barbeiro', 50.00, true
WHERE NOT EXISTS (SELECT 1 FROM funcionarios WHERE telefone = '48988768443');

-- Inserir credenciais apenas se não existirem
-- Matheus
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM funcionario_credenciais WHERE usuario = '48933002321') THEN
        PERFORM create_funcionario_credentials(
            (SELECT id FROM funcionarios WHERE telefone = '48933002321'),
            '48933002321',
            'matheus2025'
        );
    END IF;
END $$;

-- Vitor
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM funcionario_credenciais WHERE usuario = '48991199474') THEN
        PERFORM create_funcionario_credentials(
            (SELECT id FROM funcionarios WHERE telefone = '48991199474'),
            '48991199474',
            'vitor2025'
        );
    END IF;
END $$;

-- Marcelo
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM funcionario_credenciais WHERE usuario = '48996201178') THEN
        PERFORM create_funcionario_credentials(
            (SELECT id FROM funcionarios WHERE telefone = '48996201178'),
            '48996201178',
            'marcelo2025'
        );
    END IF;
END $$;

-- Alisson
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM funcionario_credenciais WHERE usuario = '48988768443') THEN
        PERFORM create_funcionario_credentials(
            (SELECT id FROM funcionarios WHERE telefone = '48988768443'),
            '48988768443',
            'alisson2025'
        );
    END IF;
END $$;

-- Verificar se os dados foram inseridos corretamente
SELECT 
    f.nome,
    f.telefone,
    f.cargo,
    f.percentual_comissao,
    fc.usuario,
    f.ativo
FROM funcionarios f
JOIN funcionario_credenciais fc ON f.id = fc.funcionario_id
ORDER BY f.nome;

-- Testar login (opcional - para verificação)
-- SELECT * FROM login_funcionario('48933002321', 'matheus2025');
-- SELECT * FROM login_funcionario('48991199474', 'vitor2025');
-- SELECT * FROM login_funcionario('48996201178', 'marcelo2025');
-- SELECT * FROM login_funcionario('48988768443', 'alisson2025');