// Sistema de Sincronização de Dados
// Este arquivo centraliza a sincronização de dados entre agenda, dashboard e relatórios

class DataSync {
    constructor() {
        this.listeners = [];
        this.init();
    }

    init() {
        // Escutar mudanças no localStorage
        window.addEventListener('storage', (e) => {
            if (e.key === 'dailyData' || e.key === 'recentActivities' || e.key === 'completedCuts') {
                this.notifyListeners(e.key, e.newValue);
            }
        });

        // Para mudanças na mesma aba
        this.setupCustomEvents();
    }

    setupCustomEvents() {
        // Evento customizado para notificar mudanças de dados
        window.addEventListener('dataUpdated', (e) => {
            this.notifyListeners(e.detail.key, e.detail.value);
        });
    }

    // Adicionar listener para mudanças de dados
    addListener(callback) {
        this.listeners.push(callback);
    }

    // Remover listener
    removeListener(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    // Notificar todos os listeners
    notifyListeners(key, value) {
        this.listeners.forEach(callback => {
            try {
                callback(key, value);
            } catch (error) {
                console.error('Erro ao notificar listener:', error);
            }
        });
    }

    // Atualizar dados e notificar
    updateData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            
            // Disparar evento customizado
            const event = new CustomEvent('dataUpdated', {
                detail: { key, value: JSON.stringify(data) }
            });
            window.dispatchEvent(event);
            
            return true;
        } catch (error) {
            console.error('Erro ao atualizar dados:', error);
            return false;
        }
    }

    // Obter dados do localStorage
    getData(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Erro ao obter dados:', error);
            return defaultValue;
        }
    }

    // Adicionar lucro diário e sincronizar
    addDailyProfit(amount, paymentMethod, serviceDetails) {
        const today = new Date().toISOString().split('T')[0];
        const dailyData = this.getData('dailyData', {});
        
        if (!dailyData[today]) {
            dailyData[today] = {
                profit: 0,
                cuts: 0,
                services: [],
                payments: {}
            };
        }

        // Atualizar dados do dia
        dailyData[today].profit += amount;
        dailyData[today].cuts += 1;
        dailyData[today].services.push(serviceDetails);
        
        // Atualizar método de pagamento
        if (!dailyData[today].payments[paymentMethod]) {
            dailyData[today].payments[paymentMethod] = 0;
        }
        dailyData[today].payments[paymentMethod] += amount;

        // Salvar e sincronizar
        this.updateData('dailyData', dailyData);
        
        return true;
    }

    // Adicionar corte realizado
    addCompletedCut(cutData) {
        const completedCuts = this.getData('completedCuts', []);
        
        const cutRecord = {
            id: Date.now(),
            ...cutData,
            timestamp: new Date().toISOString()
        };
        
        completedCuts.unshift(cutRecord);
        
        // Manter apenas os últimos 100 cortes
        if (completedCuts.length > 100) {
            completedCuts.splice(100);
        }
        
        this.updateData('completedCuts', completedCuts);
        
        return cutRecord;
    }

    // Adicionar atividade recente
    addRecentActivity(activity) {
        const recentActivities = this.getData('recentActivities', []);
        
        const activityRecord = {
            id: Date.now(),
            ...activity,
            time: new Date().toISOString()
        };
        
        recentActivities.unshift(activityRecord);
        
        // Manter apenas as últimas 50 atividades
        if (recentActivities.length > 50) {
            recentActivities.splice(50);
        }
        
        this.updateData('recentActivities', recentActivities);
        
        return activityRecord;
    }

    // Registrar venda no sistema de caixa
    registerSale(saleData) {
        const today = new Date().toISOString().split('T')[0];
        const sales = this.getData('sales', {});
        
        if (!sales[today]) {
            sales[today] = [];
        }
        
        const saleRecord = {
            id: Date.now(),
            ...saleData,
            timestamp: new Date().toISOString()
        };
        
        sales[today].push(saleRecord);
        
        this.updateData('sales', sales);
        
        return saleRecord;
    }

    // Calcular comissões dos funcionários
    calculateEmployeeCommissions(period = 'today') {
        const employees = this.getData('employees', []);
        const completedCuts = this.getData('completedCuts', []);
        const sales = this.getData('sales', {});
        
        let startDate, endDate;
        const today = new Date();
        
        switch (period) {
            case 'today':
                startDate = endDate = today.toISOString().split('T')[0];
                break;
            case 'week':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                startDate = weekStart.toISOString().split('T')[0];
                endDate = today.toISOString().split('T')[0];
                break;
            case 'month':
                startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                endDate = today.toISOString().split('T')[0];
                break;
            default:
                startDate = endDate = today.toISOString().split('T')[0];
        }
        
        const commissions = employees.map(employee => {
            let totalRevenue = 0;
            let cutsCount = 0;
            let services = [];
            
            // Calcular baseado nos cortes finalizados
            const employeeCuts = completedCuts.filter(cut => {
                const cutDate = cut.date || cut.finishedAt?.split('T')[0];
                return cutDate >= startDate && cutDate <= endDate && 
                       (cut.employee === employee.name || cut.employeeId === employee.id);
            });
            
            employeeCuts.forEach(cut => {
                totalRevenue += cut.price || 0;
                cutsCount++;
                services.push({
                    client: cut.client,
                    service: cut.service,
                    price: cut.price,
                    date: cut.date || cut.finishedAt?.split('T')[0],
                    commission: (cut.price || 0) * (employee.commission || 0) / 100
                });
            });
            
            // Calcular baseado nas vendas registradas
            Object.keys(sales).forEach(date => {
                if (date >= startDate && date <= endDate) {
                    const daySales = sales[date] || [];
                    const employeeSales = daySales.filter(sale => 
                        sale.employee === employee.name || sale.employeeId === employee.id
                    );
                    
                    employeeSales.forEach(sale => {
                        if (sale.type === 'service') {
                            totalRevenue += sale.amount || 0;
                            cutsCount++;
                            services.push({
                                client: sale.clientName || 'Cliente não informado',
                                service: sale.description,
                                price: sale.amount,
                                date: date,
                                commission: (sale.amount || 0) * (employee.commission || 0) / 100
                            });
                        }
                    });
                }
            });
            
            const commissionRate = employee.commission || 0;
            const totalCommission = totalRevenue * commissionRate / 100;
            
            return {
                employeeId: employee.id,
                employeeName: employee.name,
                role: employee.role,
                commissionRate: commissionRate,
                totalRevenue: totalRevenue,
                totalCommission: totalCommission,
                cutsCount: cutsCount,
                services: services,
                period: period,
                startDate: startDate,
                endDate: endDate
            };
        });
        
        return commissions;
    }

    // Registrar corte com funcionário responsável
    registerCutWithEmployee(cutData) {
        const today = new Date().toISOString().split('T')[0];
        let completedCuts = this.getData('completedCuts', []);
        
        const cutRecord = {
            id: Date.now(),
            ...cutData,
            date: today,
            finishedAt: new Date().toISOString()
        };
        
        completedCuts.push(cutRecord);
        this.updateData('completedCuts', completedCuts);
        
        // Também registrar como venda se tiver dados suficientes
        if (cutData.price && cutData.client) {
            this.registerSale({
                type: 'service',
                description: `${cutData.service || 'Serviço'} - ${cutData.client}`,
                amount: cutData.price,
                paymentMethod: cutData.paymentMethod || 'dinheiro',
                clientName: cutData.client,
                employee: cutData.employee,
                employeeId: cutData.employeeId,
                notes: cutData.notes || ''
            });
        }
        
        return cutRecord;
    }

    // Calcular métricas em tempo real
    calculateRealTimeMetrics() {
        const today = new Date().toISOString().split('T')[0];
        const dailyData = this.getData('dailyData', {});
        const todayData = dailyData[today] || { profit: 0, cuts: 0, services: [] };
        
        return {
            dailyProfit: todayData.profit,
            dailyCuts: todayData.cuts,
            todayServices: todayData.services.length,
            paymentBreakdown: this.calculatePaymentBreakdown(todayData.payments || {})
        };
    }

    // Calcular breakdown de pagamentos
    calculatePaymentBreakdown(payments) {
        const total = Object.values(payments).reduce((sum, amount) => sum + amount, 0);
        
        if (total === 0) {
            return {
                cash: { amount: 0, percentage: 0 },
                pix: { amount: 0, percentage: 0 },
                card: { amount: 0, percentage: 0 }
            };
        }
        
        return {
            cash: {
                amount: payments.cash || 0,
                percentage: Math.round(((payments.cash || 0) / total) * 100)
            },
            pix: {
                amount: payments.pix || 0,
                percentage: Math.round(((payments.pix || 0) / total) * 100)
            },
            card: {
                amount: payments.card || 0,
                percentage: Math.round(((payments.card || 0) / total) * 100)
            }
        };
    }

    // Limpar dados antigos (manutenção)
    cleanOldData(daysToKeep = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const cutoffStr = cutoffDate.toISOString().split('T')[0];
        
        const dailyData = this.getData('dailyData', {});
        const sales = this.getData('sales', {});
        
        // Limpar dados diários antigos
        Object.keys(dailyData).forEach(date => {
            if (date < cutoffStr) {
                delete dailyData[date];
            }
        });
        
        // Limpar vendas antigas
        Object.keys(sales).forEach(date => {
            if (date < cutoffStr) {
                delete sales[date];
            }
        });
        
        this.updateData('dailyData', dailyData);
        this.updateData('sales', sales);
        
        console.log(`Dados anteriores a ${cutoffStr} foram removidos`);
    }
}

// Instância global do sistema de sincronização
const dataSync = new DataSync();

// Exportar para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataSync;
}

// Disponibilizar globalmente
window.DataSync = DataSync;
window.dataSync = dataSync;