// Variáveis globais
let expenses = [];
let editingExpenseId = null;
let deletingExpenseId = null;
let filteredExpenses = [];
let cashBalance = 0;
let cashTransactions = [];
let cashModalType = null; // 'add' ou 'remove'

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    loadExpenses();
    loadCashBalance();
    setupEventListeners();
    renderExpenses();
    updateStats();
    updateCashBalance();
    populateUserFilter();
    setDefaultDate();
});

// Configurar tema
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.classList.toggle('light-mode', savedTheme === 'light');
        updateThemeIcon();
    }
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeIcon = document.querySelector('.theme-toggle i');
    const isLight = document.body.classList.contains('light-mode');
    themeIcon.className = isLight ? 'fas fa-moon' : 'fas fa-sun';
}

// Event listeners
function setupEventListeners() {
    // Formulário de despesa
    document.getElementById('expenseForm').addEventListener('submit', handleExpenseSubmit);
    
    // Formulário de controle de caixa
    document.getElementById('cashForm').addEventListener('submit', handleCashSubmit);
    
    // Fechar modais ao clicar fora
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    });
}

// Definir data padrão como hoje
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('expenseDate').value = today;
}

// Carregar despesas
function loadExpenses() {
    const saved = localStorage.getItem('expenses');
    if (saved) {
        expenses = JSON.parse(saved);
    } else {
        // Despesas de exemplo
        expenses = [
            {
                id: 1,
                description: 'Café e açúcar',
                amount: 25.50,
                category: 'alimentacao',
                user: 'Carlos Silva',
                date: '2024-01-15',
                notes: 'Café para os clientes e açúcar para o cafezinho',
                createdAt: '2024-01-15T10:30:00'
            },
            {
                id: 2,
                description: 'Produtos de limpeza',
                amount: 45.80,
                category: 'limpeza',
                user: 'Ana Santos',
                date: '2024-01-14',
                notes: 'Desinfetante, papel toalha e sabão',
                createdAt: '2024-01-14T14:20:00'
            },
            {
                id: 3,
                description: 'Manutenção da máquina de cortar cabelo',
                amount: 120.00,
                category: 'manutencao',
                user: 'Pedro Oliveira',
                date: '2024-01-13',
                notes: 'Troca de lâminas e lubrificação',
                createdAt: '2024-01-13T16:45:00'
            },
            {
                id: 4,
                description: 'Água e biscoitos',
                amount: 18.90,
                category: 'alimentacao',
                user: 'Carlos Silva',
                date: '2024-01-12',
                notes: '',
                createdAt: '2024-01-12T09:15:00'
            },
            {
                id: 5,
                description: 'Toalhas novas',
                amount: 85.00,
                category: 'equipamentos',
                user: 'Ana Santos',
                date: '2024-01-10',
                notes: 'Toalhas de qualidade para os clientes',
                createdAt: '2024-01-10T11:30:00'
            }
        ];
        saveExpenses();
    }
}

// Salvar despesas
function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Carregar saldo em caixa
function loadCashBalance() {
    const savedBalance = localStorage.getItem('cashBalance');
    const savedTransactions = localStorage.getItem('cashTransactions');
    
    if (savedBalance) {
        cashBalance = parseFloat(savedBalance);
    } else {
        cashBalance = 500.00; // Saldo inicial padrão
    }
    
    if (savedTransactions) {
        cashTransactions = JSON.parse(savedTransactions);
    } else {
        // Transações de exemplo
        cashTransactions = [
            {
                id: 1,
                type: 'add',
                amount: 500.00,
                description: 'Saldo inicial',
                user: 'Sistema',
                date: new Date().toISOString().split('T')[0],
                notes: 'Abertura do caixa',
                createdAt: new Date().toISOString()
            }
        ];
        saveCashData();
    }
}

// Salvar dados do caixa
function saveCashData() {
    localStorage.setItem('cashBalance', cashBalance.toString());
    localStorage.setItem('cashTransactions', JSON.stringify(cashTransactions));
}

// Atualizar exibição do saldo
function updateCashBalance() {
    document.getElementById('cashBalance').textContent = cashBalance.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// Renderizar despesas
function renderExpenses(expensesToRender = null) {
    const expensesGrid = document.getElementById('expensesGrid');
    const expensesToShow = expensesToRender || expenses;
    
    if (expensesToShow.length === 0) {
        expensesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <h3>Nenhuma despesa encontrada</h3>
                <p>Adicione sua primeira despesa para começar o controle financeiro.</p>
                <button class="add-expense-btn" onclick="openAddExpenseModal()">
                    <i class="fas fa-plus"></i>
                    <span>Nova Despesa</span>
                </button>
            </div>
        `;
        return;
    }
    
    // Ordenar por data (mais recente primeiro)
    const sortedExpenses = expensesToShow.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    expensesGrid.innerHTML = sortedExpenses.map(expense => {
        const categoryNames = {
            'alimentacao': 'Alimentação',
            'limpeza': 'Limpeza',
            'equipamentos': 'Equipamentos',
            'manutencao': 'Manutenção',
            'outros': 'Outros'
        };
        
        const formattedDate = new Date(expense.date).toLocaleDateString('pt-BR');
        const formattedAmount = expense.amount.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
        
        return `
            <div class="expense-card">
                <div class="expense-header">
                    <div class="expense-info">
                        <h3>${expense.description}</h3>
                        <div class="expense-category ${expense.category}">
                            ${categoryNames[expense.category] || expense.category}
                        </div>
                    </div>
                    <div class="expense-actions">
                        <button class="action-btn edit-btn" onclick="editExpense(${expense.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteExpense(${expense.id})" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="expense-amount">${formattedAmount}</div>
                
                <div class="expense-details">
                    <span><i class="fas fa-user"></i> ${expense.user}</span>
                    <span><i class="fas fa-calendar"></i> ${formattedDate}</span>
                </div>
                
                ${expense.notes ? `
                    <div class="expense-notes">
                        <i class="fas fa-sticky-note"></i> ${expense.notes}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Atualizar estatísticas
function updateStats() {
    const totalExpenses = expenses.length;
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Despesas de hoje
    const today = new Date().toISOString().split('T')[0];
    const todayExpenses = expenses.filter(expense => expense.date === today).length;
    
    // Média mensal (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentExpenses = expenses.filter(expense => 
        new Date(expense.date) >= thirtyDaysAgo
    );
    const monthlyTotal = recentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const monthlyAverage = recentExpenses.length > 0 ? monthlyTotal / 30 : 0;
    
    document.getElementById('totalExpenses').textContent = totalExpenses;
    document.getElementById('totalAmount').textContent = totalAmount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
    document.getElementById('todayExpenses').textContent = todayExpenses;
    document.getElementById('monthlyAverage').textContent = monthlyAverage.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// Popular filtro de usuários
function populateUserFilter() {
    const userFilter = document.getElementById('userFilter');
    const users = [...new Set(expenses.map(expense => expense.user))].sort();
    
    // Limpar opções existentes (exceto a primeira)
    while (userFilter.children.length > 1) {
        userFilter.removeChild(userFilter.lastChild);
    }
    
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user;
        option.textContent = user;
        userFilter.appendChild(option);
    });
}

// Pesquisar despesas
function searchExpenses() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        applyFilters();
        return;
    }
    
    const searchResults = expenses.filter(expense => 
        expense.description.toLowerCase().includes(searchTerm) ||
        expense.user.toLowerCase().includes(searchTerm) ||
        expense.notes.toLowerCase().includes(searchTerm) ||
        expense.amount.toString().includes(searchTerm)
    );
    
    renderExpenses(searchResults);
}

// Filtrar despesas
function filterExpenses() {
    applyFilters();
}

function applyFilters() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const userFilter = document.getElementById('userFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    let filtered = expenses;
    
    // Filtro por categoria
    if (categoryFilter) {
        filtered = filtered.filter(expense => expense.category === categoryFilter);
    }
    
    // Filtro por usuário
    if (userFilter) {
        filtered = filtered.filter(expense => expense.user === userFilter);
    }
    
    // Filtro por data
    if (dateFilter) {
        filtered = filtered.filter(expense => expense.date === dateFilter);
    }
    
    // Filtro por pesquisa
    if (searchTerm) {
        filtered = filtered.filter(expense => 
            expense.description.toLowerCase().includes(searchTerm) ||
            expense.user.toLowerCase().includes(searchTerm) ||
            expense.notes.toLowerCase().includes(searchTerm) ||
            expense.amount.toString().includes(searchTerm)
        );
    }
    
    renderExpenses(filtered);
}

// Abrir modal de adicionar despesa
function openAddExpenseModal() {
    editingExpenseId = null;
    document.getElementById('modalTitle').textContent = 'Nova Despesa';
    document.getElementById('saveExpenseBtn').textContent = 'Salvar';
    document.getElementById('expenseForm').reset();
    setDefaultDate();
    openModal('expenseModal');
}

// Abrir modal de controle de caixa
function openCashModal(type) {
    cashModalType = type;
    const title = type === 'add' ? 'Adicionar Dinheiro ao Caixa' : 'Retirar Dinheiro do Caixa';
    const buttonText = type === 'add' ? 'Adicionar' : 'Retirar';
    
    document.getElementById('cashModalTitle').textContent = title;
    document.getElementById('saveCashBtn').textContent = buttonText;
    document.getElementById('cashForm').reset();
    
    // Adicionar classe para estilização diferente
    const modal = document.getElementById('cashModal');
    modal.className = `modal ${type}-money-modal`;
    
    openModal('cashModal');
}

// Editar despesa
function editExpense(expenseId) {
    const expense = expenses.find(e => e.id === expenseId);
    if (!expense) return;
    
    editingExpenseId = expenseId;
    document.getElementById('modalTitle').textContent = 'Editar Despesa';
    document.getElementById('saveExpenseBtn').textContent = 'Atualizar';
    
    // Preencher formulário
    document.getElementById('expenseDescription').value = expense.description;
    document.getElementById('expenseAmount').value = expense.amount;
    document.getElementById('expenseCategory').value = expense.category;
    document.getElementById('expenseUser').value = expense.user;
    document.getElementById('expenseDate').value = expense.date;
    document.getElementById('expenseNotes').value = expense.notes || '';
    
    openModal('expenseModal');
}

// Processar formulário de despesa
function handleExpenseSubmit(event) {
    event.preventDefault();
    
    const formData = {
        description: document.getElementById('expenseDescription').value.trim(),
        amount: parseFloat(document.getElementById('expenseAmount').value),
        category: document.getElementById('expenseCategory').value,
        user: document.getElementById('expenseUser').value.trim(),
        date: document.getElementById('expenseDate').value,
        notes: document.getElementById('expenseNotes').value.trim()
    };
    
    // Validações
    if (!formData.description) {
        showNotification('Descrição é obrigatória!', 'error');
        return;
    }
    
    if (isNaN(formData.amount) || formData.amount <= 0) {
        showNotification('Valor deve ser maior que zero!', 'error');
        return;
    }
    
    if (!formData.category) {
        showNotification('Categoria é obrigatória!', 'error');
        return;
    }
    
    if (!formData.user) {
        showNotification('Usuário responsável é obrigatório!', 'error');
        return;
    }
    
    if (!formData.date) {
        showNotification('Data é obrigatória!', 'error');
        return;
    }
    
    if (editingExpenseId) {
        // Atualizar despesa existente
        const expenseIndex = expenses.findIndex(e => e.id === editingExpenseId);
        if (expenseIndex !== -1) {
            expenses[expenseIndex] = { 
                ...expenses[expenseIndex], 
                ...formData 
            };
            showNotification('Despesa atualizada com sucesso!', 'success');
        }
    } else {
        // Adicionar nova despesa
        const newExpense = {
            id: Date.now(),
            ...formData,
            createdAt: new Date().toISOString()
        };
        expenses.push(newExpense);
        showNotification('Despesa adicionada com sucesso!', 'success');
    }
    
    saveExpenses();
    renderExpenses();
    updateStats();
    populateUserFilter();
    closeModal('expenseModal');
}

// Processar formulário de controle de caixa
function handleCashSubmit(event) {
    event.preventDefault();
    
    const formData = {
        amount: parseFloat(document.getElementById('cashAmount').value),
        description: document.getElementById('cashDescription').value.trim(),
        user: document.getElementById('cashUser').value.trim(),
        notes: document.getElementById('cashNotes').value.trim()
    };
    
    // Validações
    if (isNaN(formData.amount) || formData.amount <= 0) {
        showNotification('Valor deve ser maior que zero!', 'error');
        return;
    }
    
    if (!formData.description) {
        showNotification('Descrição é obrigatória!', 'error');
        return;
    }
    
    if (!formData.user) {
        showNotification('Usuário responsável é obrigatório!', 'error');
        return;
    }
    
    // Verificar se há saldo suficiente para retirada
    if (cashModalType === 'remove' && formData.amount > cashBalance) {
        showNotification('Saldo insuficiente no caixa!', 'error');
        return;
    }
    
    // Criar transação
    const transaction = {
        id: Date.now(),
        type: cashModalType,
        ...formData,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
    };
    
    // Atualizar saldo
    if (cashModalType === 'add') {
        cashBalance += formData.amount;
        showNotification(`R$ ${formData.amount.toFixed(2)} adicionado ao caixa!`, 'success');
    } else {
        cashBalance -= formData.amount;
        showNotification(`R$ ${formData.amount.toFixed(2)} retirado do caixa!`, 'success');
    }
    
    // Salvar transação
    cashTransactions.push(transaction);
    saveCashData();
    updateCashBalance();
    closeModal('cashModal');
}

// Excluir despesa
function deleteExpense(expenseId) {
    const expense = expenses.find(e => e.id === expenseId);
    if (!expense) return;
    
    deletingExpenseId = expenseId;
    document.querySelector('.delete-expense-description').textContent = expense.description;
    openModal('deleteModal');
}

// Confirmar exclusão
function confirmDeleteExpense() {
    if (!deletingExpenseId) return;
    
    expenses = expenses.filter(e => e.id !== deletingExpenseId);
    saveExpenses();
    renderExpenses();
    updateStats();
    populateUserFilter();
    closeModal('deleteModal');
    showNotification('Despesa excluída com sucesso!', 'success');
    
    deletingExpenseId = null;
}

// Modais
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Notificações
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${
            type === 'success' ? 'fa-check-circle' :
            type === 'error' ? 'fa-exclamation-circle' :
            type === 'warning' ? 'fa-exclamation-triangle' :
            'fa-info-circle'
        }"></i>
        <span>${message}</span>
    `;
    
    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#00CED1' : type === 'error' ? '#e74c3c' : '#666'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Funções utilitárias para relatórios
function getExpensesByCategory() {
    const categories = {};
    expenses.forEach(expense => {
        if (!categories[expense.category]) {
            categories[expense.category] = {
                count: 0,
                total: 0
            };
        }
        categories[expense.category].count++;
        categories[expense.category].total += expense.amount;
    });
    return categories;
}

function getExpensesByUser() {
    const users = {};
    expenses.forEach(expense => {
        if (!users[expense.user]) {
            users[expense.user] = {
                count: 0,
                total: 0
            };
        }
        users[expense.user].count++;
        users[expense.user].total += expense.amount;
    });
    return users;
}

function getExpensesByMonth() {
    const months = {};
    expenses.forEach(expense => {
        const monthKey = expense.date.substring(0, 7); // YYYY-MM
        if (!months[monthKey]) {
            months[monthKey] = {
                count: 0,
                total: 0
            };
        }
        months[monthKey].count++;
        months[monthKey].total += expense.amount;
    });
    return months;
}

// Exportar dados (pode ser usado futuramente)
function exportExpenses() {
    const dataStr = JSON.stringify(expenses, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'despesas_barbearia.json';
    link.click();
    URL.revokeObjectURL(url);
}

// Exportar funções para uso global
window.getExpensesByCategory = getExpensesByCategory;
window.getExpensesByUser = getExpensesByUser;
window.getExpensesByMonth = getExpensesByMonth;
window.exportExpenses = exportExpenses;