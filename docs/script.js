/**
 * @file script.js
 * @description Main JavaScript file for the Bill Calculator application.
 * This file primarily handles DOM manipulation, event handling,
 * and orchestrates interactions with the BillManager for all
 * data-related operations. It acts as the UI layer.
 * @author [Clayton Crispim]
 * @version 9.0.0 (Refactored with BillManager for OOP state management)
 * @date 2025-06-26
 *
 * Distributed under the MIT License.
 */

// --- IMPORTS ---
// Import the Bill class for creating new bill objects.
// This is used when a new bill is submitted from the form.
import Bill from "./components/Bill.js";

// Import the BillManager class, which now encapsulates all bill data,
// persistence (localStorage), and core business logic (CRUD, filtering, sorting, totals).
import BillManager from "./components/BillManager.js";


// --- STATE MANAGEMENT INSTANCE ---
// The single source of truth for the application's bill data is now
// an instance of the BillManager class. It loads bills on creation.
const appBillManager = new BillManager();


// --- DOM ELEMENTS ---
// Caching references to frequently used DOM elements to avoid repeated
// queries and improve performance.

// Main form element where new bills are added.
const billForm = document.querySelector('#bill-form');
// Container where the list of bill cards will be rendered.
const billsListContainer = document.querySelector('#bills-list');

// Display elements for categorized financial totals.
const totalPaidDisplay = document.querySelector('#total-paid');
const totalPendingDisplay = document.querySelector('#total-pending');
const totalUnpaidDisplay = document.querySelector('#total-unpaid');

// Form controls for user interaction (filtering and sorting).
const filterButtonsContainer = document.querySelector('#filter-buttons-container');
const billTypeSelect = document.querySelector('#billType');
const sortBySelect = document.querySelector('#sort-by');

// Containers for input fields that appear conditionally based on bill type.
const streamingNameContainer = document.querySelector('#streamingName-container');
const otherTypeContainer = document.querySelector('#otherType-container');

// Elements related to the "Edit Bill" modal window.
const editModalEl = document.querySelector('#editBillModal');
const editBillForm = document.querySelector('#edit-bill-form');
const editBillIdInput = document.querySelector('#edit-bill-id'); // Hidden input to store bill ID
const editAmountInput = document.querySelector('#edit-amount');
const editStatusSelect = document.querySelector('#edit-status');

/**
 * A JavaScript instance of the Bootstrap Modal class.
 * This instance is used to programmatically control the modal's behavior
 * (e.g., showing or hiding it).
 */
const editModal = new bootstrap.Modal(editModalEl);


// --- FUNCTIONS FOR UI RENDERING AND EVENT HANDLING ---

/**
 * Renders the list of bills to the page. It retrieves the filtered and sorted
 * list of bills directly from the BillManager, ensuring the display
 * reflects the current application state.
 */
function renderBills() {
  // Define status-to-color mapping for Bootstrap badges.
  const statusColors = {
    Paid: 'success',
    Unpaid: 'danger',
    Pending: 'warning',
  };

  // Delegate filtering and sorting logic to the BillManager.
  // The manager's internal filter and sort states are used automatically.
  const billsToDisplay = appBillManager.getDisplayBills();

  // Clear any previously rendered bills from the container.
  billsListContainer.innerHTML = '';

  // Display a message if there are no bills to show after filtering/sorting.
  if (billsToDisplay.length === 0) {
    billsListContainer.innerHTML = '<p class="text-center text-muted">' +
                                   'No bills to display.</p>';
    return;
  }

  // Map through the bills to display and generate HTML for each card.
  const billsHtml = billsToDisplay.map(bill => {
    // Determine the display name (specific name if available, otherwise bill type).
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
  }).join(''); // Join all individual bill HTML strings into one for efficient DOM injection.

  billsListContainer.innerHTML = billsHtml;
}


/**
 * Calculates and renders total amounts for each status category (Paid, Unpaid, Pending).
 * It retrieves these totals directly from the BillManager.
 */
function calculateAndRenderTotal() {
  // Delegate the calculation of totals to the BillManager instance.
  const totals = appBillManager.getTotalsByStatus();

  // Update the text content of the dedicated display elements with formatted totals.
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

  // By default, hide both conditional containers.
  streamingNameContainer.classList.add('d-none');
  otherTypeContainer.classList.add('d-none');

  // Show the relevant container based on the selected bill type.
  if (selectedValue === 'Streaming') {
    streamingNameContainer.classList.remove('d-none');
  } else if (selectedValue === 'Other') {
    otherTypeContainer.classList.remove('d-none');
  }
}


/**
 * Deletes a bill from the application state by delegating to BillManager.
 * After deletion, it triggers a UI refresh.
 * @param {string} id - The unique ID of the bill to delete.
 */
async function deleteBill(id) {
  // Optional: Add UI feedback here (e.g., show spinner, disable buttons)
  console.log('Deleting bill (simulated delay)...'); // Temporary feedback

  // Delegate the deletion logic (and internal saving) to the BillManager.
  await appBillManager.deleteBill(id);
  // Re-render the UI to reflect the changes in the bill list and totals.
  renderBills();
  calculateAndRenderTotal();
}


/**
 * Opens the "Edit Bill" modal and populates its form fields with data
 * from the specified bill object.
 * @param {object} bill - The bill object to be edited.
 */
function openEditModal(bill) {
  // Fill the hidden ID input (to identify the bill on submission)
  // and other visible form fields with the bill's existing data.
  editBillIdInput.value = bill.id;
  editAmountInput.value = bill.amount.value;
  editStatusSelect.value = bill.status;

  // Programmatically show the Bootstrap modal.
  editModal.show();
}


/**
 * Handles the submission of the main 'Add Bill' form.
 * Delegates bill creation and saving to BillManager, then updates the UI.
 * @param {Event} event - The form submission event object provided by the browser.
 */
async function handleSubmit(event) {
  // Prevent default page reload on form submission.
  event.preventDefault(); 

  // Read all form data into a simple object.
  const formData = new FormData(billForm);
  const billData = Object.fromEntries(formData.entries());

  // Consolidate conditional name fields.
  billData.name = billData['name-streaming'] || billData['name-other'];

  // Create a new Bill instance using the Bill class constructor.
  const newBill = new Bill(billData);

  // Delegate adding the new bill (and internal saving to localStorage)
  // to the BillManager instance.
  await appBillManager.addBill(newBill);

  // Log the results for debugging.
  console.log('New bill added:', newBill);
  console.log('All current bills managed by BillManager:', appBillManager.bills);

  // Reset the form and hide any conditional fields.
  billForm.reset();
  handleBillTypeChange();

  // Re-render the UI to show the new bill and updated totals.
  renderBills();
  calculateAndRenderTotal();
}

/**
 * Handles the submission of the 'Edit Bill' form within the modal.
 * Delegates bill updating and saving to BillManager, then updates the UI.
 * @param {Event} event - The form submission event object.
 */
async function handleEditSubmit(event) {
  event.preventDefault(); // Prevent page reload.

  // Optional: Add UI feedback here (e.g., show spinner, disable form fields)
  console.log('Updating bill (simulated delay)...'); // Temporary feedback

  // Get the updated data from the modal's form fields.
  const formData = new FormData(editBillForm);
  const updatedData = Object.fromEntries(formData.entries());

  // Delegate the bill updating logic (and internal saving) to the BillManager.
  await appBillManager.updateBill(updatedData);

  // Optional: Remove UI feedback here (e.g., hide spinner, re-enable fields)
  console.log('Bill updated. Updating UI...'); // Temporary feedback

  // Close the modal and re-render the UI to reflect the changes.
  editModal.hide();
  renderBills();
  calculateAndRenderTotal();
}


// --- EVENT LISTENERS ---
// Attaching our handler functions to specific events on our DOM elements.

billForm.addEventListener('submit', handleSubmit);
editBillForm.addEventListener('submit', handleEditSubmit);
billTypeSelect.addEventListener('change', handleBillTypeChange);

sortBySelect.addEventListener('change', (event) => {
  // Tell the BillManager to update its internal sort state based on dropdown.
  appBillManager.setSort(event.target.value);
  // Trigger a re-render to display bills with the new sort order.
  renderBills();
});

// Use event delegation on the main bills list container for 'Edit' and 'Delete' buttons.
billsListContainer.addEventListener('click', (event) => {
  if (event.target.classList.contains('delete-btn')) {
    const billId = event.target.dataset.billId;
    deleteBill(billId); // Calls the deleteBill function, which delegates to BillManager.
  } else if (event.target.classList.contains('edit-btn')) {
    const billId = event.target.dataset.billId;
    // Find the specific bill object from the BillManager's collection using its ID.
    const billToEdit = appBillManager.bills.find(bill => bill.id === billId);
    if (billToEdit) {
      openEditModal(billToEdit); // Open the modal, pre-filling it with the bill's data.
    }
  }
});

filterButtonsContainer.addEventListener('click', (event) => {
  if (event.target.classList.contains('filter-btn')) {
    // Update visual "active" state of filter buttons.
    const buttons = filterButtonsContainer.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Tell the BillManager to update its internal filter state.
    appBillManager.setFilter(event.target.dataset.filter);

    // Re-render the bills list to apply the new filter.
    renderBills();
  }
});


// --- INITIALIZATION ---

/**
 * The main entry point for the application.
 * This function is called once when the script first loads.
 * It sets up the initial UI state based on loaded data.
 */
async function init() {
  // BillManager's constructor has already loaded the data from localStorage.
  // Now, render the initial display of bills and totals.

  // Await the asynchronous initialization of the BillManager.
  // This ensures bills are loaded before rendering the UI.
  await appBillManager.initialize(); // <--- Await the initialization

  renderBills();
  calculateAndRenderTotal();
}

// Kick off the application by calling the init function when the script loads.
init();