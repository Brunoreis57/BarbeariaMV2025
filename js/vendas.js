// Vendas Management System

// Global Variables
let services = [];
let products = [];
let currentEditingService = null;
let currentEditingProduct = null;
let currentDeleteItem = null;
let currentDeleteType = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadData();
    setupEventListeners();
    setupTabs();
    renderServices();
    renderProducts();
}

// Event Listeners Setup
function setupEventListeners() {
    // Service form submission
    document.getElementById('serviceForm').addEventListener('submit', handleServiceSubmit);
    
    // Product form submission
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
    
    // Search functionality
    document.getElementById('serviceSearch').addEventListener('input', filterServices);
    document.getElementById('productSearch').addEventListener('input', filterProducts);
    
    // Modal close on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });
}

// Tabs Management
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab + '-tab').classList.add('active');
        });
    });
}

// Data Management
function loadData() {
    // Load services from localStorage
    const savedServices = localStorage.getItem('barbearia_services');
    if (savedServices) {
        services = JSON.parse(savedServices);
    } else {
        // Default services
        services = [
            {
                id: generateId(),
                name: 'Corte Masculino',
                price: 25.00,
                duration: 30,
                description: 'Corte tradicional masculino com acabamento'
            },
            {
                id: generateId(),
                name: 'Barba Completa',
                price: 20.00,
                duration: 25,
                description: 'Aparar e modelar barba com navalha'
            },
            {
                id: generateId(),
                name: 'Corte + Barba',
                price: 40.00,
                duration: 50,
                description: 'Pacote completo: corte de cabelo e barba'
            }
        ];
        saveServices();
    }
    
    // Load products from localStorage
    const savedProducts = localStorage.getItem('barbearia_products');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    } else {
        // Default products
        products = [
            {
                id: generateId(),
                name: 'Pomada Modeladora',
                price: 35.00,
                stock: 15,
                category: 'cabelo',
                description: 'Pomada para modelar e fixar o cabelo'
            },
            {
                id: generateId(),
                name: 'Óleo para Barba',
                price: 28.00,
                stock: 8,
                category: 'barba',
                description: 'Óleo hidratante para barba'
            },
            {
                id: generateId(),
                name: 'Shampoo Anticaspa',
                price: 22.00,
                stock: 12,
                category: 'cabelo',
                description: 'Shampoo especial para combater a caspa'
            }
        ];
        saveProducts();
    }
}

function saveServices() {
    localStorage.setItem('barbearia_services', JSON.stringify(services));
}

function saveProducts() {
    localStorage.setItem('barbearia_products', JSON.stringify(products));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Services Management
function renderServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    
    if (services.length === 0) {
        servicesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-cut"></i>
                <h3>Nenhum serviço cadastrado</h3>
                <p>Clique em "Adicionar Serviço" para começar</p>
            </div>
        `;
        return;
    }
    
    servicesGrid.innerHTML = services.map(service => `
        <div class="service-card">
            <div class="card-header">
                <h3 class="card-title">${service.name}</h3>
                <div class="card-actions">
                    <button class="edit-btn" onclick="editService('${service.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteService('${service.id}')" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="card-price">R$ ${service.price.toFixed(2)}</div>
            ${service.duration ? `<div class="card-info"><i class="fas fa-clock"></i> ${service.duration} minutos</div>` : ''}
            ${service.description ? `<div class="card-description">${service.description}</div>` : ''}
        </div>
    `).join('');
}

function filterServices() {
    const searchTerm = document.getElementById('serviceSearch').value.toLowerCase();
    const filteredServices = services.filter(service => 
        service.name.toLowerCase().includes(searchTerm) ||
        (service.description && service.description.toLowerCase().includes(searchTerm))
    );
    
    const servicesGrid = document.getElementById('servicesGrid');
    
    if (filteredServices.length === 0) {
        servicesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>Nenhum serviço encontrado</h3>
                <p>Tente buscar por outro termo</p>
            </div>
        `;
        return;
    }
    
    servicesGrid.innerHTML = filteredServices.map(service => `
        <div class="service-card">
            <div class="card-header">
                <h3 class="card-title">${service.name}</h3>
                <div class="card-actions">
                    <button class="edit-btn" onclick="editService('${service.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteService('${service.id}')" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="card-price">R$ ${service.price.toFixed(2)}</div>
            ${service.duration ? `<div class="card-info"><i class="fas fa-clock"></i> ${service.duration} minutos</div>` : ''}
            ${service.description ? `<div class="card-description">${service.description}</div>` : ''}
        </div>
    `).join('');
}

function openServiceModal() {
    currentEditingService = null;
    document.getElementById('serviceModalTitle').textContent = 'Adicionar Serviço';
    document.getElementById('serviceForm').reset();
    document.getElementById('serviceModal').classList.add('active');
}

function closeServiceModal() {
    document.getElementById('serviceModal').classList.remove('active');
    currentEditingService = null;
}

function editService(serviceId) {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    currentEditingService = service;
    document.getElementById('serviceModalTitle').textContent = 'Editar Serviço';
    
    // Fill form with service data
    document.getElementById('serviceName').value = service.name;
    document.getElementById('servicePrice').value = service.price;
    document.getElementById('serviceDuration').value = service.duration || '';
    document.getElementById('serviceDescription').value = service.description || '';
    
    document.getElementById('serviceModal').classList.add('active');
}

function deleteService(serviceId) {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    currentDeleteItem = service;
    currentDeleteType = 'service';
    
    document.getElementById('deleteMessage').textContent = 
        `Tem certeza que deseja excluir o serviço "${service.name}"?`;
    
    document.getElementById('confirmDeleteBtn').onclick = confirmDelete;
    document.getElementById('deleteModal').classList.add('active');
}

function handleServiceSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('serviceName').value.trim(),
        price: parseFloat(document.getElementById('servicePrice').value),
        duration: parseInt(document.getElementById('serviceDuration').value) || null,
        description: document.getElementById('serviceDescription').value.trim()
    };
    
    // Validation
    if (!formData.name || formData.price <= 0) {
        showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    if (currentEditingService) {
        // Update existing service
        const index = services.findIndex(s => s.id === currentEditingService.id);
        if (index !== -1) {
            services[index] = { ...currentEditingService, ...formData };
            showNotification('Serviço atualizado com sucesso!', 'success');
        }
    } else {
        // Add new service
        const newService = {
            id: generateId(),
            ...formData
        };
        services.push(newService);
        showNotification('Serviço adicionado com sucesso!', 'success');
    }
    
    saveServices();
    renderServices();
    closeServiceModal();
}

// Products Management
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box"></i>
                <h3>Nenhum produto cadastrado</h3>
                <p>Clique em "Adicionar Produto" para começar</p>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = products.map(product => {
        let stockBadgeClass = 'stock-badge';
        let stockText = `${product.stock || 0} unidades`;
        
        if (product.stock === 0) {
            stockBadgeClass += ' out';
            stockText = 'Sem estoque';
        } else if (product.stock <= 5) {
            stockBadgeClass += ' low';
        }
        
        const categoryNames = {
            'cabelo': 'Cabelo',
            'barba': 'Barba',
            'cuidados': 'Cuidados',
            'acessorios': 'Acessórios',
            'outros': 'Outros'
        };
        
        return `
            <div class="product-card">
                <div class="card-header">
                    <h3 class="card-title">${product.name}</h3>
                    <div class="card-actions">
                        <button class="edit-btn" onclick="editProduct('${product.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" onclick="deleteProduct('${product.id}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-price">R$ ${product.price.toFixed(2)}</div>
                <div class="stock-info">
                    <span class="${stockBadgeClass}">${stockText}</span>
                </div>
                ${product.category ? `<div class="category-badge">${categoryNames[product.category] || product.category}</div>` : ''}
                ${product.description ? `<div class="card-description">${product.description}</div>` : ''}
            </div>
        `;
    }).join('');
}

function filterProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        (product.description && product.description.toLowerCase().includes(searchTerm)) ||
        (product.category && product.category.toLowerCase().includes(searchTerm))
    );
    
    const productsGrid = document.getElementById('productsGrid');
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>Nenhum produto encontrado</h3>
                <p>Tente buscar por outro termo</p>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = filteredProducts.map(product => {
        let stockBadgeClass = 'stock-badge';
        let stockText = `${product.stock || 0} unidades`;
        
        if (product.stock === 0) {
            stockBadgeClass += ' out';
            stockText = 'Sem estoque';
        } else if (product.stock <= 5) {
            stockBadgeClass += ' low';
        }
        
        const categoryNames = {
            'cabelo': 'Cabelo',
            'barba': 'Barba',
            'cuidados': 'Cuidados',
            'acessorios': 'Acessórios',
            'outros': 'Outros'
        };
        
        return `
            <div class="product-card">
                <div class="card-header">
                    <h3 class="card-title">${product.name}</h3>
                    <div class="card-actions">
                        <button class="edit-btn" onclick="editProduct('${product.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" onclick="deleteProduct('${product.id}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-price">R$ ${product.price.toFixed(2)}</div>
                <div class="stock-info">
                    <span class="${stockBadgeClass}">${stockText}</span>
                </div>
                ${product.category ? `<div class="category-badge">${categoryNames[product.category] || product.category}</div>` : ''}
                ${product.description ? `<div class="card-description">${product.description}</div>` : ''}
            </div>
        `;
    }).join('');
}

function openProductModal() {
    currentEditingProduct = null;
    document.getElementById('productModalTitle').textContent = 'Adicionar Produto';
    document.getElementById('productForm').reset();
    document.getElementById('productModal').classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    currentEditingProduct = null;
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    currentEditingProduct = product;
    document.getElementById('productModalTitle').textContent = 'Editar Produto';
    
    // Fill form with product data
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock || '';
    document.getElementById('productCategory').value = product.category || '';
    document.getElementById('productDescription').value = product.description || '';
    
    document.getElementById('productModal').classList.add('active');
}

function deleteProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    currentDeleteItem = product;
    currentDeleteType = 'product';
    
    document.getElementById('deleteMessage').textContent = 
        `Tem certeza que deseja excluir o produto "${product.name}"?`;
    
    document.getElementById('confirmDeleteBtn').onclick = confirmDelete;
    document.getElementById('deleteModal').classList.add('active');
}

function handleProductSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('productName').value.trim(),
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value) || 0,
        category: document.getElementById('productCategory').value,
        description: document.getElementById('productDescription').value.trim()
    };
    
    // Validation
    if (!formData.name || formData.price <= 0) {
        showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    if (currentEditingProduct) {
        // Update existing product
        const index = products.findIndex(p => p.id === currentEditingProduct.id);
        if (index !== -1) {
            products[index] = { ...currentEditingProduct, ...formData };
            showNotification('Produto atualizado com sucesso!', 'success');
        }
    } else {
        // Add new product
        const newProduct = {
            id: generateId(),
            ...formData
        };
        products.push(newProduct);
        showNotification('Produto adicionado com sucesso!', 'success');
    }
    
    saveProducts();
    renderProducts();
    closeProductModal();
}

// Delete Confirmation
function confirmDelete() {
    if (!currentDeleteItem || !currentDeleteType) return;
    
    if (currentDeleteType === 'service') {
        const index = services.findIndex(s => s.id === currentDeleteItem.id);
        if (index !== -1) {
            services.splice(index, 1);
            saveServices();
            renderServices();
            showNotification('Serviço excluído com sucesso!', 'success');
        }
    } else if (currentDeleteType === 'product') {
        const index = products.findIndex(p => p.id === currentDeleteItem.id);
        if (index !== -1) {
            products.splice(index, 1);
            saveProducts();
            renderProducts();
            showNotification('Produto excluído com sucesso!', 'success');
        }
    }
    
    closeDeleteModal();
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    currentDeleteItem = null;
    currentDeleteType = null;
}

// Utility Functions
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    currentEditingService = null;
    currentEditingProduct = null;
    currentDeleteItem = null;
    currentDeleteType = null;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #4CAF50, #45a049)' : 
                     type === 'error' ? 'linear-gradient(135deg, #e74c3c, #c0392b)' : 
                     'linear-gradient(135deg, #3498db, #2980b9)'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 300);
    }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC to close modals
    if (e.key === 'Escape') {
        closeAllModals();
    }
    
    // Ctrl+N to add new service (when on services tab)
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab && activeTab.id === 'cortes-tab') {
            openServiceModal();
        } else if (activeTab && activeTab.id === 'produtos-tab') {
            openProductModal();
        }
    }
});