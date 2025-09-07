// Inicialização automática de usuários padrão
// Este arquivo garante que os usuários existam mesmo em produção

(function() {
    'use strict';
    
    // Função para criar usuários padrão
    function createDefaultUsers() {
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
        
        try {
            // Verificar se localStorage está disponível
            if (typeof Storage !== 'undefined') {
                const existingEmployees = localStorage.getItem('employees');
                
                // Se não há funcionários ou está vazio, criar os padrão
                if (!existingEmployees || JSON.parse(existingEmployees).length === 0) {
                    localStorage.setItem('employees', JSON.stringify(defaultEmployees));
                    console.log('✅ Usuários padrão criados com sucesso!');
                    console.log('📋 Usuários disponíveis:', defaultEmployees.map(emp => `${emp.name} (${emp.credentials.username})`));
                } else {
                    console.log('✅ Usuários já existem no localStorage');
                }
            } else {
                console.warn('⚠️ localStorage não está disponível');
            }
        } catch (error) {
            console.error('❌ Erro ao criar usuários padrão:', error);
        }
    }
    
    // Função para verificar e exibir usuários
    function debugUsers() {
        try {
            const employees = JSON.parse(localStorage.getItem('employees') || '[]');
            console.log('🔍 Debug - Total de usuários:', employees.length);
            employees.forEach(emp => {
                console.log(`👤 ${emp.name}: ${emp.credentials.username} (${emp.role})`);
            });
        } catch (error) {
            console.error('❌ Erro ao debugar usuários:', error);
        }
    }
    
    // Executar quando o DOM estiver carregado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            createDefaultUsers();
            debugUsers();
        });
    } else {
        createDefaultUsers();
        debugUsers();
    }
    
    // Expor funções globalmente para debug
    window.initUsers = {
        create: createDefaultUsers,
        debug: debugUsers,
        clear: function() {
            localStorage.removeItem('employees');
            localStorage.removeItem('currentUser');
            console.log('🗑️ localStorage limpo!');
        }
    };
    
})();

// Adicionar informações de debug no console
console.log('🚀 Sistema de Inicialização de Usuários Carregado');
console.log('💡 Use initUsers.debug() para ver usuários');
console.log('🔄 Use initUsers.create() para recriar usuários');
console.log('🗑️ Use initUsers.clear() para limpar dados');