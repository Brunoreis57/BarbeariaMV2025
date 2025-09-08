document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            // Obter valores dos campos
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            const remember = document.getElementById('remember').checked;
            
            console.log('Tentativa de login:', { username, password: '***', remember });
            
            // Validar campos
            if (!username) {
                showError('Por favor, insira seu nome de usuário');
                return;
            }
            
            if (!password) {
                showError('Por favor, insira sua senha');
                return;
            }
            
            // Autenticação com funcionários cadastrados
            const employees = JSON.parse(localStorage.getItem('employees') || '[]');
            console.log('Funcionários no localStorage:', employees.length);
            
            // Se não há funcionários, criar os padrão
            if (employees.length === 0) {
                console.log('Criando funcionários padrão...');
                const defaultEmployees = [
                    {
                        id: 1,
                        name: 'Matheus',
                        phone: '(48) 93300-2321',
                        email: 'matheus@barbearia.com',
                        role: 'gerente',
                        commission: 50.0,
                        notes: 'Administrador',
                        credentials: {
                            username: '48933002321',
                            password: 'matheus2025',
                            active: true
                        },
                        createdAt: '2024-03-01'
                    },
                    {
                        id: 2,
                        name: 'Vitor',
                        phone: '(48) 99119-9474',
                        email: 'vitor@barbearia.com',
                        role: 'gerente',
                        commission: 50.0,
                        notes: 'Administrador',
                        credentials: {
                            username: '48991199474',
                            password: 'vitor2025',
                            active: true
                        },
                        createdAt: '2024-03-05'
                    },
                    {
                        id: 3,
                        name: 'Marcelo',
                        phone: '(48) 99620-1178',
                        email: 'marcelo@barbearia.com',
                        role: 'gerente',
                        commission: 50.0,
                        notes: 'Administrador',
                        credentials: {
                            username: '48996201178',
                            password: 'marcelo2025',
                            active: true
                        },
                        createdAt: '2024-03-10'
                    },
                    {
                        id: 4,
                        name: 'Alisson',
                        phone: '(48) 98876-8443',
                        email: 'alisson@barbearia.com',
                        role: 'barbeiro',
                        commission: 40.0,
                        notes: 'Barbeiro',
                        credentials: {
                            username: '48988768443',
                            password: 'alisson2025',
                            active: true
                        },
                        createdAt: '2024-04-01'
                    }
                ];
                localStorage.setItem('employees', JSON.stringify(defaultEmployees));
            }
            
            // Autenticar usuário (apenas localStorage)
            const authenticatedUser = authenticateUserLocalStorage(username, password);
            
            console.log('Usuário autenticado:', authenticatedUser ? authenticatedUser.name : 'Nenhum');
            
    // Autenticar usuário (apenas localStorage - sem Supabase)
    function authenticateUserLocalStorage(username, password) {
        console.log('🔐 Autenticação LOCAL para:', username);
        console.log('📱 User Agent:', navigator.userAgent);
        console.log('🌐 URL atual:', window.location.href);
        
        // Garantir que os funcionários estão carregados
        let currentEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
        
        // Se não há funcionários, inicializar com dados padrão
        if (currentEmployees.length === 0) {
            console.log('📝 Inicializando funcionários padrão...');
            currentEmployees = [
                {
                    id: 1,
                    name: 'Matheus',
                    phone: '(48) 93300-2321',
                    email: 'matheus@barbearia.com',
                    role: 'gerente',
                    commission: 50.0,
                    notes: 'Administrador',
                    credentials: {
                        username: '48933002321',
                        password: 'matheus2025',
                        active: true
                    },
                    createdAt: '2024-03-01'
                },
                {
                    id: 2,
                    name: 'Vitor',
                    phone: '(48) 99119-9474',
                    email: 'vitor@barbearia.com',
                    role: 'gerente',
                    commission: 50.0,
                    notes: 'Administrador',
                    credentials: {
                        username: '48991199474',
                        password: 'vitor2025',
                        active: true
                    },
                    createdAt: '2024-03-05'
                },
                {
                    id: 3,
                    name: 'Marcelo',
                    phone: '(48) 99620-1178',
                    email: 'marcelo@barbearia.com',
                    role: 'gerente',
                    commission: 50.0,
                    notes: 'Administrador',
                    credentials: {
                        username: '48996201178',
                        password: 'marcelo2025',
                        active: true
                    },
                    createdAt: '2024-03-10'
                },
                {
                    id: 4,
                    name: 'Alisson',
                    phone: '(48) 98876-8443',
                    email: 'alisson@barbearia.com',
                    role: 'barbeiro',
                    commission: 40.0,
                    notes: 'Barbeiro',
                    credentials: {
                        username: '48988768443',
                        password: 'alisson2025',
                        active: true
                    },
                    createdAt: '2024-04-01'
                }
            ];
            localStorage.setItem('employees', JSON.stringify(currentEmployees));
            console.log('✅ Funcionários padrão criados!');
        }
        
        console.log('👥 Total de funcionários:', currentEmployees.length);
        
        // Buscar usuário nas credenciais
        const user = currentEmployees.find(emp => {
            const hasCredentials = emp.credentials && 
                                 emp.credentials.username && 
                                 emp.credentials.password;
            
            if (!hasCredentials) {
                console.log(`❌ ${emp.name}: sem credenciais válidas`);
                return false;
            }
            
            const match = emp.credentials.username === username && 
                         emp.credentials.password === password &&
                         emp.credentials.active === true;
            
            console.log(`🔍 ${emp.name}: username=${emp.credentials.username}, match=${match}`);
            return match;
        });
        
        if (user) {
            console.log('✅ LOGIN REALIZADO COM SUCESSO!');
            console.log('👤 Usuário:', user.name, '| Função:', user.role);
            return user;
        } else {
            console.log('❌ CREDENCIAIS INVÁLIDAS!');
            console.log('📋 Credenciais disponíveis:');
            currentEmployees.forEach(emp => {
                if (emp.credentials) {
                    console.log(`   ${emp.name}: ${emp.credentials.username} / ${emp.credentials.password}`);
                }
            });
            return null;
        }
    }
            
            console.log('Usuário autenticado:', authenticatedUser ? authenticatedUser.name : 'Nenhum');
            
            if (authenticatedUser) {
                // Salvar dados do usuário logado
                localStorage.setItem('currentUser', JSON.stringify({
                    id: authenticatedUser.id,
                    name: authenticatedUser.name,
                    role: authenticatedUser.role,
                    loginTime: new Date().toISOString()
                }));
                
                // Salvar no localStorage se a opção "lembrar-me" estiver marcada
                if (remember) {
                    localStorage.setItem('rememberedUser', username);
                } else {
                    localStorage.removeItem('rememberedUser');
                }
                
                // Detectar se é desktop ou mobile para redirecionamento
                const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                const redirectPage = isMobile ? 'menu.html' : 'dashboard.html';
                
                showSuccess(`Bem-vindo, ${authenticatedUser.name}! Redirecionando...`);
                setTimeout(() => {
                    window.location.href = redirectPage;
                }, 1500);
            } else {
                showError('Número de telefone ou senha incorretos');
            }
        });
    }
    
    // Verificar se há um usuário salvo no localStorage
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        document.getElementById('username').value = rememberedUser;
        document.getElementById('remember').checked = true;
    }
    
    // Função para mostrar mensagem de erro
    function showError(message) {
        // Remover mensagem anterior se existir
        removeMessage();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message error';
        errorDiv.textContent = message;
        
        // Inserir antes do botão de login
        const formContainer = document.querySelector('.form-container');
        formContainer.insertBefore(errorDiv, document.querySelector('.btn-login').parentNode);
        
        // Remover após 3 segundos
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
    
    // Função para mostrar mensagem de sucesso
    function showSuccess(message) {
        // Remover mensagem anterior se existir
        removeMessage();
        
        const successDiv = document.createElement('div');
        successDiv.className = 'message success';
        successDiv.textContent = message;
        
        // Inserir antes do botão de login
        const formContainer = document.querySelector('.form-container');
        formContainer.insertBefore(successDiv, document.querySelector('.btn-login').parentNode);
    }
    
    // Função para remover mensagens existentes
    function removeMessage() {
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
    }
});

// Adicionar estilos para as mensagens
document.addEventListener('DOMContentLoaded', function() {
    // Criar elemento de estilo
    const style = document.createElement('style');
    style.textContent = `
        .message {
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 15px;
            text-align: center;
            font-size: 14px;
        }
        
        .error {
            background-color: rgba(255, 0, 0, 0.2);
            border: 1px solid #ff0000;
            color: #ff0000;
        }
        
        .success {
            background-color: rgba(0, 128, 0, 0.2);
            border: 1px solid #008000;
            color: #00ff00;
        }
    `;
    
    // Adicionar ao head
    document.head.appendChild(style);
});

// Função para alternar visibilidade da senha
function togglePasswordVisibility() {
    const passwordField = document.getElementById('password');
    const toggleIcon = document.getElementById('togglePassword');
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordField.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}