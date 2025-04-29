// Expense data storage
let expenses = [];

// DOM Elements
let expenseForm, expenseTableBody, totalAmountElement, categoryBreakdownElement;

// Initialize DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    expenseForm = document.getElementById('expense-form');
    expenseTableBody = document.getElementById('expense-table-body');
    totalAmountElement = document.getElementById('total-amount');
    categoryBreakdownElement = document.getElementById('category-breakdown');

    // Set today's date as default
    document.getElementById('date').valueAsDate = new Date();

    // Initialize tooltips
    initializeTooltips();

    if (expenseForm) {
        expenseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addExpense();
        });

        // Add input validation
        const amountInput = document.getElementById('amount');
        amountInput.addEventListener('input', (e) => {
            const value = e.target.value;
            if (value && value < 0) {
                e.target.value = Math.abs(value);
            }
        });
    }

    displayExpenseList();
    updateExpenseSummary();
});

// Functions
function addExpense() {
    console.log('Adding expense...');
    
    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);

    console.log('Form values:', { date, category, description, amount });

    // Validate input
    if (!date || !category || !description || isNaN(amount)) {
        showNotification('Please fill in all fields with valid values', 'error');
        return;
    }

    // Create new expense object
    const expense = {
        id: Date.now(),
        date,
        category,
        description,
        amount
    };

    // Add to expenses array
    expenses.push(expense);
    console.log('Current expenses:', expenses);

    // Update UI
    displayExpenseList();
    updateExpenseSummary();

    // Reset form and show success message
    expenseForm.reset();
    document.getElementById('date').valueAsDate = new Date();
    showNotification('Expense added successfully!', 'success');
}

function displayExpenseList() {
    console.log('Displaying expense list');
    if (!expenseTableBody) {
        console.error('Expense table body not found!');
        return;
    }

    expenseTableBody.innerHTML = '';

    if (expenses.length === 0) {
        const emptyState = document.createElement('tr');
        emptyState.innerHTML = `
            <td colspan="5" class="empty-state">
                <p>No expenses added yet. Add your first expense using the form above!</p>
            </td>
        `;
        expenseTableBody.appendChild(emptyState);
        return;
    }

    expenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(expense.date)}</td>
            <td>
                <span class="category-badge ${expense.category.toLowerCase()}">
                    ${expense.category}
                </span>
            </td>
            <td>${expense.description}</td>
            <td>$${expense.amount.toFixed(2)}</td>
            <td>
                <button onclick="deleteExpense(${expense.id})" class="delete-btn" 
                        title="Delete this expense">Delete</button>
            </td>
        `;
        expenseTableBody.appendChild(row);
    });
}

function deleteExpense(id) {
    console.log('Deleting expense:', id);
    
    if (confirm('Are you sure you want to delete this expense?')) {
        expenses = expenses.filter(expense => expense.id !== id);
        displayExpenseList();
        updateExpenseSummary();
        showNotification('Expense deleted successfully!', 'success');
    }
}

function updateExpenseSummary() {
    console.log('Updating expense summary');
    if (!totalAmountElement || !categoryBreakdownElement) {
        console.error('Summary elements not found!');
        return;
    }

    // Calculate total
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    totalAmountElement.textContent = formatCurrency(total);

    // Calculate by category
    const categoryTotals = {};
    expenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    // Display category breakdown
    categoryBreakdownElement.innerHTML = '';
    
    if (Object.keys(categoryTotals).length === 0) {
        categoryBreakdownElement.innerHTML = `
            <div class="empty-state">
                <p>Add expenses to see category breakdown</p>
            </div>
        `;
        return;
    }

    const sortedCategories = Object.entries(categoryTotals)
        .sort(([,a], [,b]) => b - a);

    sortedCategories.forEach(([category, amount]) => {
        const percentage = (amount / total * 100).toFixed(1);
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category-item';
        categoryElement.innerHTML = `
            <div class="category-info">
                <span class="category-name">${category}</span>
                <span class="category-percentage">${percentage}%</span>
            </div>
            <span class="category-amount">${formatCurrency(amount)}</span>
        `;
        categoryBreakdownElement.appendChild(categoryElement);
    });
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function initializeTooltips() {
    const tooltips = document.querySelectorAll('[title]');
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = e.target.getAttribute('title');
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
    tooltip.style.left = `${rect.left + (rect.width - tooltip.offsetWidth) / 2}px`;
    
    setTimeout(() => tooltip.classList.add('show'), 10);
}
