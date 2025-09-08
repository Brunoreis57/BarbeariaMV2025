// =====================================================
// CONFIGURAÇÃO DO CLIENTE SUPABASE
// Sistema de Gestão para Barbearia MV 2025
// =====================================================

// Importar Supabase (CDN)
// Adicione no HTML: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// Configurações do Supabase
const SUPABASE_CONFIG = {
    url: 'https://pukpemqxegjnimfjhbfd.supabase.co', // Substitua pela URL do seu projeto
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1a3BlbXF4ZWdqbmltZmpoYmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNzUzODEsImV4cCI6MjA3Mjg1MTM4MX0.1Qz88NDo8us9md-7tnNFcuUG088itgXtVL8wxLmjCUw' // Substitua pela chave anon do seu projeto
};

// Inicializar cliente Supabase com verificações de segurança
let supabase = null;

// Função para inicializar o Supabase de forma segura
function initializeSupabase() {
    try {
        if (typeof window.supabase === 'undefined') {
            console.warn('⚠️ Supabase não carregado ainda');
            return false;
        }
        
        if (typeof window.supabase.createClient !== 'function') {
            console.warn('⚠️ createClient não é uma função');
            return false;
        }
        
        supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        
        if (!supabase) {
            console.error('❌ Falha ao criar cliente Supabase');
            return false;
        }
        
        console.log('✅ Cliente Supabase inicializado com sucesso');
        return true;
    } catch (error) {
        console.error('❌ Erro ao inicializar Supabase:', error);
        return false;
    }
}

// Tentar inicializar imediatamente
if (!initializeSupabase()) {
    // Se falhar, tentar novamente após um delay
    setTimeout(() => {
        if (!initializeSupabase()) {
            console.error('❌ Falha definitiva na inicialização do Supabase');
        }
    }, 1000);
}

// =====================================================
// FUNÇÕES DE AUTENTICAÇÃO
// =====================================================

/**
 * Fazer login de funcionário
 * @param {string} usuario - Nome de usuário (telefone)
 * @param {string} senha - Senha do funcionário
 * @returns {Promise<Object>} Resultado do login
 */
async function loginFuncionario(usuario, senha) {
    try {
        // Verificar se o Supabase está inicializado
        if (!supabase) {
            console.warn('⚠️ Supabase não inicializado, tentando inicializar...');
            if (!initializeSupabase()) {
                throw new Error('Supabase não disponível');
            }
        }
        
        // Verificar se a função RPC existe
        if (typeof supabase.rpc !== 'function') {
            throw new Error('Função RPC não disponível no cliente Supabase');
        }
        
        const { data, error } = await supabase.rpc('login_funcionario', {
            usuario_input: usuario,
            senha_input: senha
        });

        if (error) {
            console.error('Erro no login:', error);
            return { success: false, error: error.message };
        }

        if (data && data.length > 0 && data[0].success) {
            const funcionario = data[0];
            
            // Salvar dados do funcionário no localStorage
            const funcionarioData = {
                id: funcionario.id,
                nome: funcionario.nome,
                cargo: funcionario.cargo,
                percentual_comissao: funcionario.percentual_comissao,
                loginTime: new Date().toISOString()
            };
            
            localStorage.setItem('currentUser', JSON.stringify(funcionarioData));
            
            return {
                success: true,
                funcionario: funcionarioData
            };
        } else {
            return {
                success: false,
                error: 'Credenciais inválidas'
            };
        }
    } catch (error) {
        console.error('Erro na autenticação:', error);
        return {
            success: false,
            error: 'Erro de conexão com o servidor'
        };
    }
}

/**
 * Verificar se o usuário está logado
 * @returns {Object|null} Dados do usuário logado ou null
 */
function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        try {
            return JSON.parse(userData);
        } catch (error) {
            console.error('Erro ao recuperar dados do usuário:', error);
            localStorage.removeItem('currentUser');
            return null;
        }
    }
    return null;
}

/**
 * Fazer logout
 */
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('rememberUser');
    window.location.href = 'index.html';
}

/**
 * Verificar se o usuário tem permissão para acessar uma funcionalidade
 * @param {string} cargo - Cargo necessário
 * @returns {boolean} True se tem permissão
 */
function hasPermission(cargo) {
    const user = getCurrentUser();
    if (!user) return false;
    
    const permissions = {
        'gerente': ['gerente'],
        'barbeiro': ['gerente', 'barbeiro'],
        'recepcionista': ['gerente', 'barbeiro', 'recepcionista']
    };
    
    return permissions[cargo] && permissions[cargo].includes(user.cargo);
}

// =====================================================
// FUNÇÕES DE DADOS
// =====================================================

/**
 * Buscar todos os funcionários
 * @returns {Promise<Array>} Lista de funcionários
 */
async function getFuncionarios() {
    try {
        const { data, error } = await supabase
            .from('funcionarios')
            .select(`
                *,
                funcionario_credenciais(usuario, ativo, ultimo_login)
            `)
            .eq('ativo', true)
            .order('nome');

        if (error) {
            console.error('Erro ao buscar funcionários:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Erro na consulta de funcionários:', error);
        return [];
    }
}

/**
 * Buscar todos os clientes
 * @returns {Promise<Array>} Lista de clientes
 */
async function getClientes() {
    try {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('ativo', true)
            .order('nome');

        if (error) {
            console.error('Erro ao buscar clientes:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Erro na consulta de clientes:', error);
        return [];
    }
}

// =====================================================
// INICIALIZAÇÃO
// =====================================================

// Verificar se as configurações estão definidas
if (SUPABASE_CONFIG.url === 'SUA_URL_DO_SUPABASE' || SUPABASE_CONFIG.anonKey === 'SUA_CHAVE_ANON_DO_SUPABASE') {
    console.warn('⚠️ ATENÇÃO: Configure as credenciais do Supabase em js/supabase-client.js');
}

// Exportar funções para uso global
window.SupabaseAuth = {
    login: loginFuncionario,
    getCurrentUser,
    logout,
    hasPermission,
    getFuncionarios,
    getClientes
};

console.log('✅ Cliente Supabase inicializado');