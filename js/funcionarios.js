// Variáveis globais
let employees = [];
let editingEmployeeId = null;
let deletingEmployeeId = null;
let credentialsEmployeeId = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    loadEmployees();
    setupEventListeners();
    renderEmployees();
    updateStats();
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
    // Formulário de funcionário
    document.getElementById('employeeForm').addEventListener('submit', handleEmployeeSubmit);
    
    // Formulário de credenciais
    document.getElementById('credentialsForm').addEventListener('submit', handleCredentialsSubmit);
    
    // Fechar modais ao clicar fora
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    });
}

// Carregar funcionários
function loadEmployees() {
    const saved = localStorage.getItem('employees');
    if (saved) {
        employees = JSON.parse(saved);
    } else {
        // Funcionários de exemplo
        employees = [
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
                createdAt: '2024-01-15'
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
                createdAt: '2024-02-01'
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
        saveEmployees();
    }
}

// Salvar funcionários
function saveEmployees() {
    localStorage.setItem('employees', JSON.stringify(employees));
}

// Renderizar funcionários
function renderEmployees(filteredEmployees = null) {
    const employeesGrid = document.getElementById('employeesGrid');
    const employeesToRender = filteredEmployees || employees;
    
    if (employeesToRender.length === 0) {
        employeesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>Nenhum funcionário encontrado</h3>
                <p>Adicione seu primeiro funcionário para começar.</p>
                <button class="add-employee-btn" onclick="openAddEmployeeModal()">
                    <i class="fas fa-user-plus"></i>
                    <span>Novo Funcionário</span>
                </button>
            </div>
        `;
        return;
    }
    
    employeesGrid.innerHTML = employeesToRender.map(employee => {
        const statusClass = employee.credentials?.active ? 'active' : 'inactive';
        const statusText = employee.credentials?.active ? 'Ativo' : 'Inativo';
        const roleText = {
            'barbeiro': 'Barbeiro',
            'assistente': 'Assistente',
            'gerente': 'Gerente'
        }[employee.role] || employee.role;
        
        return `
            <div class="employee-card">
                <div class="employee-status ${statusClass}">${statusText}</div>
                
                <div class="employee-header">
                    <div class="employee-info">
                        <h3>${employee.name}</h3>
                        <div class="employee-role">${roleText}</div>
                    </div>
                    <div class="employee-actions">
                        <button class="action-btn edit-btn" onclick="editEmployee(${employee.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn credentials-btn" onclick="openCredentialsModal(${employee.id})" title="Credenciais">
                            <i class="fas fa-key"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteEmployee(${employee.id})" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="employee-contact">
                    ${employee.phone ? `<span><i class="fas fa-phone"></i> ${employee.phone}</span>` : ''}
                    ${employee.email ? `<span><i class="fas fa-envelope"></i> ${employee.email}</span>` : ''}
                    ${employee.credentials?.username ? `<span><i class="fas fa-user"></i> ${employee.credentials.username}</span>` : ''}
                </div>
                
                ${employee.notes ? `
                    <div class="employee-notes">
                        <small><i class="fas fa-sticky-note"></i> ${employee.notes}</small>
                    </div>
                ` : ''}
                
                <div class="employee-commission">
                    <span class="commission-value">${employee.commission}%</span>
                    <span class="commission-label">Comissão</span>
                </div>
            </div>
        `;
    }).join('');
}

// Atualizar estatísticas
function updateStats() {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.credentials?.active).length;
    const avgCommission = employees.length > 0 ? 
        (employees.reduce((sum, emp) => sum + emp.commission, 0) / employees.length).toFixed(1) : 0;
    
    document.getElementById('totalEmployees').textContent = totalEmployees;
    document.getElementById('activeEmployees').textContent = activeEmployees;
    document.getElementById('avgCommission').textContent = avgCommission + '%';
}

// Pesquisar funcionários
function searchEmployees() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        renderEmployees();
        return;
    }
    
    const filteredEmployees = employees.filter(employee => 
        employee.name.toLowerCase().includes(searchTerm) ||
        (employee.phone && employee.phone.includes(searchTerm)) ||
        (employee.email && employee.email.toLowerCase().includes(searchTerm)) ||
        employee.role.toLowerCase().includes(searchTerm) ||
        (employee.credentials?.username && employee.credentials.username.toLowerCase().includes(searchTerm))
    );
    
    renderEmployees(filteredEmployees);
}

// Abrir modal de adicionar funcionário
function openAddEmployeeModal() {
    editingEmployeeId = null;
    document.getElementById('modalTitle').textContent = 'Novo Funcionário';
    document.getElementById('saveEmployeeBtn').textContent = 'Salvar';
    document.getElementById('employeeForm').reset();
    openModal('employeeModal');
}

// Editar funcionário
function editEmployee(employeeId) {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;
    
    editingEmployeeId = employeeId;
    document.getElementById('modalTitle').textContent = 'Editar Funcionário';
    document.getElementById('saveEmployeeBtn').textContent = 'Atualizar';
    
    // Preencher formulário
    document.getElementById('employeeName').value = employee.name;
    document.getElementById('employeePhone').value = employee.phone || '';
    document.getElementById('employeeEmail').value = employee.email || '';
    document.getElementById('employeeCommission').value = employee.commission;
    document.getElementById('employeeRole').value = employee.role;
    document.getElementById('employeeNotes').value = employee.notes || '';
    
    openModal('employeeModal');
}

// Processar formulário de funcionário
function handleEmployeeSubmit(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('employeeName').value.trim(),
        phone: document.getElementById('employeePhone').value.trim(),
        email: document.getElementById('employeeEmail').value.trim(),
        commission: parseFloat(document.getElementById('employeeCommission').value),
        role: document.getElementById('employeeRole').value,
        notes: document.getElementById('employeeNotes').value.trim()
    };
    
    // Validações
    if (!formData.name) {
        showNotification('Nome é obrigatório!', 'error');
        return;
    }
    
    if (isNaN(formData.commission) || formData.commission < 0 || formData.commission > 100) {
        showNotification('Porcentagem deve estar entre 0 e 100!', 'error');
        return;
    }
    
    // Verificar email único
    if (formData.email) {
        const existingEmployee = employees.find(e => 
            e.email === formData.email && e.id !== editingEmployeeId
        );
        if (existingEmployee) {
            showNotification('Este email já está em uso!', 'error');
            return;
        }
    }
    
    if (editingEmployeeId) {
        // Atualizar funcionário existente
        const employeeIndex = employees.findIndex(e => e.id === editingEmployeeId);
        if (employeeIndex !== -1) {
            employees[employeeIndex] = { 
                ...employees[employeeIndex], 
                ...formData 
            };
            showNotification('Funcionário atualizado com sucesso!', 'success');
        }
    } else {
        // Adicionar novo funcionário
        const newEmployee = {
            id: Date.now(),
            ...formData,
            credentials: {
                username: '',
                password: '',
                active: false
            },
            createdAt: new Date().toISOString().split('T')[0]
        };
        employees.push(newEmployee);
        showNotification('Funcionário adicionado com sucesso!', 'success');
    }
    
    saveEmployees();
    renderEmployees();
    updateStats();
    closeModal('employeeModal');
}

// Excluir funcionário
function deleteEmployee(employeeId) {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;
    
    deletingEmployeeId = employeeId;
    document.querySelector('.delete-employee-name').textContent = employee.name;
    openModal('deleteModal');
}

// Confirmar exclusão
function confirmDeleteEmployee() {
    if (!deletingEmployeeId) return;
    
    employees = employees.filter(e => e.id !== deletingEmployeeId);
    saveEmployees();
    renderEmployees();
    updateStats();
    closeModal('deleteModal');
    showNotification('Funcionário excluído com sucesso!', 'success');
    
    deletingEmployeeId = null;
}

// Abrir modal de credenciais
function openCredentialsModal(employeeId) {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;
    
    credentialsEmployeeId = employeeId;
    
    // Preencher informações do funcionário
    document.getElementById('credentialsEmployeeName').textContent = employee.name;
    document.getElementById('credentialsEmployeeRole').textContent = {
        'barbeiro': 'Barbeiro',
        'assistente': 'Assistente',
        'gerente': 'Gerente'
    }[employee.role] || employee.role;
    
    // Preencher formulário de credenciais
    document.getElementById('employeeUsername').value = employee.credentials?.username || '';
    document.getElementById('employeePassword').value = employee.credentials?.password || '';
    document.getElementById('confirmPassword').value = employee.credentials?.password || '';
    document.getElementById('employeeActive').checked = employee.credentials?.active || false;
    
    openModal('credentialsModal');
}

// Processar formulário de credenciais
function handleCredentialsSubmit(event) {
    event.preventDefault();
    
    const username = document.getElementById('employeeUsername').value.trim();
    const password = document.getElementById('employeePassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const active = document.getElementById('employeeActive').checked;
    
    // Validações
    if (!username) {
        showNotification('Nome de usuário é obrigatório!', 'error');
        return;
    }
    
    if (!password) {
        showNotification('Senha é obrigatória!', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Senhas não coincidem!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Senha deve ter pelo menos 6 caracteres!', 'error');
        return;
    }
    
    // Verificar username único
    const existingEmployee = employees.find(e => 
        e.credentials?.username === username && e.id !== credentialsEmployeeId
    );
    if (existingEmployee) {
        showNotification('Este nome de usuário já está em uso!', 'error');
        return;
    }
    
    // Atualizar credenciais
    const employeeIndex = employees.findIndex(e => e.id === credentialsEmployeeId);
    if (employeeIndex !== -1) {
        employees[employeeIndex].credentials = {
            username: username,
            password: password,
            active: active
        };
        
        saveEmployees();
        renderEmployees();
        updateStats();
        closeModal('credentialsModal');
        showNotification('Credenciais atualizadas com sucesso!', 'success');
    }
}

// Alternar visibilidade da senha
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('employeePassword');
    const toggleBtn = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleBtn.className = 'fas fa-eye';
    }
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

// Função para validar login (pode ser usada em outras páginas)
function validateEmployeeLogin(username, password) {
    const employee = employees.find(e => 
        e.credentials?.username === username && 
        e.credentials?.password === password &&
        e.credentials?.active === true
    );
    
    return employee || null;
}

// Exportar função para uso global
window.validateEmployeeLogin = validateEmployeeLogin;

// Funções de Comissões
function updateCommissions() {
    const period = document.getElementById('commissionPeriod').value;
    const commissionsGrid = document.getElementById('commissionsGrid');
    
    if (!commissionsGrid) return;
    
    // Calcular período
    const { startDate, endDate } = getDateRange(period);
    
    // Obter comissões usando dataSync se disponível
    if (typeof dataSync !== 'undefined') {
        const commissions = dataSync.calculateEmployeeCommissions(startDate, endDate);
        renderCommissions(commissions);
    } else {
        // Fallback: calcular comissões manualmente
        const commissions = calculateCommissionsManually(startDate, endDate);
        renderCommissions(commissions);
    }
}

function getDateRange(period) {
    const now = new Date();
    let startDate, endDate;
    
    switch (period) {
        case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
            break;
        case 'week':
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            startDate = startOfWeek;
            endDate = new Date(now);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            break;
        default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now);
    }
    
    return { startDate, endDate };
}

function calculateCommissionsManually(startDate, endDate) {
    const employees = loadEmployees();
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const sales = JSON.parse(localStorage.getItem('sales') || '[]');
    
    const commissions = employees.map(employee => {
        let totalCuts = 0;
        let totalEarnings = 0;
        
        // Calcular cortes realizados
        const employeeCuts = appointments.filter(app => 
            app.employeeId === employee.id &&
            app.status === 'finished' &&
            new Date(app.date) >= startDate &&
            new Date(app.date) <= endDate
        );
        
        totalCuts = employeeCuts.length;
        
        // Calcular ganhos das vendas
        const employeeSales = sales.filter(sale => 
            sale.employeeId === employee.id &&
            new Date(sale.date) >= startDate &&
            new Date(sale.date) <= endDate
        );
        
        const salesEarnings = employeeSales.reduce((sum, sale) => {
            const commission = (sale.amount * (employee.commission || 0)) / 100;
            return sum + commission;
        }, 0);
        
        totalEarnings = salesEarnings;
        
        return {
            employee,
            totalCuts,
            totalEarnings,
            averagePerCut: totalCuts > 0 ? totalEarnings / totalCuts : 0
        };
    });
    
    return commissions.filter(c => c.totalCuts > 0 || c.totalEarnings > 0);
}

function renderCommissions(commissions) {
    const commissionsGrid = document.getElementById('commissionsGrid');
    
    if (commissions.length === 0) {
        commissionsGrid.innerHTML = `
            <div class="no-commissions">
                <i class="fas fa-chart-line"></i>
                <p>Nenhuma comissão encontrada para o período selecionado.</p>
            </div>
        `;
        return;
    }
    
    commissionsGrid.innerHTML = commissions.map(commission => {
        const employee = commission.employee;
        const initials = employee.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        
        return `
            <div class="commission-card">
                <div class="commission-header">
                    <div class="commission-avatar">${initials}</div>
                    <div class="commission-info">
                        <h4>${employee.name}</h4>
                        <p>${employee.role} • ${employee.commission || 0}% comissão</p>
                    </div>
                </div>
                <div class="commission-stats">
                    <div class="commission-stat">
                        <span class="value">${commission.totalCuts}</span>
                        <span class="label">Cortes</span>
                    </div>
                    <div class="commission-stat">
                        <span class="value">R$ ${commission.totalEarnings.toFixed(2).replace('.', ',')}</span>
                        <span class="label">Ganhos</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Inicializar comissões quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que outros scripts carregaram
    setTimeout(() => {
        if (document.getElementById('commissionsGrid')) {
            updateCommissions();
        }
    }, 500);
});