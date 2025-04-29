// State Management
const state = {
    expenses: [],
    budgets: [],
    goals: [],
    theme: 'light',
    language: 'en',
    currency: 'USD'
};

// DOM Elements
const elements = {
    // Mobile Navigation
    mobileNavToggle: document.getElementById('mobile-nav-toggle'),
    sidebar: document.querySelector('.sidebar'),
    
    // Navigation
    navLinks: document.querySelectorAll('.nav-link'),
    sections: document.querySelectorAll('.section'),
    
    // Modals
    modals: {
        expense: document.getElementById('expense-modal'),
        budget: document.getElementById('budget-modal'),
        goal: document.getElementById('goal-modal')
    },
    
    // Forms
    forms: {
        expense: document.getElementById('expense-form'),
        budget: document.getElementById('budget-form'),
        goal: document.getElementById('goal-form')
    },
    
    // Lists
    lists: {
        expenses: document.getElementById('expenses-list'),
        budgets: document.getElementById('budgets-list'),
        goals: document.getElementById('goals-list')
    },
    
    // Summary Cards
    summary: {
        totalExpenses: document.getElementById('total-expenses'),
        monthlyBudget: document.getElementById('monthly-budget'),
        totalSavings: document.getElementById('total-savings')
    },
    
    // Settings
    themeToggle: document.getElementById('theme-toggle'),
    languageSelect: document.getElementById('language-select'),
    currencySelect: document.getElementById('currency-select'),
    
    // Currency Converter
    converter: {
        amount: document.getElementById('converter-amount'),
        from: document.getElementById('converter-from'),
        to: document.getElementById('converter-to'),
        button: document.getElementById('convert-btn'),
        result: document.getElementById('converter-result')
    }
};

// Mobile Navigation
function setupMobileNavigation() {
    elements.mobileNavToggle.addEventListener('click', () => {
        elements.sidebar.classList.toggle('active');
    });
    
    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (!elements.sidebar.contains(e.target) && !elements.mobileNavToggle.contains(e.target)) {
            elements.sidebar.classList.remove('active');
        }
    });
}

// Section Navigation
function showSection(sectionId) {
    elements.sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === sectionId) {
            section.classList.add('active');
        }
    });
    
    elements.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
    
    // Close sidebar on mobile
    elements.sidebar.classList.remove('active');
}

// Modal Functions
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Form Handlers
function handleExpenseForm(e) {
    e.preventDefault();
    
    const expense = {
        id: Date.now(),
        amount: parseFloat(elements.forms.expense.querySelector('#expense-amount').value),
        category: elements.forms.expense.querySelector('#expense-category').value,
        description: elements.forms.expense.querySelector('#expense-description').value,
        date: elements.forms.expense.querySelector('#expense-date').value
    };
    
    state.expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(state.expenses));
    updateExpensesList();
    closeModal(elements.modals.expense);
    e.target.reset();
}

function handleBudgetForm(e) {
    e.preventDefault();
    
    const budget = {
        id: Date.now(),
        category: elements.forms.budget.querySelector('#budget-category').value,
        amount: parseFloat(elements.forms.budget.querySelector('#budget-amount').value),
        period: elements.forms.budget.querySelector('#budget-period').value
    };
    
    state.budgets.push(budget);
    localStorage.setItem('budgets', JSON.stringify(state.budgets));
    updateBudgetsList();
    closeModal(elements.modals.budget);
    e.target.reset();
}

function handleGoalForm(e) {
    e.preventDefault();
    
    const goal = {
        id: Date.now(),
        name: elements.forms.goal.querySelector('#goal-name').value,
        target: parseFloat(elements.forms.goal.querySelector('#goal-target').value),
        saved: parseFloat(elements.forms.goal.querySelector('#goal-saved').value),
        deadline: elements.forms.goal.querySelector('#goal-deadline').value
    };
    
    state.goals.push(goal);
    localStorage.setItem('goals', JSON.stringify(state.goals));
    updateGoalsList();
    closeModal(elements.modals.goal);
    e.target.reset();
}

// List Updates
function updateExpensesList() {
    elements.lists.expenses.innerHTML = state.expenses.map(expense => `
        <div class="expense-item">
            <div class="expense-info">
                <h3>${expense.description}</h3>
                <span class="category">${expense.category}</span>
            </div>
            <div class="expense-amount">
                ${formatCurrency(expense.amount)}
            </div>
            <div class="expense-date">
                ${formatDate(expense.date)}
            </div>
        </div>
    `).join('');
    
    updateSummary();
}

function updateBudgetsList() {
    elements.lists.budgets.innerHTML = state.budgets.map(budget => `
        <div class="budget-item">
            <div class="budget-info">
                <h3>${budget.category}</h3>
                <span class="period">${budget.period}</span>
            </div>
            <div class="budget-amount">
                ${formatCurrency(budget.amount)}
            </div>
        </div>
    `).join('');
    
    updateSummary();
}

function updateGoalsList() {
    elements.lists.goals.innerHTML = state.goals.map(goal => `
        <div class="goal-item">
            <div class="goal-info">
                <h3>${goal.name}</h3>
                <span class="deadline">${formatDate(goal.deadline)}</span>
            </div>
            <div class="goal-progress">
                <div class="progress-bar">
                    <div class="progress" style="width: ${(goal.saved / goal.target) * 100}%"></div>
                </div>
                <div class="goal-amounts">
                    <span class="saved">${formatCurrency(goal.saved)}</span>
                    <span class="target">${formatCurrency(goal.target)}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    updateSummary();
}

// Summary Updates
function updateSummary() {
    const totalExpenses = state.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const monthlyBudget = state.budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSavings = state.goals.reduce((sum, goal) => sum + goal.saved, 0);
    
    elements.summary.totalExpenses.textContent = formatCurrency(totalExpenses);
    elements.summary.monthlyBudget.textContent = formatCurrency(monthlyBudget);
    elements.summary.totalSavings.textContent = formatCurrency(totalSavings);
}

// Currency Converter
function handleCurrencyConversion() {
    const amount = parseFloat(elements.converter.amount.value);
    const from = elements.converter.from.value;
    const to = elements.converter.to.value;
    
    if (isNaN(amount)) {
        elements.converter.result.textContent = 'Please enter a valid amount';
        return;
    }
    
    const rate = from === 'USD' ? 56.5 : 1/56.5; // Example rate
    const converted = amount * rate;
    
    elements.converter.result.textContent = `${formatCurrency(amount, from)} = ${formatCurrency(converted, to)}`;
}

// Theme Toggle
function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', state.theme);
    localStorage.setItem('theme', state.theme);
}

// Language Toggle
function toggleLanguage() {
    state.language = elements.languageSelect.value;
    localStorage.setItem('language', state.language);
    // Implement language switching logic here
}

// Currency Toggle
function toggleCurrency() {
    state.currency = elements.currencySelect.value;
    localStorage.setItem('currency', state.currency);
    updateSummary();
}

// Utility Functions
function formatCurrency(amount, currency = state.currency) {
    return new Intl.NumberFormat(state.language === 'en' ? 'en-US' : 'es-DO', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString(state.language === 'en' ? 'en-US' : 'es-DO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            showSection(sectionId);
        });
    });
    
    // Modals
    Object.values(elements.modals).forEach(modal => {
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', () => closeModal(modal));
    });
    
    // Forms
    elements.forms.expense.addEventListener('submit', handleExpenseForm);
    elements.forms.budget.addEventListener('submit', handleBudgetForm);
    elements.forms.goal.addEventListener('submit', handleGoalForm);
    
    // Settings
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.languageSelect.addEventListener('change', toggleLanguage);
    elements.currencySelect.addEventListener('change', toggleCurrency);
    
    // Currency Converter
    elements.converter.button.addEventListener('click', handleCurrencyConversion);
}

// Initialize
function initialize() {
    // Load state from localStorage
    state.expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    state.budgets = JSON.parse(localStorage.getItem('budgets')) || [];
    state.goals = JSON.parse(localStorage.getItem('goals')) || [];
    state.theme = localStorage.getItem('theme') || 'light';
    state.language = localStorage.getItem('language') || 'en';
    state.currency = localStorage.getItem('currency') || 'USD';
    
    // Set initial theme
    document.body.setAttribute('data-theme', state.theme);
    
    // Set initial language and currency
    elements.languageSelect.value = state.language;
    elements.currencySelect.value = state.currency;
    
    // Setup event listeners
    setupEventListeners();
    setupMobileNavigation();
    
    // Update UI
    updateExpensesList();
    updateBudgetsList();
    updateGoalsList();
    updateSummary();
    
    // Show dashboard by default
    showSection('dashboard');
}

// Start the app
document.addEventListener('DOMContentLoaded', initialize); 