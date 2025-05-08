// Expense data storage
let expenses = [];

// DOM Elements
const expenseForm = document.getElementById('expense-form');
const expenseTableBody = document.getElementById('expense-table-body');
const totalAmountElement = document.getElementById('total-amount');
const categoryBreakdownElement = document.getElementById('category-breakdown');

// Initialize DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // Log if elements are found
    console.log('Form found:', expenseForm !== null);
    console.log('Expense table body found:', expenseTableBody !== null);
    console.log('Total amount element found:', totalAmountElement !== null);
    console.log('Category breakdown element found:', categoryBreakdownElement !== null);

    if (expenseForm) {
        expenseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addExpense(e);
        });
    }

    displayExpenseList();
    updateExpenseSummary();
});

// Functions
function addExpense(e) {
    e.preventDefault();
    
    // Get form values
    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    
    // Validate input
    if (!date || !category || !description || isNaN(amount) || amount <= 0) {
        alert('Please fill in all fields with valid values');
        return;
    }
    
    // Create expense object
    const expense = {
        id: Date.now(),
        date,
        category,
        description,
        amount
    };
    
    // Add to expenses array
    expenses.push(expense);
    
    // Update UI
    displayExpenseList();
    updateExpenseSummary();
    
    // Reset form
    expenseForm.reset();
}

function displayExpenseList() {
    console.log('Displaying expense list');
    if (!expenseTableBody) {
        console.error('Expense table body not found!');
        return;
    }

    expenseTableBody.innerHTML = '';

    expenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(expense.date)}</td>
            <td>${expense.category}</td>
            <td>${expense.description}</td>
            <td>$${expense.amount.toFixed(2)}</td>
            <td>
                <button onclick="deleteExpense(${expense.id})" class="delete-btn">Delete</button>
            </td>
        `;
        expenseTableBody.appendChild(row);
    });
}

function deleteExpense(id) {
    console.log('Deleting expense:', id);
    expenses = expenses.filter(expense => expense.id !== id);
    displayExpenseList();
    updateExpenseSummary();
}

function updateExpenseSummary() {
    console.log('Updating expense summary');
    if (!totalAmountElement || !categoryBreakdownElement) {
        console.error('Summary elements not found!');
        return;
    }

    // Calculate total expenses
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    totalAmountElement.textContent = `$${total.toFixed(2)}`;
    
    // Calculate expenses by category
    const categoryTotals = {};
    expenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    
    // Update category summary
    categoryBreakdownElement.innerHTML = '';
    for (const [category, amount] of Object.entries(categoryTotals)) {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category-item';
        categoryElement.innerHTML = `
            <span>${category}</span>
            <span>$${amount.toFixed(2)}</span>
        `;
        categoryBreakdownElement.appendChild(categoryElement);
    }
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}
