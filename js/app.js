// State Management
const state = {
    expenses: [],
    budgets: [],
    goals: [],
    theme: 'light',
    currency: 'USD',
    language: 'en'
};

// Currency symbols
const currencySymbols = {
    USD: '$',
    DOP: 'RD$'
};

// Currency Management
const exchangeRates = {
    USD_TO_DOP: 58.50, // Example rate - you should update this regularly
    DOP_TO_USD: 1 / 58.50
};

// DOM Elements
const elements = {
    // Buttons and toggles
    addExpenseBtn: document.querySelector('.add-expense-btn'),
    addBudgetBtn: document.querySelector('.add-budget-btn'),
    addGoalBtn: document.querySelector('.add-goal-btn'),
    mobileMenuToggle: document.querySelector('.mobile-menu-toggle'),
    clearDataBtn: document.getElementById('clear-data-btn'),
    viewAllBtn: document.querySelector('.view-all-btn'),
    
    // Forms and modals
    expenseForm: document.getElementById('expense-form'),
    addExpenseModal: document.getElementById('add-expense-modal'),
    
    // Display elements
    sidebar: document.querySelector('.sidebar'),
    totalExpenses: document.getElementById('total-expenses'),
    monthlyBudget: document.getElementById('monthly-budget'),
    totalSavings: document.getElementById('total-savings'),
    transactionsContainer: document.getElementById('transactions-container'),
    allTransactionsContainer: document.getElementById('all-transactions-container'),
    budgetList: document.getElementById('budget-list'),
    goalsContainer: document.getElementById('goals-container'),
    
    // Filters
    categoryFilter: document.getElementById('category-filter'),
    dateFilter: document.getElementById('date-filter'),
    
    // Charts
    expenseChart: document.getElementById('expense-chart'),
    budgetChart: document.getElementById('budget-chart'),
    
    // Navigation
    mobileNavToggle: document.querySelector('.mobile-nav-toggle'),
    mainContent: document.querySelector('.main-content'),
    sections: document.querySelectorAll('.section'),
    navLinks: document.querySelectorAll('[data-section]'),
    modals: document.querySelectorAll('.modal'),
    modalCloseButtons: document.querySelectorAll('.modal-close'),
    themeToggle: document.querySelector('.theme-toggle'),
    currencySelect: document.getElementById('currency-select'),
    languageSelect: document.querySelector('#language-select'),

    // Settings
    settingsBtn: document.querySelector('.settings-btn'),
    settingsForm: document.getElementById('settings-form'),
    settingsLanguage: document.getElementById('settings-language'),
    convertAmount: document.getElementById('convert-amount'),
    convertFrom: document.getElementById('convert-from'),
    convertTo: document.getElementById('convert-to'),
    convertBtn: document.getElementById('convert-btn'),
    conversionResult: document.getElementById('conversion-result')
};

// Initialize Charts
let expenseDistributionChart;
let budgetOverviewChart;
let expenseLineChart;

function initializeCharts() {
    // Expense Distribution Chart (Doughnut)
    expenseDistributionChart = new Chart(elements.expenseChart, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#6366f1', // Primary
                    '#f43f5e', // Red
                    '#22c55e', // Green
                    '#eab308', // Yellow
                    '#06b6d4', // Cyan
                    '#a855f7'  // Purple
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            },
            cutout: '70%'
        }
    });

    // Budget Overview Chart (Bar)
    budgetOverviewChart = new Chart(elements.budgetChart, {
        type: 'bar',
        data: {
            labels: ['Budget', 'Spent'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#6366f1', '#f43f5e'],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Interactive Expense Graph (Line)
    const ctx = document.getElementById('expense-trend').getContext('2d');
    expenseLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Daily Expenses',
                data: [],
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#f1f5f9',
                    bodyColor: '#f1f5f9',
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true,
                        drawBorder: false,
                        color: 'rgba(226, 232, 240, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Expense Management
function addExpense(expense) {
    state.expenses.push({
        id: Date.now(),
        ...expense,
        date: new Date(expense.date)
    });
    updateUI();
    closeModal();
}

function deleteExpense(id) {
    state.expenses = state.expenses.filter(expense => expense.id !== id);
    updateUI();
}

// Budget Management
function addBudget(budget) {
    state.budgets.push({
        id: Date.now(),
        ...budget,
        startDate: new Date(budget.startDate),
        endDate: new Date(budget.endDate)
    });
    updateUI();
    closeModal('budget-modal');
}

function deleteBudget(id) {
    state.budgets = state.budgets.filter(budget => budget.id !== id);
    updateUI();
}

// Goal Management
function addGoal(goal) {
    state.goals.push({
        id: Date.now(),
        ...goal,
        targetDate: new Date(goal.targetDate),
        progress: 0
    });
    updateUI();
    closeModal('goal-modal');
}

function deleteGoal(id) {
    state.goals = state.goals.filter(goal => goal.id !== id);
    updateUI();
}

function updateGoalProgress(id, progress) {
    const goal = state.goals.find(g => g.id === id);
    if (goal) {
        goal.progress = Math.min(100, Math.max(0, progress));
        updateUI();
    }
}

// UI Updates
function updateUI() {
    updateTotalExpenses();
    updateBudgetList();
    updateGoalsList();
    updateCharts();
    updateTransactionsList();
    saveState();
}

function updateTotalExpenses() {
    const total = state.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    elements.totalExpenses.textContent = formatCurrency(total);
}

function updateCharts() {
    // Update Category Distribution
    const categoryTotals = {};
    state.expenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    expenseDistributionChart.data.labels = Object.keys(categoryTotals);
    expenseDistributionChart.data.datasets[0].data = Object.values(categoryTotals);
    expenseDistributionChart.update();

    // Update Budget Overview
    const totalExpenses = state.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const monthlyBudget = 2000; // Default budget
    budgetOverviewChart.data.datasets[0].data = [monthlyBudget, totalExpenses];
    budgetOverviewChart.update();

    // Update Expense Trend
    const dailyExpenses = getDailyExpenses();
    expenseLineChart.data.labels = dailyExpenses.map(day => formatDate(day.date));
    expenseLineChart.data.datasets[0].data = dailyExpenses.map(day => day.total);
    expenseLineChart.update();
}

function updateTransactionsList() {
    elements.transactionsContainer.innerHTML = '';
    
    const recentExpenses = state.expenses
        .sort((a, b) => b.date - a.date)
        .slice(0, 5);

    recentExpenses.forEach(expense => {
        const transactionEl = createTransactionElement(expense);
        elements.transactionsContainer.appendChild(transactionEl);
    });
}

function updateBudgetList() {
    if (!elements.budgetList) return;
    
    elements.budgetList.innerHTML = '';
    state.budgets.forEach(budget => {
        const budgetEl = document.createElement('div');
        budgetEl.className = 'budget-item';
        budgetEl.innerHTML = `
            <div class="budget-info">
                <h4>${budget.category}</h4>
                <p>${formatCurrency(budget.amount)}</p>
                <p>${formatDate(budget.startDate)} - ${formatDate(budget.endDate)}</p>
            </div>
            <button class="delete-btn" onclick="deleteBudget(${budget.id})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        elements.budgetList.appendChild(budgetEl);
    });
}

function updateGoalsList() {
    if (!elements.goalsContainer) return;
    
    elements.goalsContainer.innerHTML = '';
    state.goals.forEach(goal => {
        const goalEl = document.createElement('div');
        goalEl.className = 'goal-item';
        goalEl.innerHTML = `
            <div class="goal-info">
                <h4>${goal.title}</h4>
                <p>Target: ${formatCurrency(goal.targetAmount)}</p>
                <p>By: ${formatDate(goal.targetDate)}</p>
                <div class="progress-bar">
                    <div class="progress" style="width: ${goal.progress}%"></div>
                </div>
            </div>
            <button class="delete-btn" onclick="deleteGoal(${goal.id})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        elements.goalsContainer.appendChild(goalEl);
    });
}

// Helper Functions
function formatCurrency(amount) {
    const symbol = currencySymbols[state.currency] || '$';
    return new Intl.NumberFormat(state.language === 'es' ? 'es-DO' : 'en-US', {
        style: 'currency',
        currency: state.currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat(state.language === 'es' ? 'es-DO' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
}

function createTransactionElement(expense) {
    const div = document.createElement('div');
    div.className = 'transaction-item';
    div.innerHTML = `
        <div class="transaction-info">
            <div class="transaction-category">
                <i class="fas ${getCategoryIcon(expense.category)}"></i>
            </div>
            <div class="transaction-details">
                <h4>${expense.description}</h4>
                <p>${expense.category}</p>
            </div>
        </div>
        <div class="transaction-amount">-${formatCurrency(expense.amount)}</div>
    `;
    return div;
}

function getCategoryIcon(category) {
    const icons = {
        food: 'fa-utensils',
        transport: 'fa-car',
        utilities: 'fa-bolt',
        entertainment: 'fa-film',
        shopping: 'fa-shopping-bag',
        others: 'fa-receipt'
    };
    return icons[category.toLowerCase()] || 'fa-receipt';
}

// Helper function to get daily expenses
function getDailyExpenses() {
    const dailyTotals = {};
    
    state.expenses.forEach(expense => {
        const dateKey = expense.date.toISOString().split('T')[0];
        dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + expense.amount;
    });

    // Sort by date and get last 30 days
    return Object.entries(dailyTotals)
        .map(([date, total]) => ({ date: new Date(date), total }))
        .sort((a, b) => a.date - b.date)
        .slice(-30);
}

// Modal Management
function openModal(modalId) {
    console.log('Opening modal:', modalId); // Debug log
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    console.log('Closing modal:', modalId); // Debug log
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        
        // Reset form if exists
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
}

// Mobile Menu Toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const sidebar = document.querySelector('.sidebar');

function toggleMobileMenu() {
    sidebar.classList.toggle('active');
    document.body.classList.toggle('menu-open');
}

mobileMenuToggle.addEventListener('click', toggleMobileMenu);

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('active') && 
        !sidebar.contains(e.target) && 
        !mobileMenuToggle.contains(e.target)) {
        toggleMobileMenu();
    }
});

// Prevent body scroll when mobile menu is open
document.body.addEventListener('touchmove', (e) => {
    if (sidebar.classList.contains('active')) {
        e.preventDefault();
    }
}, { passive: false });

// Improved touch interactions
function setupTouchInteractions() {
    const touchElements = document.querySelectorAll('button, .nav-link, .form-submit');
    
    touchElements.forEach(element => {
        element.addEventListener('touchstart', () => {
            element.classList.add('touch-active');
        });
        
        element.addEventListener('touchend', () => {
            element.classList.remove('touch-active');
        });
    });
}

// Initialize mobile functionality
function initMobile() {
    setupTouchInteractions();
    
    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
        // Close mobile menu on orientation change
        if (sidebar.classList.contains('active')) {
            toggleMobileMenu();
        }
    });
}

// Call initMobile after DOM is loaded
document.addEventListener('DOMContentLoaded', initMobile);

// Navigation Functions
function showSection(sectionId) {
    console.log('Showing section:', sectionId); // Debug log
    
    // Hide all sections first
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show the selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        // Update active state in navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });
        
        // Close mobile menu if open
        if (window.innerWidth <= 768) {
            elements.sidebar.classList.remove('active');
        }
    }
}

// Mobile Navigation Setup
function setupMobileNavigation() {
    elements.mobileNavToggle.addEventListener('click', () => {
        elements.sidebar.classList.toggle('active');
    });
    
    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 &&
            !elements.sidebar.contains(e.target) &&
            !elements.mobileNavToggle.contains(e.target)) {
            elements.sidebar.classList.remove('active');
        }
    });
}

// Event Listeners Setup
function setupEventListeners() {
    // Navigation Links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            console.log('Nav link clicked:', sectionId); // Debug log
            showSection(sectionId);
        });
    });

    // Add Expense Button
    document.querySelectorAll('.add-expense-btn').forEach(btn => {
        btn.addEventListener('click', () => openModal('add-expense-modal'));
    });

    // Add Budget Button
    document.querySelectorAll('.add-budget-btn').forEach(btn => {
        btn.addEventListener('click', () => openModal('add-budget-modal'));
    });

    // Add Goal Button
    document.querySelectorAll('.add-goal-btn').forEach(btn => {
        btn.addEventListener('click', () => openModal('add-goal-modal'));
    });

    // Settings Button
    if (elements.settingsBtn) {
        elements.settingsBtn.addEventListener('click', () => {
            openModal('settings-modal');
            // Set current values
            if (elements.currencySelect) {
                elements.currencySelect.value = state.currency;
            }
            if (elements.languageSelect) {
                elements.languageSelect.value = state.language;
            }
        });
    }

    // Mobile Navigation Toggle
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }

    // Close buttons for all modals
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });

    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Form submissions
    setupFormSubmissions();

    // Settings
    setupSettings();
    setupCurrencyConverter();
}

// Setup Form Submissions
function setupFormSubmissions() {
    // Expense Form
    const expenseForm = document.getElementById('expense-form');
    if (expenseForm) {
        expenseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            addExpense({
                date: formData.get('date'),
                category: formData.get('category'),
                description: formData.get('description'),
                amount: parseFloat(formData.get('amount'))
            });
            closeModal('add-expense-modal');
        });
    }

    // Budget Form
    const budgetForm = document.getElementById('budget-form');
    if (budgetForm) {
        budgetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            addBudget({
                category: formData.get('category'),
                amount: parseFloat(formData.get('amount')),
                startDate: formData.get('start-date'),
                endDate: formData.get('end-date')
            });
            closeModal('add-budget-modal');
        });
    }

    // Goal Form
    const goalForm = document.getElementById('goal-form');
    if (goalForm) {
        goalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            addGoal({
                title: formData.get('title'),
                targetAmount: parseFloat(formData.get('target-amount')),
                targetDate: formData.get('target-date'),
                description: formData.get('description')
            });
            closeModal('add-goal-modal');
        });
    }

    // Settings Form
    if (elements.settingsForm) {
        elements.settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            updateSettings({
                currency: formData.get('currency'),
                language: formData.get('language')
            });
            closeModal('settings-modal');
        });
    }
}

// State Management Functions
function saveState() {
    try {
        localStorage.setItem('expenseTrackerState', JSON.stringify(state));
    } catch (error) {
        console.error('Error saving state:', error);
    }
}

function loadState() {
    try {
        const savedState = localStorage.getItem('expenseTrackerState');
        if (savedState) {
            Object.assign(state, JSON.parse(savedState));
        }
    } catch (error) {
        console.error('Error loading state:', error);
    }
}

// Clear All Data
function clearAllData() {
    state.expenses = [];
    state.budgets = [];
    state.goals = [];
    saveState();
    updateUI();
}

// Filter Transactions
function filterTransactions() {
    const category = elements.categoryFilter.value;
    const date = elements.dateFilter.value;
    
    let filteredExpenses = state.expenses;
    
    if (category) {
        filteredExpenses = filteredExpenses.filter(expense => expense.category === category);
    }
    
    if (date) {
        const filterDate = new Date(date).toDateString();
        filteredExpenses = filteredExpenses.filter(expense => 
            new Date(expense.date).toDateString() === filterDate
        );
    }
    
    updateTransactionsList(filteredExpenses);
}

// Update All Amounts
function updateAllAmounts() {
    updateTotalExpenses();
    updateCharts();
    updateTransactionsList();
}

// Language Management
function updateLanguage() {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[state.language] && translations[state.language][key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translations[state.language][key];
            } else {
                element.textContent = translations[state.language][key];
            }
        }
    });
    
    // Update form labels and buttons
    updateFormTranslations();
    
    // Update all formatted dates and currencies
    updateAllFormattedValues();
}

function updateFormTranslations() {
    // Update form labels
    document.querySelectorAll('.form-label').forEach(label => {
        const key = label.getAttribute('data-translate');
        if (key && translations[state.language][key]) {
            label.textContent = translations[state.language][key];
        }
    });

    // Update buttons
    document.querySelectorAll('button[data-translate]').forEach(button => {
        const key = button.getAttribute('data-translate');
        if (key && translations[state.language][key]) {
            button.textContent = translations[state.language][key];
        }
    });

    // Update select options
    document.querySelectorAll('select').forEach(select => {
        const key = select.getAttribute('data-translate-options');
        if (key && translations[state.language][key]) {
            const options = translations[state.language][key];
            Array.from(select.options).forEach((option, index) => {
                if (options[index]) {
                    option.text = options[index];
                }
            });
        }
    });
}

function updateAllFormattedValues() {
    // Update all currency displays
    document.querySelectorAll('[data-amount]').forEach(element => {
        const amount = parseFloat(element.getAttribute('data-amount'));
        if (!isNaN(amount)) {
            element.textContent = formatCurrency(amount);
        }
    });

    // Update all date displays
    document.querySelectorAll('[data-date]').forEach(element => {
        const date = new Date(element.getAttribute('data-date'));
        if (!isNaN(date.getTime())) {
            element.textContent = formatDate(date);
        }
    });
}

// Settings Management
function updateSettings(newSettings) {
    const oldLanguage = state.language;
    const oldCurrency = state.currency;

    Object.assign(state, newSettings);
    saveState();

    if (oldLanguage !== state.language) {
        updateLanguage();
    }
    if (oldCurrency !== state.currency) {
        updateAllAmounts();
    }
}

// Currency Converter
function setupCurrencyConverter() {
    if (elements.convertBtn) {
        elements.convertBtn.addEventListener('click', () => {
            const amount = parseFloat(elements.convertAmount.value);
            const from = elements.convertFrom.value;
            const to = elements.convertTo.value;

            if (isNaN(amount) || amount < 0) {
                alert('Please enter a valid amount');
                return;
            }

            const result = convertCurrency(amount, from, to);
            displayConversionResult(amount, from, to, result);
        });
    }
}

function convertCurrency(amount, from, to) {
    if (from === to) return amount;

    if (from === 'USD' && to === 'DOP') {
        return amount * exchangeRates.USD_TO_DOP;
    } else if (from === 'DOP' && to === 'USD') {
        return amount * exchangeRates.DOP_TO_USD;
    }

    return amount; // fallback
}

function displayConversionResult(amount, from, to, result) {
    const fromSymbol = currencySymbols[from];
    const toSymbol = currencySymbols[to];
    
    elements.conversionResult.innerHTML = `
        ${fromSymbol}${amount.toFixed(2)} = ${toSymbol}${result.toFixed(2)}
    `;
    elements.conversionResult.style.display = 'block';
}

// Settings Management
function setupSettings() {
    // Currency Select
    if (elements.currencySelect) {
        elements.currencySelect.value = state.currency;
        elements.currencySelect.addEventListener('change', (e) => {
            state.currency = e.target.value;
            saveState();
            updateAllAmounts();
        });
    }

    // Language Select
    if (elements.settingsLanguage) {
        elements.settingsLanguage.value = state.language;
        elements.settingsLanguage.addEventListener('change', (e) => {
            state.language = e.target.value;
            saveState();
            updateLanguage();
        });
    }
}

// Initialization
function init() {
    console.log('Initializing application...'); // Debug log
    loadState();
    setupEventListeners();
    initializeCharts();
    
    // Set initial language and currency
    if (elements.currencySelect) {
        elements.currencySelect.value = state.currency;
    }
    if (elements.settingsLanguage) {
        elements.settingsLanguage.value = state.language;
    }
    
    // Update language
    updateLanguage();
    
    // Show dashboard by default
    showSection('dashboard');
    
    // Update UI
    updateUI();
}

// Start the application
document.addEventListener('DOMContentLoaded', init); 