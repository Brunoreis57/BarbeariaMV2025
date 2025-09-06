document.addEventListener('DOMContentLoaded', function() {
    // O tema agora é gerenciado pelo theme.js global
    
    // Obter nome do usuário do localStorage (simulado)
    const username = localStorage.getItem('rememberedUser') || 'Usuário';
    document.querySelector('.user-name').textContent = `Olá, ${username}`;
    
    // Adicionar navegação nos cards
    const menuCards = document.querySelectorAll('.menu-card');
    menuCards.forEach(card => {
        card.addEventListener('click', function(e) {
            const cardTitle = this.querySelector('.card-title').textContent;
            
            // Mapear títulos para páginas
            const pageMap = {
                'Dashboard': 'dashboard.html',
                'Agenda': 'agenda.html',
                'Clientes': 'clientes.html',
                'Funcionários': 'funcionarios.html',
                'Vendas': 'vendas.html',
                'Caixa': 'caixa.html',
                'Relatórios': 'relatorios.html',
                'Configurações': 'configuracoes.html'
            };
            
            const targetPage = pageMap[cardTitle];
            if (targetPage) {
                window.location.href = targetPage;
            }
        });
    });
    
    // Botão de logout
    const logoutBtn = document.querySelector('.logout-btn');
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Confirmar logout
        if (confirm('Deseja realmente sair?')) {
            // Redirecionar para a página de login
            window.location.href = 'index.html';
        }
    });
});