// Relatórios - JavaScript

// Dados simulados para diferentes períodos
const reportData = {
    daily: {
        period: 'Hoje - 15/01/2025',
        metrics: {
            revenue: 1250.00,
            cuts: 25,
            commission: 375.00,
            profit: 875.00
        },
        changes: {
            revenue: 12,
            cuts: 8,
            commission: 0,
            profit: 15
        },
        payments: {
            cash: { amount: 450.00, percentage: 36, transactions: 9 },
            pix: { amount: 550.00, percentage: 44, transactions: 11 },
            card: { amount: 250.00, percentage: 20, transactions: 5 }
        }
    },
    weekly: {
        period: 'Esta Semana - 13/01 a 19/01/2025',
        metrics: {
            revenue: 8750.00,
            cuts: 175,
            commission: 2625.00,
            profit: 6125.00
        },
        changes: {
            revenue: 18,
            cuts: 12,
            commission: 5,
            profit: 22
        },
        payments: {
            cash: { amount: 3150.00, percentage: 36, transactions: 63 },
            pix: { amount: 3850.00, percentage: 44, transactions: 77 },
            card: { amount: 1750.00, percentage: 20, transactions: 35 }
        }
    },
    monthly: {
        period: 'Janeiro 2025',
        metrics: {
            revenue: 35000.00,
            cuts: 700,
            commission: 10500.00,
            profit: 24500.00
        },
        changes: {
            revenue: 25,
            cuts: 15,
            commission: 8,
            profit: 28
        },
        payments: {
            cash: { amount: 12600.00, percentage: 36, transactions: 252 },
            pix: { amount: 15400.00, percentage: 44, transactions: 308 },
            card: { amount: 7000.00, percentage: 20, transactions: 140 }
        }
    },
    yearly: {
        period: 'Ano 2024',
        metrics: {
            revenue: 420000.00,
            cuts: 8400,
            commission: 126000.00,
            profit: 294000.00
        },
        changes: {
            revenue: 32,
            cuts: 28,
            commission: 15,
            profit: 35
        },
        payments: {
            cash: { amount: 151200.00, percentage: 36, transactions: 3024 },
            pix: { amount: 184800.00, percentage: 44, transactions: 3696 },
            card: { amount: 84000.00, percentage: 20, transactions: 1680 }
        }
    }
};

// Variáveis globais
let currentPeriod = 'daily';
let currentYear = 2024;

// Função para formatar valores monetários
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Função para formatar números
function formatNumber(value) {
    return new Intl.NumberFormat('pt-BR').format(value);
}

// Função para atualizar os dados na tela
function updateReportData(period) {
    const data = reportData[period];
    
    // Atualizar período
    document.getElementById('current-period').textContent = data.period;
    
    // Atualizar métricas
    document.getElementById('total-revenue').textContent = formatCurrency(data.metrics.revenue);
    document.getElementById('total-cuts').textContent = formatNumber(data.metrics.cuts);
    document.getElementById('total-commission').textContent = formatCurrency(data.metrics.commission);
    document.getElementById('net-profit').textContent = formatCurrency(data.metrics.profit);
    
    // Atualizar mudanças percentuais
    updateMetricChange('revenue', data.changes.revenue);
    updateMetricChange('cuts', data.changes.cuts);
    updateMetricChange('commission', data.changes.commission);
    updateMetricChange('profit', data.changes.profit);
    
    // Atualizar tipos de pagamento
    updatePaymentData('cash', data.payments.cash);
    updatePaymentData('pix', data.payments.pix);
    updatePaymentData('card', data.payments.card);
}

// Função para atualizar mudanças percentuais
function updateMetricChange(metric, change) {
    const changeElements = {
        revenue: document.querySelector('#total-revenue').parentElement.querySelector('.metric-change'),
        cuts: document.querySelector('#total-cuts').parentElement.querySelector('.metric-change'),
        commission: document.querySelector('#total-commission').parentElement.querySelector('.metric-change'),
        profit: document.querySelector('#net-profit').parentElement.querySelector('.metric-change')
    };
    
    const element = changeElements[metric];
    const icon = element.querySelector('i');
    const text = element.querySelector('i').nextSibling;
    
    // Remover classes anteriores
    element.classList.remove('positive', 'negative', 'neutral');
    
    if (change > 0) {
        element.classList.add('positive');
        icon.className = 'fas fa-arrow-up';
        text.textContent = ` +${change}% vs período anterior`;
    } else if (change < 0) {
        element.classList.add('negative');
        icon.className = 'fas fa-arrow-down';
        text.textContent = ` ${change}% vs período anterior`;
    } else {
        element.classList.add('neutral');
        icon.className = 'fas fa-minus';
        text.textContent = ` ${change}% vs período anterior`;
    }
}

// Função para atualizar dados de pagamento
function updatePaymentData(type, data) {
    document.getElementById(`${type}-amount`).textContent = formatCurrency(data.amount);
    document.getElementById(`${type}-percentage`).textContent = `${data.percentage}%`;
    document.getElementById(`${type}-transactions`).textContent = `${formatNumber(data.transactions)} transações`;
}

// Função para adicionar animação aos cards
function animateCards() {
    const cards = document.querySelectorAll('.metric-card, .payment-card');
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Função para lidar com mudança de período
function handlePeriodChange(newPeriod) {
    if (newPeriod === currentPeriod) return;
    
    // Atualizar botões ativos
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelector(`[data-period="${newPeriod}"]`).classList.add('active');
    
    // Atualizar período atual
    currentPeriod = newPeriod;
    
    // Animar saída dos dados atuais
    const metricsCards = document.querySelectorAll('.metric-card');
    const paymentCards = document.querySelectorAll('.payment-card');
    
    [...metricsCards, ...paymentCards].forEach(card => {
        card.style.transform = 'scale(0.95)';
        card.style.opacity = '0.7';
    });
    
    // Atualizar dados após animação
    setTimeout(() => {
        updateReportData(newPeriod);
        updatePeriodDisplay();
        
        // Animar entrada dos novos dados
        [...metricsCards, ...paymentCards].forEach(card => {
            card.style.transition = 'all 0.3s ease';
            card.style.transform = 'scale(1)';
            card.style.opacity = '1';
        });
    }, 200);
}

// Função para atualizar a exibição do período baseada no ano selecionado
function updatePeriodDisplay() {
    const periodElement = document.querySelector('.period-display');
    if (periodElement && reportData[currentPeriod]) {
        let periodText = reportData[currentPeriod].period;
        
        // Atualizar o texto do período baseado no ano selecionado
        if (currentPeriod === 'yearly') {
            periodText = `Ano ${currentYear}`;
        } else if (currentPeriod === 'monthly') {
            const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                              'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
            const currentMonth = new Date().getMonth();
            periodText = `${monthNames[currentMonth]} ${currentYear}`;
        } else if (currentPeriod === 'weekly') {
            const today = new Date();
            today.setFullYear(currentYear);
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            
            const formatDate = (date) => {
                return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            };
            
            periodText = `Semana - ${formatDate(startOfWeek)} a ${formatDate(endOfWeek)}/${currentYear}`;
        } else if (currentPeriod === 'daily') {
            const today = new Date();
            today.setFullYear(currentYear);
            periodText = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${currentYear}`;
        }
        
        periodElement.textContent = periodText;
    }
}

// Função para adicionar efeitos de hover nos cards
function addCardEffects() {
    const cards = document.querySelectorAll('.metric-card, .payment-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Função para simular atualização de dados em tempo real
function simulateRealTimeUpdates() {
    setInterval(() => {
        // Pequenas variações nos dados para simular tempo real
        const data = reportData[currentPeriod];
        const variation = (Math.random() - 0.5) * 0.02; // ±1% de variação
        
        // Atualizar apenas se a página estiver visível
        if (!document.hidden) {
            // Pequena animação para indicar atualização
            const revenueCard = document.querySelector('.metric-card');
            revenueCard.style.boxShadow = '0 8px 25px rgba(0, 206, 209, 0.3)';
            
            setTimeout(() => {
                revenueCard.style.boxShadow = '';
            }, 1000);
        }
    }, 30000); // Atualizar a cada 30 segundos
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Configurar event listeners para os filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const period = this.getAttribute('data-period');
            handlePeriodChange(period);
        });
    });
    
    // Adicionar event listener para o seletor de ano
    const yearSelect = document.getElementById('year-select');
    if (yearSelect) {
        yearSelect.addEventListener('change', function() {
            currentYear = parseInt(this.value);
            updatePeriodDisplay();
            console.log(`Ano selecionado: ${currentYear}`);
        });
    }
    
    // Carregar dados iniciais
    updateReportData(currentPeriod);
    
    // Adicionar animações e efeitos
    setTimeout(() => {
        animateCards();
        addCardEffects();
    }, 100);
    
    // Iniciar simulação de atualizações em tempo real
    simulateRealTimeUpdates();
    
    // Adicionar efeito de loading inicial
    const container = document.querySelector('.container');
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        container.style.transition = 'all 0.5s ease';
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }, 100);
});

// Função para exportar dados (funcionalidade futura)
function exportReportData(format = 'pdf') {
    const data = reportData[currentPeriod];
    
    // Simular exportação
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--accent-color);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        font-weight: 500;
    `;
    notification.textContent = `Relatório exportado em ${format.toUpperCase()}!`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Adicionar atalhos de teclado
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                handlePeriodChange('daily');
                break;
            case '2':
                e.preventDefault();
                handlePeriodChange('weekly');
                break;
            case '3':
                e.preventDefault();
                handlePeriodChange('monthly');
                break;
            case '4':
                e.preventDefault();
                handlePeriodChange('yearly');
                break;
        }
    }
});