// Dashboard JavaScript
class Dashboard {
    constructor() {
        this.init();
        this.loadData();
        this.updateCurrentDate();
        this.startRealTimeUpdates();
    }

    init() {
        console.log('Dashboard inicializado');
        this.bindEvents();
    }

    bindEvents() {
        // Eventos podem ser adicionados aqui conforme necessário
        document.addEventListener('DOMContentLoaded', () => {
            this.animateCards();
        });
    }

    // Atualizar data atual
    updateCurrentDate() {
        const currentDateElement = document.getElementById('currentDate');
        if (currentDateElement) {
            const today = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            currentDateElement.textContent = today.toLocaleDateString('pt-BR', options);
        }
    }

    // Carregar dados do dashboard
    loadData() {
        this.loadMetrics();
        this.loadAppointments();
        this.loadActivities();
    }

    // Carregar métricas do dia
    loadMetrics() {
        // Simular dados - em produção, viria de uma API
        const metrics = this.calculateDailyMetrics();
        
        // Atualizar lucro do dia
        const dailyProfitElement = document.getElementById('dailyProfit');
        if (dailyProfitElement) {
            this.animateValue(dailyProfitElement, 0, metrics.profit, 1500, true);
        }

        // Atualizar cortes realizados
        const dailyCutsElement = document.getElementById('dailyCuts');
        if (dailyCutsElement) {
            this.animateValue(dailyCutsElement, 0, metrics.cuts, 1200);
        }

        // Atualizar agendamentos hoje
        const todayAppointmentsElement = document.getElementById('todayAppointments');
        if (todayAppointmentsElement) {
            this.animateValue(todayAppointmentsElement, 0, metrics.appointments, 1000);
        }
    }

    // Calcular métricas diárias
    calculateDailyMetrics() {
        const today = new Date().toISOString().split('T')[0];
        const dailyData = JSON.parse(localStorage.getItem('dailyData') || '{}');
        const todayData = dailyData[today] || { profit: 0, cuts: 0, services: [] };
        
        // Buscar agendamentos de hoje
        const appointments = this.getTodayAppointments();
        
        return {
            profit: todayData.profit,
            cuts: todayData.cuts,
            appointments: appointments.length
        };
    }

    // Obter agendamentos de hoje
    getTodayAppointments() {
        const today = new Date().toISOString().split('T')[0];
        const appointments = JSON.parse(localStorage.getItem('appointments') || '{}');
        const todayAppointments = appointments[today] || [];
        
        return todayAppointments;
    }

    // Obter vendas de hoje
    getTodaySales() {
        const today = new Date().toISOString().split('T')[0];
        const sales = JSON.parse(localStorage.getItem('sales') || '{}');
        const todaySales = sales[today] || [];
        
        return todaySales;
    }

    // Obter serviços de hoje
    getTodayServices() {
        const today = new Date().toISOString().split('T')[0];
        const dailyData = JSON.parse(localStorage.getItem('dailyData') || '{}');
        const todayData = dailyData[today] || { services: [] };
        
        return todayData.services || [];
    }

    // Carregar agendamentos
    loadAppointments() {
        const appointments = this.getTodayAppointments();
        const appointmentsList = document.getElementById('appointmentsList');
        
        if (appointmentsList && appointments.length > 0) {
            // Limpar lista atual (manter apenas os exemplos ou substituir)
            // appointmentsList.innerHTML = '';
            
            // Em produção, você substituiria o conteúdo HTML pelos dados reais
            console.log('Agendamentos carregados:', appointments);
        }
    }

    // Carregar atividades
    loadActivities() {
        const activities = this.getRecentActivities();
        const activitiesList = document.getElementById('activitiesList');
        
        if (activitiesList && activities.length > 0) {
            // Limpar lista atual
            activitiesList.innerHTML = '';
            
            // Adicionar atividades reais
            activities.slice(0, 5).forEach(activity => {
                const activityItem = document.createElement('div');
                activityItem.className = 'activity-item';
                
                const iconClass = this.getActivityIcon(activity.type);
                
                activityItem.innerHTML = `
                    <div class="activity-icon ${activity.type}">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="activity-content">
                        <h4>${activity.title}</h4>
                        <p>${activity.description}</p>
                        <span class="activity-time">${activity.displayTime}</span>
                    </div>
                `;
                
                activitiesList.appendChild(activityItem);
            });
        }
    }

    // Obter atividades recentes
    getRecentActivities() {
        const recentActivities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
        
        // Atualizar o tempo relativo das atividades
        return recentActivities.map(activity => ({
            ...activity,
            displayTime: this.getTimeAgo(activity.time)
        }));
    }
    
    // Obter ícone da atividade
    getActivityIcon(type) {
        const icons = {
            'service': 'fas fa-cut',
            'sale': 'fas fa-shopping-cart',
            'appointment': 'fas fa-calendar-plus',
            'client': 'fas fa-user-plus',
            'payment': 'fas fa-credit-card'
        };
        return icons[type] || 'fas fa-info-circle';
    }
    
    // Calcular tempo relativo
    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInMinutes = Math.floor((now - time) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Agora mesmo';
        if (diffInMinutes < 60) return `Há ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `Há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        return `Há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
    }

    // Animar valores numericos
    animateValue(element, start, end, duration, isCurrency = false) {
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = start + (end - start) * this.easeOutCubic(progress);
            
            if (isCurrency) {
                element.textContent = `R$ ${current.toFixed(2).replace('.', ',')}`;
            } else {
                element.textContent = Math.floor(current);
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    // Função de easing
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // Animar cards na entrada
    animateCards() {
        const cards = document.querySelectorAll('.metric-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    // Iniciar atualizações em tempo real
    startRealTimeUpdates() {
        // Atualizar métricas a cada 30 segundos
        setInterval(() => {
            this.loadMetrics();
        }, 30000);

        // Atualizar data a cada minuto
        setInterval(() => {
            this.updateCurrentDate();
        }, 60000);
    }

    // Adicionar nova atividade (para uso futuro)
    addActivity(type, title, description) {
        const activitiesList = document.getElementById('activitiesList');
        if (activitiesList) {
            const activityHTML = `
                <div class="activity-item">
                    <div class="activity-icon ${type}">
                        <i class="fas ${this.getActivityIcon(type)}"></i>
                    </div>
                    <div class="activity-content">
                        <h4>${title}</h4>
                        <p>${description}</p>
                        <span class="activity-time">Agora</span>
                    </div>
                </div>
            `;
            activitiesList.insertAdjacentHTML('afterbegin', activityHTML);
            
            // Remover atividades antigas se houver muitas
            const activities = activitiesList.querySelectorAll('.activity-item');
            if (activities.length > 10) {
                activities[activities.length - 1].remove();
            }
        }
    }

    // Obter ícone da atividade
    getActivityIcon(type) {
        const icons = {
            sale: 'fa-shopping-cart',
            appointment: 'fa-calendar-plus',
            service: 'fa-cut',
            client: 'fa-user-plus'
        };
        return icons[type] || 'fa-info-circle';
    }

    // Atualizar status do agendamento
    updateAppointmentStatus(appointmentId, newStatus) {
        const appointmentElement = document.querySelector(`[data-appointment-id="${appointmentId}"]`);
        if (appointmentElement) {
            const statusElement = appointmentElement.querySelector('.appointment-status');
            statusElement.className = `appointment-status ${newStatus}`;
            
            const statusText = {
                confirmed: 'Confirmado',
                pending: 'Pendente',
                cancelled: 'Cancelado',
                completed: 'Concluído'
            };
            
            statusElement.querySelector('span').textContent = statusText[newStatus] || newStatus;
        }
    }

    // Formatar moeda
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    // Formatar data
    formatDate(date) {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    }

    // Formatar hora
    formatTime(date) {
        return new Intl.DateTimeFormat('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
}

// Inicializar dashboard quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});

// Exportar para uso global se necessário
window.Dashboard = Dashboard;