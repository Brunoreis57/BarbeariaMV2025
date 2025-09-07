// Sistema de Tema Global
class ThemeManager {
    constructor() {
        this.init();
    }

    init() {
        // Aplicar tema salvo ao carregar a página
        this.applyStoredTheme();
        
        // Configurar listener para mudanças de tema
        this.setupThemeListener();
    }

    applyStoredTheme() {
        const savedTheme = localStorage.getItem('theme');
        const isLight = savedTheme === 'light';
        
        if (isLight) {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }

        // Atualizar switch se existir na página
        const themeSwitch = document.getElementById('theme-switch');
        if (themeSwitch) {
            themeSwitch.checked = isLight;
        }
        
        // Atualizar botão se existir na página
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            this.updateToggleButton(themeToggle, isLight);
        }
    }

    setupThemeListener() {
        const themeSwitch = document.getElementById('theme-switch');
        const themeToggle = document.getElementById('themeToggle');
        
        if (themeSwitch) {
            themeSwitch.addEventListener('change', (e) => {
                this.toggleTheme(e.target.checked);
            });
        }
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const isCurrentlyLight = document.body.classList.contains('light-mode');
                this.toggleTheme(!isCurrentlyLight);
                this.updateToggleButton(themeToggle, !isCurrentlyLight);
            });
        }
    }

    toggleTheme(isLight) {
        if (isLight) {
            document.body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        }
    }
    
    updateToggleButton(button, isLight) {
        const icon = button.querySelector('i');
        const text = button.querySelector('span');
        
        if (isLight) {
            icon.className = 'fas fa-sun';
            text.textContent = 'Modo Claro';
        } else {
            icon.className = 'fas fa-moon';
            text.textContent = 'Modo Escuro';
        }
    }

    // Método para alternar tema programaticamente
    setTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        }

        // Atualizar switch se existir
        const themeSwitch = document.getElementById('theme-switch');
        if (themeSwitch) {
            themeSwitch.checked = theme === 'light';
        }
    }

    // Obter tema atual
    getCurrentTheme() {
        return localStorage.getItem('theme') || 'dark';
    }
}

// Inicializar o gerenciador de tema quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});

// Exportar para uso em outros scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}