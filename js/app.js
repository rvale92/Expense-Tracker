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

// Toggle mobile navigation
mobileNavToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    mobileNavToggle.classList.toggle('active');
});

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('active') &&
        !sidebar.contains(e.target) &&
        !mobileNavToggle.contains(e.target)) {
        sidebar.classList.remove('active');
        mobileNavToggle.classList.remove('active');
    }
});

// Mobile Currency Converter Toggle
document.querySelector('.currency-converter h3').addEventListener('click', () => {
    if (window.innerWidth <= 768) {
        currencyConverter.classList.toggle('active');
    }
});

// Improve Chart Responsiveness
function setupChartResponsiveness(chart) {
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            chart.resize();
        }, 250);
    });
}

// Add touch event handling for better mobile interaction
function addTouchInteractions() {
    const touchElements = document.querySelectorAll('button, .nav-item, .widget');
    
    touchElements.forEach(element => {
        element.addEventListener('touchstart', () => {
            element.style.opacity = '0.7';
        });
        
        element.addEventListener('touchend', () => {
            element.style.opacity = '1';
        });
    });
}

// Improve modal handling on mobile
function setupMobileModals() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        const content = modal.querySelector('.modal-content');
        
        // Prevent modal close when clicking modal content
        content.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Add touch swipe to close
        let startY;
        content.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        });
        
        content.addEventListener('touchmove', (e) => {
            if (!startY) return;
            
            const deltaY = e.touches[0].clientY - startY;
            if (deltaY > 50) {
                modal.classList.remove('active');
                startY = null;
            }
        });
    });
}

// Section Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    const selectedSection = document.getElementById(`${sectionId}-section`);
    if (selectedSection) {
        selectedSection.style.display = 'block';
    }
    
    // Update active navigation item
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
    
    // Close mobile sidebar after navigation
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
        mobileNavToggle.classList.remove('active');
    }
}

// Navigation Event Listeners
document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = e.currentTarget.getAttribute('data-section');
        showSection(section);
    });
});

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize state from localStorage
    state.expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    state.budgets = JSON.parse(localStorage.getItem('budgets')) || [];
    state.goals = JSON.parse(localStorage.getItem('goals')) || [];
    
    // Show dashboard section by default
    showSection('dashboard');
    
    // Initialize language and currency
    initializeLocalization();
    
    // Initialize charts with improved responsiveness
    const charts = initializeCharts();
    Object.values(charts || {}).forEach(setupChartResponsiveness);
    
    // Add mobile interactions
    addTouchInteractions();
    setupMobileModals();
    
    // Update UI
    updateExpensesList();
    updateBudgetList();
    updateGoalsList();
    updateStats();
    
    // Add event listeners for buttons
    const addExpenseBtn = document.getElementById('add-expense-btn');
    const addBudgetBtn = document.getElementById('add-budget-btn');
    const addGoalBtn = document.getElementById('add-goal-btn');
    
    if (addExpenseBtn) {
        addExpenseBtn.addEventListener('click', () => openModal('#add-expense-modal'));
    }
    if (addBudgetBtn) {
        addBudgetBtn.addEventListener('click', () => openModal('#add-budget-modal'));
    }
    if (addGoalBtn) {
        addGoalBtn.addEventListener('click', () => openModal('#add-goal-modal'));
    }
    
    // Add event listeners for forms
    const expenseForm = document.getElementById('add-expense-form');
    const budgetForm = document.getElementById('add-budget-form');
    const goalForm = document.getElementById('add-goal-form');
    
    if (expenseForm) {
        expenseForm.addEventListener('submit', handleExpenseSubmit);
    }
    if (budgetForm) {
        budgetForm.addEventListener('submit', handleBudgetSubmit);
    }
    if (goalForm) {
        goalForm.addEventListener('submit', handleGoalSubmit);
    }
    
    // Add event listeners for modal close buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Add event listener for theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}); 