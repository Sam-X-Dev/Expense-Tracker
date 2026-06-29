// Handles localStorage persistence for all transaction records.

const STORAGE_KEY = "expenseTrackerTransactions";

export function loadTransactions() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    return [];
  }

  try {
    const transactions = JSON.parse(savedData);
    return Array.isArray(transactions) ? transactions : [];
  } catch {
    return [];
  }
}

export function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}