const STORAGE_KEY = "expenseTrackerTransactions";

const form = document.querySelector("#transaction-form");
const transactionIdInput = document.querySelector("#transaction-id");
const descriptionInput = document.querySelector("#description");
const amountInput = document.querySelector("#amount");
const typeInput = document.querySelector("#type");
const categoryInput = document.querySelector("#category");
const filterInput = document.querySelector("#filter");

const list = document.querySelector("#transaction-list");
const emptyState = document.querySelector("#empty-state");
const formTitle = document.querySelector("#form-title");
const submitButton = document.querySelector("#submit-button");
const cancelEditButton = document.querySelector("#cancel-edit");

const balanceOutput = document.querySelector("#balance");
const incomeOutput = document.querySelector("#income-total");
const expenseOutput = document.querySelector("#expense-total");
const countOutput = document.querySelector("#record-count");

let transactions = loadTransactions();

function loadTransactions() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function createId() {
  return Date.now().toString() + Math.random().toString(16).slice(2);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

function getTotals() {
  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + item.amount, 0);

  const expenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + item.amount, 0);

  return {
    income: income,
    expenses: expenses,
    balance: income - expenses,
    count: transactions.length,
  };
}

function renderSummary() {
  const totals = getTotals();

  balanceOutput.textContent = formatCurrency(totals.balance);
  incomeOutput.textContent = formatCurrency(totals.income);
  expenseOutput.textContent = formatCurrency(totals.expenses);
  countOutput.textContent = totals.count;
}

function renderTransactions() {
  const filter = filterInput.value;

  const visibleTransactions =
    filter === "all"
      ? transactions
      : transactions.filter((item) => item.type === filter);

  list.innerHTML = "";

  visibleTransactions.forEach(function (transaction) {
    const item = document.createElement("li");
    item.className = "transaction-item " + transaction.type;
    item.dataset.id = transaction.id;

    const left = document.createElement("div");

    const title = document.createElement("div");
    title.className = "transaction-title";

    const description = document.createElement("span");
    description.textContent = transaction.description;

    const category = document.createElement("span");
    category.className = "category-pill";
    category.textContent = transaction.category;

    const meta = document.createElement("p");
    meta.className = "transaction-meta";
    meta.textContent = transaction.type === "income" ? "Income" : "Expense";

    title.appendChild(description);
    title.appendChild(category);
    left.appendChild(title);
    left.appendChild(meta);

    const right = document.createElement("div");

    const amount = document.createElement("span");
    amount.className = "transaction-amount";
    amount.textContent =
      (transaction.type === "expense" ? "-" : "+") +
      formatCurrency(transaction.amount);

    const actions = document.createElement("div");
    actions.className = "actions";

    const editButton = document.createElement("button");
    editButton.className = "action-button";
    editButton.type = "button";
    editButton.dataset.action = "edit";
    editButton.textContent = "Edit";

    const deleteButton = document.createElement("button");
    deleteButton.className = "action-button delete";
    deleteButton.type = "button";
    deleteButton.dataset.action = "delete";
    deleteButton.textContent = "Delete";

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    right.appendChild(amount);
    right.appendChild(actions);

    item.appendChild(left);
    item.appendChild(right);
    list.appendChild(item);
  });

  emptyState.textContent =
    filter === "all"
      ? "No transactions yet. Add your first record to begin."
      : "No transactions match this filter.";

  emptyState.classList.toggle("hidden", visibleTransactions.length > 0);
}

function syncAndRender() {
  saveTransactions();
  renderSummary();
  renderTransactions();
}

function resetForm() {
  form.reset();
  transactionIdInput.value = "";
  formTitle.textContent = "Add Transaction";
  submitButton.textContent = "Add Transaction";
  cancelEditButton.classList.add("hidden");
}

function startEdit(transaction) {
  transactionIdInput.value = transaction.id;
  descriptionInput.value = transaction.description;
  amountInput.value = transaction.amount;
  typeInput.value = transaction.type;
  categoryInput.value = transaction.category;

  formTitle.textContent = "Edit Transaction";
  submitButton.textContent = "Update Transaction";
  cancelEditButton.classList.remove("hidden");
  descriptionInput.focus();
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const transaction = {
    id: transactionIdInput.value || createId(),
    description: descriptionInput.value.trim(),
    amount: Number(amountInput.value),
    type: typeInput.value,
    category: categoryInput.value.trim(),
  };

  if (!transaction.description || !transaction.category || transaction.amount <= 0) {
    alert("Please enter valid transaction details.");
    return;
  }

  if (transactionIdInput.value) {
    transactions = transactions.map(function (item) {
      return item.id === transaction.id ? transaction : item;
    });
  } else {
    transactions.unshift(transaction);
  }

  resetForm();
  syncAndRender();
});

list.addEventListener("click", function (event) {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  const item = button.closest(".transaction-item");
  const transaction = transactions.find(function (record) {
    return record.id === item.dataset.id;
  });

  if (!transaction) {
    return;
  }

  if (button.dataset.action === "edit") {
    startEdit(transaction);
  }

  if (button.dataset.action === "delete") {
    transactions = transactions.filter(function (record) {
      return record.id !== transaction.id;
    });

    resetForm();
    syncAndRender();
  }
});

filterInput.addEventListener("change", renderTransactions);
cancelEditButton.addEventListener("click", resetForm);

syncAndRender();