document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Obter valores dos campos
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            const remember = document.getElementById('remember').checked;
            
            // Validar campos
            if (!username) {
                showError('Por favor, insira seu nome de usuário');
                return;
            }
            
            if (!password) {
                showError('Por favor, insira sua senha');
                return;
            }
            
            // Simulação de autenticação (será substituída pela integração com o banco de dados)
            if (username === 'admin' && password === 'admin123') {
                // Salvar no localStorage se a opção "lembrar-me" estiver marcada
                if (remember) {
                    localStorage.setItem('rememberedUser', username);
                } else {
                    localStorage.removeItem('rememberedUser');
                }
                
                // Redirecionar para a página principal (a ser criada)
                showSuccess('Login realizado com sucesso! Redirecionando...');
                setTimeout(() => {
                    // Aqui será o redirecionamento para a página principal
                    alert('Redirecionamento para a página principal (a ser implementada)');
                }, 1500);
            } else {
                showError('Nome de usuário ou senha incorretos');
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