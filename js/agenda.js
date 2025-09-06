// Variáveis globais
let currentDate = new Date();
let currentView = 'day'; // 'day', 'week', 'month'
let appointments = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeWeek();
    loadAppointments();
    renderSchedule();
    setupEventListeners();
});

// Configuração do tema
function initializeTheme() {
    const themeSwitch = document.getElementById('theme-switch');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeSwitch.checked = true;
    }
    
    themeSwitch.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        }
    });
}

// Inicializar data atual
function initializeWeek() {
    currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
}

// Configurar event listeners
function setupEventListeners() {
    // Formulário de agendamento
    document.getElementById('scheduleForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleScheduleSubmit();
    });
    
    // Formulário de corte
    document.getElementById('cutForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleCutSubmit();
    });
    
    // Fechar modais ao clicar fora
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Mudança de visualização
function changeView(view) {
    currentView = view;
    
    // Atualizar botões ativos
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    // Resetar para hoje ao mudar visualização
    currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    renderSchedule();
}

// Navegação de períodos
function previousPeriod() {
    if (currentView === 'day') {
        currentDate.setDate(currentDate.getDate() - 1);
    } else if (currentView === 'week') {
        currentDate.setDate(currentDate.getDate() - 7);
    } else if (currentView === 'month') {
        currentDate.setMonth(currentDate.getMonth() - 1);
    }
    renderSchedule();
}

function nextPeriod() {
    if (currentView === 'day') {
        currentDate.setDate(currentDate.getDate() + 1);
    } else if (currentView === 'week') {
        currentDate.setDate(currentDate.getDate() + 7);
    } else if (currentView === 'month') {
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    renderSchedule();
}

// Renderizar agenda
function renderSchedule() {
    const scheduleGrid = document.getElementById('scheduleGrid');
    const periodTitle = document.getElementById('periodTitle');
    
    // Limpar grid
    scheduleGrid.innerHTML = '';
    
    if (currentView === 'day') {
        renderDayView(scheduleGrid, periodTitle);
    } else if (currentView === 'week') {
        renderWeekView(scheduleGrid, periodTitle);
    } else if (currentView === 'month') {
        renderMonthView(scheduleGrid, periodTitle);
    }
}

// Renderizar visualização por dia
function renderDayView(scheduleGrid, periodTitle) {
    const today = new Date();
    const isToday = currentDate.toDateString() === today.toDateString();
    
    periodTitle.textContent = isToday ? 'Hoje' : formatDate(currentDate, 'dd/MM/yyyy');
    
    const dayItem = createDayItem(formatDate(currentDate, 'dddd'), currentDate);
    scheduleGrid.appendChild(dayItem);
}

// Renderizar visualização por semana
function renderWeekView(scheduleGrid, periodTitle) {
    // Calcular início da semana
    const weekStart = new Date(currentDate);
    const dayOfWeek = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - dayOfWeek);
    
    // Atualizar título da semana
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const startStr = formatDate(weekStart, 'dd/MM');
    const endStr = formatDate(weekEnd, 'dd/MM');
    periodTitle.textContent = `${startStr} - ${endStr}`;
    
    // Gerar dias da semana
    const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(weekStart);
        dayDate.setDate(dayDate.getDate() + i);
        
        const dayItem = createDayItem(daysOfWeek[i], dayDate);
        scheduleGrid.appendChild(dayItem);
    }
}

// Renderizar visualização por mês
function renderMonthView(scheduleGrid, periodTitle) {
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    periodTitle.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    // Calcular primeiro e último dia do mês
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Criar grid de calendário
    const calendarGrid = document.createElement('div');
    calendarGrid.className = 'calendar-grid';
    
    // Cabeçalho dos dias da semana
    const daysHeader = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    daysHeader.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });
    
    // Dias vazios no início do mês
    const startDay = firstDay.getDay();
    for (let i = 0; i < startDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Dias do mês
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dayElement = createCalendarDay(day, dayDate);
        calendarGrid.appendChild(dayElement);
    }
    
    scheduleGrid.appendChild(calendarGrid);
}

// Criar elemento de dia do calendário
function createCalendarDay(day, date) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
        dayElement.classList.add('today');
    }
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'calendar-day-number';
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);
    
    const dayAppointments = getDayAppointments(date);
    if (dayAppointments.length > 0) {
        const appointmentCount = document.createElement('div');
        appointmentCount.className = 'calendar-appointment-count';
        appointmentCount.textContent = `${dayAppointments.length} agendamento${dayAppointments.length > 1 ? 's' : ''}`;
        dayElement.appendChild(appointmentCount);
        dayElement.classList.add('has-appointments');
    }
    
    return dayElement;
}

// Criar item do dia
function createDayItem(dayName, date) {
    const dayItem = document.createElement('div');
    dayItem.className = 'day-item';
    
    const dayHeader = document.createElement('div');
    dayHeader.className = 'day-header';
    
    const dayNameEl = document.createElement('div');
    dayNameEl.className = 'day-name';
    dayNameEl.textContent = dayName;
    
    const dayDateEl = document.createElement('div');
    dayDateEl.className = 'day-date';
    dayDateEl.textContent = formatDate(date, 'dd/MM/yyyy');
    
    dayHeader.appendChild(dayNameEl);
    dayHeader.appendChild(dayDateEl);
    
    const appointmentsEl = document.createElement('div');
    appointmentsEl.className = 'appointments';
    
    // Buscar agendamentos do dia
    const dayAppointments = getDayAppointments(date);
    
    if (dayAppointments.length === 0) {
        const noAppointments = document.createElement('div');
        noAppointments.className = 'no-appointments';
        noAppointments.textContent = 'Nenhum agendamento';
        appointmentsEl.appendChild(noAppointments);
    } else {
        dayAppointments.forEach(appointment => {
            const appointmentEl = createAppointmentElement(appointment);
            appointmentsEl.appendChild(appointmentEl);
        });
    }
    
    dayItem.appendChild(dayHeader);
    dayItem.appendChild(appointmentsEl);
    
    return dayItem;
}

// Criar elemento de agendamento
function createAppointmentElement(appointment) {
    const appointmentEl = document.createElement('div');
    appointmentEl.className = 'appointment';
    
    const appointmentInfo = document.createElement('div');
    appointmentInfo.className = 'appointment-info';
    
    const timeEl = document.createElement('div');
    timeEl.className = 'appointment-time';
    timeEl.textContent = appointment.time;
    
    const clientEl = document.createElement('div');
    clientEl.className = 'appointment-client';
    clientEl.textContent = appointment.clientName;
    
    const serviceEl = document.createElement('div');
    serviceEl.className = 'appointment-service';
    serviceEl.textContent = getServiceName(appointment.serviceType);
    
    appointmentInfo.appendChild(timeEl);
    appointmentInfo.appendChild(clientEl);
    appointmentInfo.appendChild(serviceEl);
    
    const appointmentActions = document.createElement('div');
    appointmentActions.className = 'appointment-actions';
    
    // Botão Finalizar Corte (apenas se não estiver finalizado)
    if (!appointment.finished) {
        const finishBtn = document.createElement('button');
        const isPaid = appointment.paid || false;
        finishBtn.className = `action-btn finish-btn ${isPaid ? 'paid' : 'unpaid'}`;
        finishBtn.innerHTML = '<i class="fas fa-check"></i>';
        finishBtn.title = isPaid ? 'Finalizar Corte (Pago)\nCtrl+Clique: Alternar status' : 'Finalizar Corte (Não Pago)\nCtrl+Clique: Alternar status';
        finishBtn.onclick = (e) => {
            // Se Ctrl estiver pressionado, apenas alterna o status de pagamento
            if (e.ctrlKey) {
                togglePaymentStatus(appointment.id);
            } else {
                openFinishCutModal(appointment.id);
            }
        };
        appointmentActions.appendChild(finishBtn);
    }
    
    const editBtn = document.createElement('button');
    editBtn.className = 'action-btn';
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.onclick = () => editAppointment(appointment.id);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-btn';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.onclick = () => deleteAppointment(appointment.id);
    
    appointmentActions.appendChild(editBtn);
    appointmentActions.appendChild(deleteBtn);
    
    // Adicionar classe se o corte estiver finalizado
    if (appointment.finished) {
        appointmentEl.classList.add('finished');
    }
    
    appointmentEl.appendChild(appointmentInfo);
    appointmentEl.appendChild(appointmentActions);
    
    return appointmentEl;
}

// Buscar agendamentos do dia
function getDayAppointments(date) {
    const dateStr = formatDate(date, 'yyyy-MM-dd');
    return appointments
        .filter(app => app.date === dateStr)
        .sort((a, b) => a.time.localeCompare(b.time));
}

// Abrir modal de agendamento
function openScheduleModal() {
    const modal = document.getElementById('scheduleModal');
    const dateInput = document.getElementById('scheduleDate');
    
    // Definir data mínima como hoje
    const today = new Date();
    dateInput.min = formatDate(today, 'yyyy-MM-dd');
    
    modal.style.display = 'block';
}

// Abrir modal de corte
function openCutModal() {
    const modal = document.getElementById('cutModal');
    modal.style.display = 'block';
}

// Fechar modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
    
    // Limpar formulários
    const form = modal.querySelector('form');
    if (form) {
        form.reset();
    }
}

// Processar agendamento
function handleScheduleSubmit() {
    const clientName = getClientName('schedule');
    const date = document.getElementById('scheduleDate').value;
    const time = document.getElementById('scheduleTime').value;
    const serviceType = document.getElementById('serviceType').value;
    
    if (!clientName || !date || !time || !serviceType) {
        showNotification('Por favor, preencha todos os campos!', 'error');
        return;
    }
    
    // Se for um novo cliente, adicionar à lista de clientes cadastrados
    const activeButton = document.querySelector('#scheduleModal .client-type-btn.active');
    if (activeButton.dataset.type === 'new' && clientName) {
        addNewClient(clientName);
    }
    
    const appointment = {
        id: generateId(),
        clientName: clientName,
        date: date,
        time: time,
        serviceType: serviceType,
        status: 'scheduled'
    };
    
    // Verificar conflitos de horário
    if (hasTimeConflict(appointment)) {
        alert('Já existe um agendamento neste horário!');
        return;
    }
    
    appointments.push(appointment);
    saveAppointments();
    renderSchedule();
    closeModal('scheduleModal');
    
    showNotification('Agendamento realizado com sucesso!', 'success');
}

// Processar registro de corte
function handleCutSubmit() {
    const clientName = getClientName('cut');
    const serviceType = document.getElementById('cutServiceType').value;
    const price = parseFloat(document.getElementById('cutPrice').value);
    
    if (!clientName || !serviceType || !price) {
        showNotification('Por favor, preencha todos os campos!', 'error');
        return;
    }
    
    // Se for um novo cliente, adicionar à lista de clientes cadastrados
    const activeButton = document.querySelector('#cutModal .client-type-btn.active');
    if (activeButton.dataset.type === 'new' && clientName) {
        addNewClient(clientName);
    }
    
    const cut = {
        id: generateId(),
        clientName: clientName,
        serviceType: serviceType,
        price: price,
        date: formatDate(new Date(), 'yyyy-MM-dd'),
        time: formatDate(new Date(), 'HH:mm'),
        status: 'completed'
    };
    
    appointments.push(cut);
    saveAppointments();
    renderSchedule();
    closeModal('cutModal');
    
    showNotification(`Corte registrado! Valor: R$ ${cut.price.toFixed(2)}`, 'success');
}

// Verificar conflitos de horário
function hasTimeConflict(newAppointment) {
    return appointments.some(app => 
        app.date === newAppointment.date && 
        app.time === newAppointment.time &&
        app.status === 'scheduled'
    );
}

// Editar agendamento
function editAppointment(id) {
    const appointment = appointments.find(app => app.id === id);
    if (!appointment) return;
    
    // Preencher formulário com dados existentes
    document.getElementById('clientName').value = appointment.clientName;
    document.getElementById('scheduleDate').value = appointment.date;
    document.getElementById('scheduleTime').value = appointment.time;
    document.getElementById('serviceType').value = appointment.serviceType;
    
    // Remover agendamento atual
    deleteAppointment(id);
    
    // Abrir modal para edição
    openScheduleModal();
}

// Deletar agendamento
function deleteAppointment(id) {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
        appointments = appointments.filter(app => app.id !== id);
        saveAppointments();
        renderSchedule();
        showNotification('Agendamento cancelado!', 'info');
    }
}

// Carregar agendamentos do localStorage
function loadAppointments() {
    const saved = localStorage.getItem('appointments');
    if (saved) {
        appointments = JSON.parse(saved);
    } else {
        // Dados de exemplo
        appointments = [
            {
                id: '1',
                clientName: 'João Silva',
                date: formatDate(new Date(), 'yyyy-MM-dd'),
                time: '14:00',
                serviceType: 'corte',
                status: 'scheduled'
            },
            {
                id: '2',
                clientName: 'Pedro Santos',
                date: formatDate(new Date(Date.now() + 86400000), 'yyyy-MM-dd'),
                time: '16:30',
                serviceType: 'corte-barba',
                status: 'scheduled'
            }
        ];
        saveAppointments();
    }
}

// Salvar agendamentos no localStorage
function saveAppointments() {
    localStorage.setItem('appointments', JSON.stringify(appointments));
}

// Utilitários
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function formatDate(date, format) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    
    switch (format) {
        case 'yyyy-MM-dd':
            return `${year}-${month}-${day}`;
        case 'dd/MM/yyyy':
            return `${day}/${month}/${year}`;
        case 'dd/MM':
            return `${day}/${month}`;
        case 'HH:mm':
            return `${hours}:${minutes}`;
        case 'dddd':
            return daysOfWeek[d.getDay()];
        default:
            return d.toLocaleDateString('pt-BR');
    }
}

function getServiceName(serviceType) {
    const services = {
        'corte': 'Corte',
        'barba': 'Barba',
        'corte-barba': 'Corte + Barba'
    };
    return services[serviceType] || serviceType;
}

function showNotification(message, type = 'info') {
    // Criar elemento de notificação
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
    
    // Adicionar ao body
    document.body.appendChild(notification);
    
    // Mostrar notificação
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Gerenciamento de clientes
let registeredClients = [];

// Carregar clientes do localStorage
function loadClients() {
    const saved = localStorage.getItem('registeredClients');
    if (saved) {
        registeredClients = JSON.parse(saved);
    } else {
        // Clientes de exemplo
        registeredClients = [
            { id: 1, name: 'João Silva', phone: '(11) 99999-9999', email: 'joao@email.com' },
            { id: 2, name: 'Pedro Santos', phone: '(11) 88888-8888', email: 'pedro@email.com' },
            { id: 3, name: 'Carlos Oliveira', phone: '(11) 77777-7777', email: 'carlos@email.com' }
        ];
        saveClients();
    }
    updateClientSelects();
}

// Salvar clientes no localStorage
function saveClients() {
    localStorage.setItem('registeredClients', JSON.stringify(registeredClients));
}

// Atualizar selects de clientes
function updateClientSelects() {
    const existingClientSelect = document.getElementById('existingClient');
    const existingCutClientSelect = document.getElementById('existingCutClient');
    
    // Limpar opções existentes
    existingClientSelect.innerHTML = '<option value="">Selecione um cliente...</option>';
    existingCutClientSelect.innerHTML = '<option value="">Selecione um cliente...</option>';
    
    // Adicionar clientes cadastrados
    registeredClients.forEach(client => {
        const option1 = document.createElement('option');
        option1.value = client.id;
        option1.textContent = client.name;
        existingClientSelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = client.id;
        option2.textContent = client.name;
        existingCutClientSelect.appendChild(option2);
    });
}

// Alternar tipo de cliente
function toggleClientType(modalType, clientType) {
    const isSchedule = modalType === 'schedule';
    const newFieldsId = isSchedule ? 'newClientFields' : 'newCutClientFields';
    const existingFieldsId = isSchedule ? 'existingClientFields' : 'existingCutClientFields';
    const buttonsContainer = document.querySelector(`#${isSchedule ? 'scheduleModal' : 'cutModal'} .client-type-selector`);
    
    // Atualizar botões
    buttonsContainer.querySelectorAll('.client-type-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === clientType) {
            btn.classList.add('active');
        }
    });
    
    // Mostrar/ocultar campos
    const newFields = document.getElementById(newFieldsId);
    const existingFields = document.getElementById(existingFieldsId);
    
    if (clientType === 'new') {
        newFields.style.display = 'block';
        existingFields.style.display = 'none';
        // Limpar campo de cliente existente
        const existingSelect = existingFields.querySelector('select');
        if (existingSelect) existingSelect.value = '';
    } else {
        newFields.style.display = 'none';
        existingFields.style.display = 'block';
        // Limpar campo de novo cliente
        const newInput = newFields.querySelector('input');
        if (newInput) newInput.value = '';
    }
}

// Adicionar novo cliente
function addNewClient(name, phone = '', email = '') {
    const newClient = {
        id: Date.now(),
        name: name,
        phone: phone,
        email: email
    };
    
    registeredClients.push(newClient);
    saveClients();
    updateClientSelects();
    
    return newClient;
}

// Obter nome do cliente
function getClientName(modalType) {
    const isSchedule = modalType === 'schedule';
    const buttonsContainer = document.querySelector(`#${isSchedule ? 'scheduleModal' : 'cutModal'} .client-type-selector`);
    const activeButton = buttonsContainer.querySelector('.client-type-btn.active');
    const clientType = activeButton.dataset.type;
    
    if (clientType === 'new') {
        const input = document.getElementById(isSchedule ? 'clientName' : 'cutClientName');
        return input.value.trim();
    } else {
        const select = document.getElementById(isSchedule ? 'existingClient' : 'existingCutClient');
        const clientId = parseInt(select.value);
        const client = registeredClients.find(c => c.id === clientId);
        return client ? client.name : '';
    }
}

// Inicializar clientes quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    loadClients();
    setupFinishCutModal();
});

// Configurar modal de finalização de corte
function setupFinishCutModal() {
    const finishCutForm = document.getElementById('finishCutForm');
    if (finishCutForm) {
        finishCutForm.addEventListener('submit', handleFinishCutSubmit);
    }
}

// Abrir modal de finalização de corte
function openFinishCutModal(appointmentId) {
    const appointment = appointments.find(app => app.id === appointmentId);
    if (!appointment) {
        showNotification('Agendamento não encontrado!', 'error');
        return;
    }
    
    // Preencher dados do agendamento
    document.getElementById('finishClientName').textContent = appointment.clientName;
    document.getElementById('finishServiceName').textContent = getServiceName(appointment.serviceType);
    document.getElementById('finishServicePrice').textContent = `R$ ${appointment.price || '0,00'}`;
    
    // Limpar formulário
    document.getElementById('paymentType').value = '';
    document.getElementById('finishNotes').value = '';
    document.getElementById('isPaid').checked = true; // Por padrão marcado como pago
    
    // Armazenar ID do agendamento
    document.getElementById('finishCutForm').dataset.appointmentId = appointmentId;
    
    // Mostrar modal
    document.getElementById('finishCutModal').style.display = 'block';
}

// Processar finalização do corte
function handleFinishCutSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const appointmentId = form.dataset.appointmentId;
    const paymentType = document.getElementById('paymentType').value;
    const notes = document.getElementById('finishNotes').value;
    const isPaid = document.getElementById('isPaid').checked;
    
    if (!paymentType) {
        showNotification('Selecione o tipo de pagamento!', 'error');
        return;
    }
    
    // Encontrar e atualizar o agendamento
    const appointmentIndex = appointments.findIndex(app => app.id === appointmentId);
    if (appointmentIndex === -1) {
        showNotification('Agendamento não encontrado!', 'error');
        return;
    }
    
    // Marcar como finalizado
    appointments[appointmentIndex].finished = true;
    appointments[appointmentIndex].paid = isPaid;
    appointments[appointmentIndex].paymentType = paymentType;
    appointments[appointmentIndex].finishNotes = notes;
    appointments[appointmentIndex].finishedAt = new Date().toISOString();
    
    // Salvar no localStorage
    saveAppointments();
    
    // Registrar no caixa (se existir a função)
    if (typeof registerSale === 'function') {
        const appointment = appointments[appointmentIndex];
        registerSale({
            type: 'service',
            description: `${getServiceName(appointment.serviceType)} - ${appointment.clientName}`,
            amount: parseFloat(appointment.price || 0),
            paymentMethod: paymentType,
            date: new Date().toISOString(),
            notes: notes
        });
    }
    
    // Fechar modal
    closeModal('finishCutModal');
    
    // Atualizar visualização
    renderSchedule();
    
    // Mostrar notificação
    showNotification('Corte finalizado com sucesso!', 'success');
}

// Função para obter nome do tipo de pagamento
function getPaymentTypeName(paymentType) {
    const paymentTypes = {
        'dinheiro': 'Dinheiro',
        'cartao': 'Cartão',
        'pix': 'PIX',
        'debito': 'Cartão de Débito',
        'credito': 'Cartão de Crédito'
    };
    return paymentTypes[paymentType] || paymentType;
}

// Alternar status de pagamento
function togglePaymentStatus(appointmentId) {
    const appointmentIndex = appointments.findIndex(app => app.id === appointmentId);
    if (appointmentIndex === -1) {
        showNotification('Agendamento não encontrado!', 'error');
        return;
    }
    
    // Alternar status de pagamento
    appointments[appointmentIndex].paid = !appointments[appointmentIndex].paid;
    
    // Salvar no localStorage
    saveAppointments();
    
    // Atualizar visualização
    renderSchedule();
    
    // Mostrar notificação
    const status = appointments[appointmentIndex].paid ? 'pago' : 'não pago';
    showNotification(`Status alterado para: ${status}`, 'info');
}