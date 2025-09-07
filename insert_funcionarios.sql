-- =====================================================
-- INSERÇÃO DOS FUNCIONÁRIOS INICIAIS
-- Sistema de Gestão para Barbearia MV 2025
-- =====================================================

-- Inserir funcionários na tabela funcionarios
INSERT INTO funcionarios (nome, telefone, cargo, percentual_comissao, ativo) VALUES
('Matheus', '48933002321', 'gerente', 15.00, true),
('Vitor', '48991199474', 'gerente', 15.00, true),
('Marcelo', '48996201178', 'gerente', 15.00, true),
('Alisson', '48988768443', 'barbeiro', 50.00, true);

-- Inserir credenciais usando a função create_funcionario_credentials
-- Matheus
SELECT create_funcionario_credentials(
    (SELECT id FROM funcionarios WHERE telefone = '48933002321'),
    '48933002321',
    'matheus2025'
);

-- Vitor
SELECT create_funcionario_credentials(
    (SELECT id FROM funcionarios WHERE telefone = '48991199474'),
    '48991199474',
    'vitor2025'
);

-- Marcelo
SELECT create_funcionario_credentials(
    (SELECT id FROM funcionarios WHERE telefone = '48996201178'),
    '48996201178',
    'marcelo2025'
);

-- Alisson
SELECT create_funcionario_credentials(
    (SELECT id FROM funcionarios WHERE telefone = '48988768443'),
    '48988768443',
    'alisson2025'
);

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