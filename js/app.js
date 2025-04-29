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
    mobileNavToggle: document.querySelector('.mobile-nav-toggle'),
    sidebar: document.querySelector('.sidebar'),
    mainContent: document.querySelector('.main-content'),
    sections: document.querySelectorAll('.section'),
    navLinks: document.querySelectorAll('.sidebar-nav a'),
    modals: document.querySelectorAll('.modal'),
    forms: {
        expense: document.getElementById('add-expense-form'),
        budget: document.getElementById('add-budget-form'),
        goal: document.getElementById('add-goal-form')
    },
    buttons: {
        addExpense: document.getElementById('add-expense-btn'),
        addBudget: document.getElementById('add-budget-btn'),
        addGoal: document.getElementById('add-goal-btn')
    }
};

// Mobile Navigation
function setupMobileNavigation() {
    if (elements.mobileNavToggle && elements.sidebar) {
        // Toggle sidebar on mobile menu click
        elements.mobileNavToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            elements.sidebar.classList.toggle('active');
            elements.mobileNavToggle.classList.toggle('active');
        });

        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                elements.sidebar.classList.contains('active') && 
                !elements.sidebar.contains(e.target) && 
                !elements.mobileNavToggle.contains(e.target)) {
                elements.sidebar.classList.remove('active');
                elements.mobileNavToggle.classList.remove('active');
            }
        });

        // Prevent sidebar clicks from closing it
        elements.sidebar.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

// Section Navigation
function showSection(sectionId) {
    // Hide all sections
    elements.sections.forEach(section => {
        section.style.display = 'none';
    });

    // Show selected section
    const selectedSection = document.getElementById(`${sectionId}-section`);
    if (selectedSection) {
        selectedSection.style.display = 'block';
    }

    // Update active navigation item
    elements.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });

    // Close mobile sidebar after navigation
    if (window.innerWidth <= 768) {
        elements.sidebar.classList.remove('active');
        elements.mobileNavToggle.classList.remove('active');
    }
}

// Modal Functions
function openModal(modalId) {
    const modal = document.querySelector(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.classList.add('modal-open');
        
        // Focus first input in modal
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) {
            firstInput.focus();
        }
    }
}

function closeModal(modalId) {
    const modal = document.querySelector(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        
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
        currency: state.currency
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
        currency: state.currency
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
        currency: state.currency
    };
    
    state.goals = state.goals || [];
    state.goals.push(goal);
    localStorage.setItem('goals', JSON.stringify(state.goals));
    updateGoalsList();
    closeModal('#add-goal-modal');
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.currentTarget.getAttribute('data-section');
            showSection(section);
        });
    });

    // Add buttons
    if (elements.buttons.addExpense) {
        elements.buttons.addExpense.addEventListener('click', () => openModal('#add-expense-modal'));
    }
    if (elements.buttons.addBudget) {
        elements.buttons.addBudget.addEventListener('click', () => openModal('#add-budget-modal'));
    }
    if (elements.buttons.addGoal) {
        elements.buttons.addGoal.addEventListener('click', () => openModal('#add-goal-modal'));
    }

    // Forms
    if (elements.forms.expense) {
        elements.forms.expense.addEventListener('submit', handleExpenseSubmit);
    }
    if (elements.forms.budget) {
        elements.forms.budget.addEventListener('submit', handleBudgetSubmit);
    }
    if (elements.forms.goal) {
        elements.forms.goal.addEventListener('submit', handleGoalSubmit);
    }

    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const modal = e.target.closest('.modal');
            if (modal) {
                closeModal(`#${modal.id}`);
            }
        });
    });

    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(`#${e.target.id}`);
        }
    });

    // Prevent modal content clicks from closing modal
    document.querySelectorAll('.modal-content').forEach(content => {
        content.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });

    // Handle escape key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(`#${activeModal.id}`);
            }
        }
    });

    // Handle touch events for mobile
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
}

// Touch event handlers
let touchStartX = 0;
let touchEndX = 0;

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
}

function handleTouchMove(e) {
    touchEndX = e.touches[0].clientX;
}

function handleTouchEnd() {
    const swipeDistance = touchEndX - touchStartX;
    if (Math.abs(swipeDistance) > 50) { // Minimum swipe distance
        if (swipeDistance > 0 && !elements.sidebar.classList.contains('active')) {
            // Swipe right to open sidebar
            elements.sidebar.classList.add('active');
            elements.mobileNavToggle.classList.add('active');
        } else if (swipeDistance < 0 && elements.sidebar.classList.contains('active')) {
            // Swipe left to close sidebar
            elements.sidebar.classList.remove('active');
            elements.mobileNavToggle.classList.remove('active');
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize state from localStorage
    state.expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    state.budgets = JSON.parse(localStorage.getItem('budgets')) || [];
    state.goals = JSON.parse(localStorage.getItem('goals')) || [];
    
    // Setup mobile navigation
    setupMobileNavigation();
    
    // Setup event listeners
    setupEventListeners();
    
    // Show dashboard by default
    showSection('dashboard');
    
    // Initialize other functionality
    initializeLocalization();
    initializeCharts();
    updateExpensesList();
    updateBudgetList();
    updateGoalsList();
    updateStats();
}); 