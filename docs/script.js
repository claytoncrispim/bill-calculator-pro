/**
 * @file script.js
 * @description Main JavaScript file for the Bill Calculator application.
 * This file handles UI logic, such as DOM manipulation and event handling.
 * It orchestrates interactions with the BillManager for all
 * data-related operations, acting as the UI layer.
 * @author [Clayton Crispim]
 * @version 10.0.0 (Implemented Asynchronous Error Handling with Toast Notifications)
 * @date 2025-06-26
 *
 * Distributed under the MIT License.
 */

// --- IMPORTS ---
import Bill from "./components/Bill.js";
import BillManager from "./components/BillManager.js";


// --- STATE MANAGEMENT INSTANCE ---
const appBillManager = new BillManager();


// --- DOM ELEMENTS ---
const billForm = document.querySelector('#bill-form');
const billsListContainer = document.querySelector('#bills-list');
const totalPaidDisplay = document.querySelector('#total-paid');
const totalPendingDisplay = document.querySelector('#total-pending');
const totalUnpaidDisplay = document.querySelector('#total-unpaid');
const filterButtonsContainer = document.querySelector('#filter-buttons-container');
const billTypeSelect = document.querySelector('#billType');
const sortBySelect = document.querySelector('#sort-by');
const streamingNameContainer = document.querySelector('#streamingName-container');
const otherTypeContainer = document.querySelector('#otherType-container');
const editModalEl = document.querySelector('#editBillModal');
const editBillForm = document.querySelector('#edit-bill-form');
const editBillIdInput = document.querySelector('#edit-bill-id');
const editAmountInput = document.querySelector('#edit-amount');
const editStatusSelect = document.querySelector('#edit-status');
const editModal = new bootstrap.Modal(editModalEl);
const loadingSpinner = document.querySelector('#loading-spinner');

// --- NEW DOM ELEMENTS FOR NOTIFICATIONS ---
const notificationToastEl = document.querySelector('#app-notification-toast');
const notificationToastBody = document.querySelector('#toast-body');
const notificationToast = new bootstrap.Toast(notificationToastEl);


// --- FUNCTIONS FOR UI RENDERING AND EVENT HANDLING ---

/**
 * Updates the UI based on the BillManager's loading state.
 * It shows or hides the loading spinner.
 */
function updateUIForLoading() {
  if (appBillManager.isLoading) {
    loadingSpinner.classList.remove('d-none');
  } else {
    loadingSpinner.classList.add('d-none');
  }
}

/**
 * Displays a non-intrusive toast notification to the user.
 * @param {string} message - The message to display in the notification.
 * @param {boolean} isError - True if it's an error message, false for success.
 */
function showNotification(message, isError = false) {
  notificationToastBody.textContent = message;
  notificationToastEl.classList.remove('bg-success', 'bg-danger');
  if (isError) {
    notificationToastEl.classList.add('bg-danger');
  } else {
    notificationToastEl.classList.add('bg-success');
  }
  notificationToast.show();
}

/**
 * Renders the list of bills to the page. It retrieves the filtered and sorted
 * list of bills directly from the BillManager, ensuring the display
 * reflects the current application state.
 */
function renderBills() {
  const statusColors = { Paid: 'success', Unpaid: 'danger', Pending: 'warning' };
  const billsToDisplay = appBillManager.getDisplayBills();
  billsListContainer.innerHTML = '';

  if (billsToDisplay.length === 0) {
    billsListContainer.innerHTML = '<p class="text-center text-muted">' +
                                   'No bills to display.</p>';
    return;
  }

  const billsHtml = billsToDisplay.map(bill => {
    const displayName = bill.name || bill.type;
    return `
      <div class="card mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h5 class="card-title">${displayName}</h5>
              <h6 class="card-subtitle mb-2 text-muted">${bill.type} Bill</h6>
            </div>
            <span class="badge bg-${statusColors[bill.status]}">${bill.status}</span>
          </div>
          <p class="card-text">
            <strong>Amount:</strong> ${bill.amount.value.toFixed(2)} ${bill.amount.currency}
          </p>
          <p class="card-text">
            <strong>Payment Method:</strong> ${bill.paymentMethod}
          </p>
          <button class="btn btn-outline-secondary btn-sm edit-btn me-2" data-bill-id="${bill.id}">
            Edit
          </button>
          <button class="btn btn-outline-danger btn-sm delete-btn" data-bill-id="${bill.id}">
            Delete Bill
          </button>
        </div>
      </div>
    `;
  }).join('');

  billsListContainer.innerHTML = billsHtml;
}


/**
 * Calculates and renders total amounts for each status category (Paid, Unpaid, Pending)
 * by delegating to the BillManager and renders them to the appropriate
 * display elements on the page.
 */
function calculateAndRenderTotal() {
  const totals = appBillManager.getTotalsByStatus();
  totalPaidDisplay.textContent = `€${totals.Paid.toFixed(2)}`;
  totalPendingDisplay.textContent = `€${totals.Pending.toFixed(2)}`;
  totalUnpaidDisplay.textContent = `€${totals.Unpaid.toFixed(2)}`;
}

/**
 * Handles changes in the 'Bill Type' dropdown, dynamically showing or hiding
 * related input fields (e.g., 'Streaming Name' or 'Other Type').
 */
function handleBillTypeChange() {
  const selectedValue = billTypeSelect.value;
  streamingNameContainer.classList.add('d-none');
  otherTypeContainer.classList.add('d-none');

  if (selectedValue === 'Streaming') {
    streamingNameContainer.classList.remove('d-none');
  } else if (selectedValue === 'Other') {
    otherTypeContainer.classList.remove('d-none');
  }
}

/**
 * Deletes a bill from the application state by delegating to BillManager.
 * After deletion, it triggers a UI refresh.
 * @param {string} id The unique ID of the bill to delete.
 * @async
 */
async function deleteBill(id) {
  appBillManager.setLoading(true);
  updateUIForLoading();
  try {
    console.log('Deleting bill (simulated delay)...');
    await appBillManager.deleteBill(id);
    showNotification('Bill deleted successfully.');
    console.log('Bill deleted. Updating UI...');
    renderBills();
    calculateAndRenderTotal();
  } catch (error) {
    console.error("Error deleting bill:", error);
    showNotification(`Failed to delete bill: ${error.message || 'Unknown error'}.`, true);
    renderBills();
    calculateAndRenderTotal();
  } finally {
    appBillManager.setLoading(false);
    updateUIForLoading();
  }
}

/**
 * Opens the "Edit Bill" modal and populates its form fields with data
 * from the specified bill object.
 * @param {object} bill The bill object to be edited.
 */
function openEditModal(bill) {
  editBillIdInput.value = bill.id;
  editAmountInput.value = bill.amount.value;
  editStatusSelect.value = bill.status;
  editModal.show();
}

/**
 * Handles the submission of the main 'Add Bill' form.
 * Delegates bill creation and saving to BillManager, then updates the UI.
 * @param {Event} event The form submission event object provided by the browser.
 * @async
 */
async function handleSubmit(event) {
  event.preventDefault();

  const formData = new FormData(billForm);
  const billData = Object.fromEntries(formData.entries());
  billData.name = billData['name-streaming'] || billData['name-other'];

  const newBill = new Bill(billData);

  appBillManager.setLoading(true);
  updateUIForLoading();
  try {
    await appBillManager.addBill(newBill);
    showNotification('New bill added successfully.');
    console.log('New bill added:', newBill);
    console.log('All current bills managed by BillManager:', appBillManager.bills);
    billForm.reset();
    handleBillTypeChange();
    renderBills();
    calculateAndRenderTotal();
  } catch (error) {
    console.error('Error adding bill:', error);
    showNotification(`Failed to add bill: ${error.message || 'Unknown error'}.`, true);
  } finally {
    appBillManager.setLoading(false);
    updateUIForLoading();
  }
}

/**
 * Handles the submission of the 'Edit Bill' form within the modal.
 * Delegates bill updating and saving to BillManager, then updates the UI.
 * @param {Event} event The form submission event object.
 * @async
 */
async function handleEditSubmit(event) {
  event.preventDefault();

  appBillManager.setLoading(true);
  updateUIForLoading();
  try {
    console.log('Updating bill (simulated delay)...');
    const formData = new FormData(editBillForm);
    const updatedData = Object.fromEntries(formData.entries());

    await appBillManager.updateBill(updatedData);
    showNotification('Bill updated successfully.');
    console.log('Bill updated. Updating UI...');
    editModal.hide();
    renderBills();
    calculateAndRenderTotal();
  } catch (error) {
    console.error("Error updating bill:", error);
    showNotification(`Failed to update bill: ${error.message || 'Unknown error'}.`, true);
    editModal.hide();
    renderBills();
    calculateAndRenderTotal();
  } finally {
    appBillManager.setLoading(false);
    updateUIForLoading();
  }
}


// --- EVENT LISTENERS ---
billForm.addEventListener('submit', handleSubmit);
editBillForm.addEventListener('submit', handleEditSubmit);
billTypeSelect.addEventListener('change', handleBillTypeChange);

sortBySelect.addEventListener('change', (event) => {
  appBillManager.setSort(event.target.value);
  renderBills();
});

billsListContainer.addEventListener('click', async (event) => {
  if (event.target.classList.contains('delete-btn')) {
    const billId = event.target.dataset.billId;
    await deleteBill(billId);
  } else if (event.target.classList.contains('edit-btn')) {
    const billId = event.target.dataset.billId;
    const billToEdit = appBillManager.bills.find(bill => bill.id === billId);
    if (billToEdit) {
      openEditModal(billToEdit);
    }
  }
});

filterButtonsContainer.addEventListener('click', (event) => {
  if (event.target.classList.contains('filter-btn')) {
    const buttons = filterButtonsContainer.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    appBillManager.setFilter(event.target.dataset.filter);
    renderBills();
  }
});


// --- INITIALIZATION ---
async function init() {
  appBillManager.setLoading(true);
  updateUIForLoading();
  try {
    await appBillManager.initialize();
    renderBills();
    calculateAndRenderTotal();
  } catch (error) {
    console.error("Initialization error:", error);
    showNotification(`Failed to load initial data: ${error.message || 'Unknown error'}.`, true);
  } finally {
    appBillManager.setLoading(false);
    updateUIForLoading();
  }
}

init();