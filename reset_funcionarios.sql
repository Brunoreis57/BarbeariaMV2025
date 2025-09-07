-- =====================================================
-- SCRIPT PARA RESETAR FUNCIONÁRIOS (USAR COM CUIDADO)
-- Sistema de Gestão para Barbearia MV 2025
-- =====================================================

-- ATENÇÃO: Este script remove TODOS os funcionários e credenciais
-- Use apenas se precisar resetar completamente o banco

-- Remover todas as credenciais de funcionários
DELETE FROM funcionario_credenciais;

-- Remover todos os funcionários
DELETE FROM funcionarios;

-- Resetar sequências (se necessário)
-- ALTER SEQUENCE funcionarios_id_seq RESTART WITH 1;
-- ALTER SEQUENCE funcionario_credenciais_id_seq RESTART WITH 1;

-- Verificar se as tabelas estão vazias
SELECT 'funcionarios' as tabela, COUNT(*) as total FROM funcionarios
UNION ALL
SELECT 'funcionario_credenciais' as tabela, COUNT(*) as total FROM funcionario_credenciais;

SELECT '✅ Tabelas resetadas com sucesso!' as status;