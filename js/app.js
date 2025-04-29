// State Management
const state = {
    expenses: [],
    budgets: [],
    goals: [],
    theme: 'light',
    language: 'en',
    currency: 'USD',
    exchangeRate: 1
};

// DOM Elements
const elements = {
    mobileNavToggle: document.querySelector('.mobile-nav-toggle'),
    sidebar: document.querySelector('.sidebar'),
    mainContent: document.querySelector('.main-content'),
    sections: document.querySelectorAll('.section'),
    navLinks: document.querySelectorAll('.nav-item'),
    modals: document.querySelectorAll('.modal'),
    forms: {
        expense: document.querySelector('#add-expense-form'),
        budget: document.querySelector('#add-budget-form'),
        goal: document.querySelector('#add-goal-form')
    },
    languageSelect: document.querySelector('#language-select'),
    currencySelect: document.querySelector('#currency-select')
};

// Initialize State
function initializeState() {
    const savedState = localStorage.getItem('expenseTrackerState');
    if (savedState) {
        Object.assign(state, JSON.parse(savedState));
    }
    updateUI();
}

// Save State
function saveState() {
    localStorage.setItem('expenseTrackerState', JSON.stringify(state));
}

// Mobile Navigation
function setupMobileNavigation() {
    if (!elements.mobileNavToggle || !elements.sidebar) return;

    elements.mobileNavToggle.addEventListener('click', () => {
        elements.sidebar.classList.toggle('active');
        document.body.classList.toggle('modal-open');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (!elements.sidebar.contains(e.target) && 
            !elements.mobileNavToggle.contains(e.target) && 
            elements.sidebar.classList.contains('active')) {
            elements.sidebar.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = touchEndX - touchStartX;

        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0 && !elements.sidebar.classList.contains('active')) {
                elements.sidebar.classList.add('active');
                document.body.classList.add('modal-open');
            } else if (swipeDistance < 0 && elements.sidebar.classList.contains('active')) {
                elements.sidebar.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
        }
    }
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
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });

    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        elements.sidebar.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

// Modal Functions
function openModal(modalId) {
    const modal = document.querySelector(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    }
}

function closeModal(modalId) {
    const modal = document.querySelector(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

// Form Handlers
function handleExpenseSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const expense = {
        id: Date.now(),
        date: form.date.value,
        category: form.category.value,
        description: form.description.value,
        amount: parseFloat(form.amount.value),
        currency: state.currency
    };

    state.expenses.push(expense);
    saveState();
    updateUI();
    form.reset();
    closeModal('#add-expense-modal');
}

function handleBudgetSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const budget = {
        id: Date.now(),
        category: form.category.value,
        amount: parseFloat(form.amount.value),
        period: form.period.value || 'monthly',
        currency: state.currency
    };

    state.budgets.push(budget);
    saveState();
    updateUI();
    form.reset();
    closeModal('#add-budget-modal');
}

function handleGoalSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const goal = {
        id: Date.now(),
        name: form.name.value,
        target: parseFloat(form.target.value),
        saved: parseFloat(form.saved.value) || 0,
        deadline: form.deadline.value,
        currency: state.currency
    };

    state.goals.push(goal);
    saveState();
    updateUI();
    form.reset();
    closeModal('#add-goal-modal');
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            showSection(sectionId);
        });
    });

    // Add Buttons
    document.querySelectorAll('.add-button').forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.getAttribute('data-modal');
            openModal(modalId);
        });
    });

    // Form Submissions
    if (elements.forms.expense) {
        elements.forms.expense.addEventListener('submit', handleExpenseSubmit);
    }
    if (elements.forms.budget) {
        elements.forms.budget.addEventListener('submit', handleBudgetSubmit);
    }
    if (elements.forms.goal) {
        elements.forms.goal.addEventListener('submit', handleGoalSubmit);
    }

    // Modal Close Buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                closeModal(`#${modal.id}`);
            }
        });
    });

    // Language and Currency Switchers
    if (elements.languageSelect) {
        elements.languageSelect.addEventListener('change', (e) => {
            state.language = e.target.value;
            saveState();
            updateUI();
        });
    }

    if (elements.currencySelect) {
        elements.currencySelect.addEventListener('change', (e) => {
            state.currency = e.target.value;
            saveState();
            updateUI();
        });
    }
}

// Update UI
function updateUI() {
    // Update language
    document.documentElement.lang = state.language;

    // Update currency
    document.querySelectorAll('.amount').forEach(element => {
        const amount = parseFloat(element.getAttribute('data-amount'));
        if (!isNaN(amount)) {
            element.textContent = formatCurrency(amount, state.currency);
        }
    });

    // Update theme
    document.documentElement.setAttribute('data-theme', state.theme);

    // Update lists
    updateExpensesList();
    updateBudgetsList();
    updateGoalsList();

    // Update summaries
    updateExpenseSummary();
    updateBudgetSummary();
    updateGoalSummary();
}

// Format Currency
function formatCurrency(amount, currency) {
    return new Intl.NumberFormat(state.language === 'en' ? 'en-US' : 'es-DO', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeState();
    setupMobileNavigation();
    setupEventListeners();
    showSection('dashboard');
}); 