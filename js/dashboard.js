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
        // Buscar dados do localStorage ou simular
        const appointments = this.getTodayAppointments();
        const sales = this.getTodaySales();
        const services = this.getTodayServices();

        const profit = sales.reduce((total, sale) => total + sale.value, 0) + 
                      services.reduce((total, service) => total + service.price, 0);
        
        return {
            profit: profit,
            cuts: services.length,
            appointments: appointments.length
        };
    }

    // Obter agendamentos de hoje
    getTodayAppointments() {
        // Simular dados - em produção viria do localStorage ou API
        return [
            { id: 1, client: 'João Silva', service: 'Corte + Barba', time: '09:00', price: 35, status: 'confirmed' },
            { id: 2, client: 'Pedro Santos', service: 'Corte Social', time: '10:30', price: 25, status: 'pending' },
            { id: 3, client: 'Carlos Oliveira', service: 'Barba + Bigode', time: '14:00', price: 20, status: 'confirmed' },
            { id: 4, client: 'Roberto Costa', service: 'Corte Degradê', time: '15:30', price: 30, status: 'confirmed' },
            { id: 5, client: 'Lucas Ferreira', service: 'Corte + Sobrancelha', time: '16:00', price: 40, status: 'pending' }
        ];
    }

    // Obter vendas de hoje
    getTodaySales() {
        // Simular dados
        return [
            { id: 1, product: 'Shampoo Anticaspa', value: 15, time: '08:30' },
            { id: 2, product: 'Pomada Modeladora', value: 25, time: '11:15' },
            { id: 3, product: 'Óleo para Barba', value: 20, time: '13:45' }
        ];
    }

    // Obter serviços de hoje
    getTodayServices() {
        // Simular dados
        return [
            { id: 1, client: 'João Silva', service: 'Corte + Barba', price: 35, time: '09:00' },
            { id: 2, client: 'Pedro Santos', service: 'Corte Social', price: 25, time: '10:30' },
            { id: 3, client: 'Carlos Oliveira', service: 'Barba + Bigode', price: 20, time: '14:00' }
        ];
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
            // Em produção, você substituiria o conteúdo HTML pelos dados reais
            console.log('Atividades carregadas:', activities);
        }
    }

    // Obter atividades recentes
    getRecentActivities() {
        return [
            { type: 'sale', title: 'Venda Realizada', description: 'Shampoo Anticaspa - R$ 15,00', time: 'Há 5 minutos' },
            { type: 'appointment', title: 'Novo Agendamento', description: 'Maria Silva - Corte Feminino', time: 'Há 15 minutos' },
            { type: 'service', title: 'Serviço Concluído', description: 'João Silva - Corte + Barba', time: 'Há 30 minutos' },
            { type: 'client', title: 'Novo Cliente', description: 'Roberto Costa cadastrado', time: 'Há 1 hora' },
            { type: 'sale', title: 'Venda Realizada', description: 'Pomada Modeladora - R$ 25,00', time: 'Há 2 horas' }
        ];
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