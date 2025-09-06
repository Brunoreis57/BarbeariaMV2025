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
        
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }

        // Atualizar switch se existir na página
        const themeSwitch = document.getElementById('theme-switch');
        if (themeSwitch) {
            themeSwitch.checked = savedTheme === 'light';
        }
    }

    setupThemeListener() {
        const themeSwitch = document.getElementById('theme-switch');
        
        if (themeSwitch) {
            themeSwitch.addEventListener('change', (e) => {
                this.toggleTheme(e.target.checked);
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