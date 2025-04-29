// DOM Elements
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('.main-content');
const modals = document.querySelectorAll('.modal');
const addExpenseBtn = document.querySelector('#add-expense-btn');
const addBudgetBtn = document.querySelector('#add-budget-btn');
const addGoalBtn = document.querySelector('#add-goal-btn');
const themeToggle = document.querySelector('.theme-toggle');

// Mobile Navigation
const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
const currencyConverter = document.querySelector('.currency-converter');

// State Management
let state = {
    expenses: JSON.parse(localStorage.getItem('expenses')) || [],
    budgets: JSON.parse(localStorage.getItem('budgets')) || [],
    goals: JSON.parse(localStorage.getItem('goals')) || [],
    theme: localStorage.getItem('theme') || 'light'
};

// Language and Currency Settings
let currentLanguage = localStorage.getItem('language') || 'en';
let currentCurrency = localStorage.getItem('currency') || 'USD';
const exchangeRate = { USD_TO_DOP: 56.50 }; // You might want to fetch this from an API

// Initialize language and currency
function initializeLocalization() {
    document.getElementById('language-select').value = currentLanguage;
    document.getElementById('currency-select').value = currentCurrency;
    updateLanguage();
}

// Update all text content based on selected language
function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = translations[currentLanguage][key];
    });
}

// Convert currency
function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;
    
    if (fromCurrency === 'USD' && toCurrency === 'DOP') {
        return amount * exchangeRate.USD_TO_DOP;
    } else if (fromCurrency === 'DOP' && toCurrency === 'USD') {
        return amount / exchangeRate.USD_TO_DOP;
    }
    
    return amount;
}

// Format currency based on locale
function formatCurrency(amount, currency) {
    const locale = currentLanguage === 'es' ? 'es-DO' : 'en-US';
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Update all displayed amounts
function updateDisplayedAmounts() {
    // Update expenses
    state.expenses.forEach(expense => {
        const amount = convertCurrency(expense.amount, expense.currency || 'USD', currentCurrency);
        const elements = document.querySelectorAll(`[data-expense-id="${expense.id}"] .amount`);
        elements.forEach(element => {
            element.textContent = formatCurrency(amount, currentCurrency);
        });
    });
    
    // Update budgets
    state.budgets.forEach(budget => {
        const amount = convertCurrency(budget.amount, budget.currency || 'USD', currentCurrency);
        const elements = document.querySelectorAll(`[data-budget-id="${budget.id}"] .amount`);
        elements.forEach(element => {
            element.textContent = formatCurrency(amount, currentCurrency);
        });
    });
    
    // Update goals
    state.goals.forEach(goal => {
        const targetAmount = convertCurrency(goal.targetAmount, goal.currency || 'USD', currentCurrency);
        const currentAmount = convertCurrency(goal.currentAmount, goal.currency || 'USD', currentCurrency);
        const elements = document.querySelectorAll(`[data-goal-id="${goal.id}"]`);
        elements.forEach(element => {
            element.querySelector('.target-amount').textContent = formatCurrency(targetAmount, currentCurrency);
            element.querySelector('.current-amount').textContent = formatCurrency(currentAmount, currentCurrency);
        });
    });
    
    // Update stats
    updateStats();
}

// Event Listeners for Language and Currency
document.getElementById('language-select').addEventListener('change', (e) => {
    currentLanguage = e.target.value;
    localStorage.setItem('language', currentLanguage);
    updateLanguage();
    updateDisplayedAmounts();
});

document.getElementById('currency-select').addEventListener('change', (e) => {
    currentCurrency = e.target.value;
    localStorage.setItem('currency', currentCurrency);
    updateDisplayedAmounts();
});

// Currency Converter Event Listeners
document.getElementById('convert-btn').addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('convert-amount').value);
    const fromCurrency = document.getElementById('convert-from').value;
    const toCurrency = document.getElementById('convert-to').value;
    
    if (!isNaN(amount)) {
        const converted = convertCurrency(amount, fromCurrency, toCurrency);
        const result = formatCurrency(converted, toCurrency);
        document.getElementById('convert-result').textContent = result;
    }
});

// Initialize Charts
function initializeCharts() {
    // Expense Chart
    const expenseCtx = document.getElementById('expense-chart').getContext('2d');
    const expenseChart = new Chart(expenseCtx, {
        type: 'doughnut',
        data: {
            labels: ['Food', 'Transport', 'Entertainment', 'Bills', 'Others'],
            datasets: [{
                data: [30, 20, 15, 25, 10],
                backgroundColor: [
                    '#6366f1',
                    '#22c55e',
                    '#f59e0b',
                    '#ef4444',
                    '#64748b'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Budget Overview Chart
    const budgetCtx = document.getElementById('budget-chart').getContext('2d');
    const budgetChart = new Chart(budgetCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Budget',
                data: [1200, 1200, 1200, 1200, 1200, 1200],
                backgroundColor: '#6366f1'
            }, {
                label: 'Expenses',
                data: [1000, 1100, 900, 1300, 1100, 1000],
                backgroundColor: '#ef4444'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    return { expenseChart, budgetChart };
}

// Modal Functions
function openModal(modalId) {
    const modal = document.querySelector(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.querySelector(modalId);
    if (modal) {
        modal.classList.remove('active');
        // Reset form if exists
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

// Form Handlers
function handleExpenseSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const expense = {
        id: Date.now(),
        description: form.description.value,
        amount: parseFloat(form.amount.value),
        category: form.category.value,
        date: new Date().toISOString().split('T')[0],
        currency: currentCurrency
    };
    
    state.expenses = state.expenses || [];
    state.expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(state.expenses));
    updateExpensesList();
    updateStats();
    closeModal('#add-expense-modal');
}

function handleBudgetSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const budget = {
        id: Date.now(),
        category: form.category.value,
        amount: parseFloat(form.amount.value),
        period: 'monthly',
        currency: currentCurrency
    };
    
    state.budgets = state.budgets || [];
    state.budgets.push(budget);
    localStorage.setItem('budgets', JSON.stringify(state.budgets));
    updateBudgetList();
    closeModal('#add-budget-modal');
}

function handleGoalSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const goal = {
        id: Date.now(),
        name: form['goal-name'].value,
        targetAmount: parseFloat(form['goal-target'].value),
        currentAmount: parseFloat(form['goal-saved'].value || 0),
        deadline: form.deadline ? form.deadline.value : null,
        currency: currentCurrency
    };
    
    state.goals = state.goals || [];
    state.goals.push(goal);
    localStorage.setItem('goals', JSON.stringify(state.goals));
    updateGoalsList();
    closeModal('#add-goal-modal');
}

// Update UI Functions
function updateExpensesList() {
    const expensesList = document.getElementById('expenses-list');
    if (!expensesList) return;

    const expenses = state.expenses || [];
    expensesList.innerHTML = expenses
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(expense => `
            <div class="list-item" data-expense-id="${expense.id}">
                <div class="list-item-info">
                    <span class="list-item-title">${expense.description}</span>
                    <span class="list-item-subtitle">${expense.category} - ${formatDate(expense.date)}</span>
                </div>
                <span class="list-item-amount">${formatCurrency(expense.amount, expense.currency)}</span>
            </div>
        `).join('');
}

function updateBudgetList() {
    const budgetList = document.getElementById('budget-list');
    if (!budgetList) return;

    const budgets = state.budgets || [];
    budgetList.innerHTML = budgets.map(budget => {
        const spent = calculateSpentAmount(budget.category);
        const percentage = (spent / budget.amount) * 100;
        const progressClass = percentage > 90 ? 'danger' : percentage > 75 ? 'warning' : '';
        
        return `
            <div class="list-item" data-budget-id="${budget.id}">
                <div class="list-item-info">
                    <span class="list-item-title">${budget.category}</span>
                    <span class="list-item-subtitle">${formatCurrency(spent, budget.currency)} / ${formatCurrency(budget.amount, budget.currency)}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress ${progressClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

function updateGoalsList() {
    const goalsList = document.getElementById('goals-list');
    if (!goalsList) return;

    const goals = state.goals || [];
    goalsList.innerHTML = goals.map(goal => {
        const percentage = (goal.currentAmount / goal.targetAmount) * 100;
        return `
            <div class="list-item" data-goal-id="${goal.id}">
                <div class="list-item-info">
                    <span class="list-item-title">${goal.name}</span>
                    <span class="list-item-subtitle">
                        ${formatCurrency(goal.currentAmount, goal.currency)} / ${formatCurrency(goal.targetAmount, goal.currency)}
                        ${goal.deadline ? ` - Due: ${formatDate(goal.deadline)}` : ''}
                    </span>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

function updateStats() {
    const totalExpenses = state.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const monthlyExpenses = state.expenses
        .filter(expense => new Date(expense.date).getMonth() === new Date().getMonth())
        .reduce((sum, expense) => sum + expense.amount, 0);
    
    document.querySelector('#total-expenses').textContent = `$${totalExpenses.toFixed(2)}`;
    document.querySelector('#monthly-expenses').textContent = `$${monthlyExpenses.toFixed(2)}`;
}

// Utility Functions
function getCategoryIcon(category) {
    const icons = {
        'Food': 'utensils',
        'Transport': 'car',
        'Entertainment': 'film',
        'Bills': 'file-invoice-dollar',
        'Others': 'shopping-bag'
    };
    return icons[category] || 'tag';
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function calculateSpentAmount(category) {
    return state.expenses
        .filter(expense => expense.category === category)
        .reduce((sum, expense) => sum + expense.amount, 0);
}

// Theme Toggle
function toggleTheme() {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    state.theme = newTheme;
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Mobile Navigation
function setupMobileNavigation() {
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (mobileNavToggle && sidebar) {
        mobileNavToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            mobileNavToggle.classList.toggle('active');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                sidebar.classList.contains('active') && 
                !sidebar.contains(e.target) && 
                !mobileNavToggle.contains(e.target)) {
                sidebar.classList.remove('active');
                mobileNavToggle.classList.remove('active');
            }
        });
    }
}

// Improved Modal Handling
function setupModals() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(`#${modal.id}`);
            }
        });
        
        // Close modal when pressing escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal(`#${modal.id}`);
            }
        });
        
        // Prevent modal from closing when clicking inside
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    });
}

// Improved Dropdown Handling
function setupDropdowns() {
    const selects = document.querySelectorAll('select');
    
    selects.forEach(select => {
        // Add touch event handling for mobile
        select.addEventListener('touchstart', (e) => {
            e.stopPropagation();
        }, { passive: true });
        
        // Prevent default behavior on mobile
        select.addEventListener('mousedown', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                select.focus();
            }
        });
    });
}

// Improved Form Handling
function setupForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        // Prevent form submission on enter key for mobile
        form.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && window.innerWidth <= 768) {
                e.preventDefault();
            }
        });
        
        // Add touch feedback
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('touchstart', () => {
                input.classList.add('active');
            }, { passive: true });
            
            input.addEventListener('touchend', () => {
                input.classList.remove('active');
            }, { passive: true });
        });
    });
}

// Initialize all mobile features
document.addEventListener('DOMContentLoaded', () => {
    // Initialize mobile navigation
    setupMobileNavigation();
    
    // Initialize modals
    setupModals();
    
    // Initialize dropdowns
    setupDropdowns();
    
    // Initialize forms
    setupForms();
    
    // Add touch feedback to buttons
    const buttons = document.querySelectorAll('.button, .nav-item');
    buttons.forEach(button => {
        button.addEventListener('touchstart', () => {
            button.classList.add('active');
        }, { passive: true });
        
        button.addEventListener('touchend', () => {
            button.classList.remove('active');
        }, { passive: true });
    });
    
    // Fix iOS viewport height issue
    function fixViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    fixViewportHeight();
    window.addEventListener('resize', fixViewportHeight);
    window.addEventListener('orientationchange', fixViewportHeight);
    
    // Prevent pull-to-refresh on mobile
    document.body.style.overscrollBehavior = 'none';
    
    // Initialize other existing functionality
    initializeLocalization();
    initializeCharts();
    updateExpensesList();
    updateBudgetList();
    updateGoalsList();
    updateStats();
}); 