// Variáveis globais
let clients = [];
let editingClientId = null;
let deletingClientId = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    loadClients();
    setupEventListeners();
    renderClients();
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
    // Formulário de cliente
    document.getElementById('clientForm').addEventListener('submit', handleClientSubmit);
    
    // Formulário de pacote
    document.getElementById('packageForm').addEventListener('submit', handlePackageSubmit);
    
    // Mudança no tipo de pacote
    document.getElementById('packageType').addEventListener('change', updatePackagePrice);
    
    // Fechar modais ao clicar fora
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    });
}

// Carregar clientes
function loadClients() {
    const saved = localStorage.getItem('clients');
    if (saved) {
        clients = JSON.parse(saved);
    } else {
        // Clientes de exemplo
        clients = [
            {
                id: 1,
                name: 'João Silva',
                phone: '(11) 99999-9999',
                email: 'joao@email.com',
                birthdate: '1990-05-15',
                notes: 'Prefere corte baixo nas laterais',
                cutsCount: 12,
                package: {
                    type: 'basic',
                    startDate: '2025-01-01',
                    endDate: '2025-01-31',
                    totalCuts: 4,
                    usedCuts: 2,
                    price: 120.00,
                    active: true
                },
                createdAt: '2024-12-01'
            },
            {
                id: 2,
                name: 'Pedro Santos',
                phone: '(11) 88888-8888',
                email: 'pedro@email.com',
                birthdate: '1985-08-22',
                notes: 'Alérgico a produtos com álcool',
                cutsCount: 8,
                package: null,
                createdAt: '2024-12-15'
            },
            {
                id: 3,
                name: 'Carlos Oliveira',
                phone: '(11) 77777-7777',
                email: 'carlos@email.com',
                birthdate: '1992-03-10',
                notes: '',
                cutsCount: 15,
                package: {
                    type: 'premium',
                    startDate: '2024-12-01',
                    endDate: '2024-12-31',
                    totalCuts: 6,
                    usedCuts: 6,
                    price: 150.00,
                    active: false
                },
                createdAt: '2024-11-20'
            }
        ];
        saveClients();
    }
}

// Salvar clientes
function saveClients() {
    localStorage.setItem('clients', JSON.stringify(clients));
}

// Renderizar clientes
function renderClients(filteredClients = null) {
    const clientsGrid = document.getElementById('clientsGrid');
    const clientsToRender = filteredClients || clients;
    
    if (clientsToRender.length === 0) {
        clientsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>Nenhum cliente encontrado</h3>
                <p>Adicione seu primeiro cliente para começar.</p>
                <button class="add-client-btn" onclick="openAddClientModal()">
                    <i class="fas fa-user-plus"></i>
                    <span>Novo Cliente</span>
                </button>
            </div>
        `;
        return;
    }
    
    clientsGrid.innerHTML = clientsToRender.map(client => {
        const packageStatus = getPackageStatus(client.package);
        const packageBadge = client.package ? 
            `<span class="package-status ${packageStatus.active ? 'package-active' : 'package-expired'}">
                ${packageStatus.text}
            </span>` : '';
        
        return `
            <div class="client-card">
                ${packageBadge}
                <div class="client-header">
                    <div class="client-info">
                        <h3>${client.name}</h3>
                        <div class="client-contact">
                            ${client.phone ? `<span><i class="fas fa-phone"></i> ${client.phone}</span>` : ''}
                            ${client.email ? `<span><i class="fas fa-envelope"></i> ${client.email}</span>` : ''}
                            ${client.birthdate ? `<span><i class="fas fa-birthday-cake"></i> ${formatDate(client.birthdate)}</span>` : ''}
                        </div>
                    </div>
                    <div class="client-actions">
                        <button class="action-btn edit-btn" onclick="editClient(${client.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn package-btn" onclick="openPackageModal(${client.id})" title="Pacote">
                            <i class="fas fa-gift"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteClient(${client.id})" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                ${client.notes ? `<div class="client-notes"><small><i class="fas fa-sticky-note"></i> ${client.notes}</small></div>` : ''}
                
                <div class="client-stats">
                    <div class="client-stat">
                        <span class="client-stat-number">${client.cutsCount}</span>
                        <span class="client-stat-label">Cortes</span>
                    </div>
                    ${client.package ? `
                        <div class="client-stat">
                            <span class="client-stat-number">${client.package.usedCuts}/${client.package.totalCuts}</span>
                            <span class="client-stat-label">Pacote</span>
                        </div>
                    ` : ''}
                    <div class="client-stat">
                        <span class="client-stat-number">${getClientAge(client.birthdate) || '-'}</span>
                        <span class="client-stat-label">Anos</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Atualizar estatísticas
function updateStats() {
    const totalClients = clients.length;
    const activePackages = clients.filter(client => 
        client.package && getPackageStatus(client.package).active
    ).length;
    const totalCuts = clients.reduce((sum, client) => sum + client.cutsCount, 0);
    
    document.getElementById('totalClients').textContent = totalClients;
    document.getElementById('activePackages').textContent = activePackages;
    document.getElementById('totalCuts').textContent = totalCuts;
}

// Pesquisar clientes
function searchClients() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        renderClients();
        return;
    }
    
    const filteredClients = clients.filter(client => 
        client.name.toLowerCase().includes(searchTerm) ||
        (client.phone && client.phone.includes(searchTerm)) ||
        (client.email && client.email.toLowerCase().includes(searchTerm))
    );
    
    renderClients(filteredClients);
}

// Abrir modal de adicionar cliente
function openAddClientModal() {
    editingClientId = null;
    document.getElementById('modalTitle').textContent = 'Novo Cliente';
    document.getElementById('saveClientBtn').textContent = 'Salvar';
    document.getElementById('clientForm').reset();
    openModal('clientModal');
}

// Editar cliente
function editClient(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    
    editingClientId = clientId;
    document.getElementById('modalTitle').textContent = 'Editar Cliente';
    document.getElementById('saveClientBtn').textContent = 'Atualizar';
    
    // Preencher formulário
    document.getElementById('clientName').value = client.name;
    document.getElementById('clientPhone').value = client.phone || '';
    document.getElementById('clientEmail').value = client.email || '';
    document.getElementById('clientBirthdate').value = client.birthdate || '';
    document.getElementById('clientNotes').value = client.notes || '';
    
    openModal('clientModal');
}

// Processar formulário de cliente
function handleClientSubmit(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('clientName').value.trim(),
        phone: document.getElementById('clientPhone').value.trim(),
        email: document.getElementById('clientEmail').value.trim(),
        birthdate: document.getElementById('clientBirthdate').value,
        notes: document.getElementById('clientNotes').value.trim()
    };
    
    if (!formData.name) {
        showNotification('Nome é obrigatório!', 'error');
        return;
    }
    
    if (editingClientId) {
        // Atualizar cliente existente
        const clientIndex = clients.findIndex(c => c.id === editingClientId);
        if (clientIndex !== -1) {
            clients[clientIndex] = { ...clients[clientIndex], ...formData };
            showNotification('Cliente atualizado com sucesso!', 'success');
        }
    } else {
        // Adicionar novo cliente
        const newClient = {
            id: Date.now(),
            ...formData,
            cutsCount: 0,
            package: null,
            createdAt: new Date().toISOString().split('T')[0]
        };
        clients.push(newClient);
        showNotification('Cliente adicionado com sucesso!', 'success');
    }
    
    saveClients();
    renderClients();
    updateStats();
    closeModal('clientModal');
}

// Excluir cliente
function deleteClient(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    
    deletingClientId = clientId;
    document.querySelector('.delete-client-name').textContent = client.name;
    openModal('deleteModal');
}

// Confirmar exclusão
function confirmDeleteClient() {
    if (!deletingClientId) return;
    
    clients = clients.filter(c => c.id !== deletingClientId);
    saveClients();
    renderClients();
    updateStats();
    closeModal('deleteModal');
    showNotification('Cliente excluído com sucesso!', 'success');
    
    deletingClientId = null;
}

// Abrir modal de pacote
function openPackageModal(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    
    editingClientId = clientId;
    document.getElementById('packageForm').reset();
    
    // Definir data de início como hoje
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('packageStartDate').value = today;
    
    openModal('packageModal');
}

// Atualizar preço do pacote
function updatePackagePrice() {
    const packageType = document.getElementById('packageType').value;
    const priceInput = document.getElementById('packagePrice');
    
    const prices = {
        basic: 120.00,
        premium: 150.00,
        vip: 180.00
    };
    
    if (prices[packageType]) {
        priceInput.value = prices[packageType].toFixed(2);
    }
}

// Processar formulário de pacote
function handlePackageSubmit(event) {
    event.preventDefault();
    
    const packageType = document.getElementById('packageType').value;
    const startDate = document.getElementById('packageStartDate').value;
    const price = parseFloat(document.getElementById('packagePrice').value);
    
    if (!packageType || !startDate || !price) {
        showNotification('Preencha todos os campos!', 'error');
        return;
    }
    
    const cutsCount = {
        basic: 4,
        premium: 6,
        vip: 8
    };
    
    // Calcular data de fim (30 dias)
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);
    
    const packageData = {
        type: packageType,
        startDate: startDate,
        endDate: endDate.toISOString().split('T')[0],
        totalCuts: cutsCount[packageType],
        usedCuts: 0,
        price: price,
        active: true
    };
    
    // Atualizar cliente
    const clientIndex = clients.findIndex(c => c.id === editingClientId);
    if (clientIndex !== -1) {
        clients[clientIndex].package = packageData;
        saveClients();
        renderClients();
        updateStats();
        closeModal('packageModal');
        showNotification('Pacote criado com sucesso!', 'success');
    }
}

// Utilitários
function getPackageStatus(packageData) {
    if (!packageData) return { active: false, text: '' };
    
    const today = new Date();
    const endDate = new Date(packageData.endDate);
    const isExpired = today > endDate;
    const isCompleted = packageData.usedCuts >= packageData.totalCuts;
    
    if (isExpired || isCompleted) {
        return { active: false, text: 'Expirado' };
    }
    
    return { active: true, text: 'Ativo' };
}

function getClientAge(birthdate) {
    if (!birthdate) return null;
    
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
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