// =====================================================
// CONFIGURAÇÃO DO CLIENTE SUPABASE
// Sistema de Gestão para Barbearia MV 2025
// =====================================================

// Importar Supabase (CDN)
// Adicione no HTML: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// Configurações do Supabase
const SUPABASE_CONFIG = {
    url: 'SUA_URL_DO_SUPABASE', // Substitua pela URL do seu projeto
    anonKey: 'SUA_CHAVE_ANON_DO_SUPABASE' // Substitua pela chave anon do seu projeto
};

// Inicializar cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

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