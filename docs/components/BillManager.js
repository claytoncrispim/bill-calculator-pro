import Bill from "./Bill.js"; // Import the Bill class, as BillManager will create and manage Bill instances.
import ApiService from "./ApiService.js"; // Import the ApiService for asynchronous data persistence.

/**
 * @class BillManager
 * @description Manages the application's bill data, including loading/saving to localStorage
 * (via ApiService), CRUD operations (Create, Read, Update, Delete),
 * and filtering/sorting logic. This class acts as the single source of
 * truth for bill-related state.
 */
export default class BillManager {
  /**
   * @constructor
   * Initializes the BillManager instance.
   * Creates an instance of ApiService for data persistence.
   * Sets up default filter and sort states.
   * Bills are initialized as an empty array, and will be populated asynchronously
   * via the `initialize()` method called from `script.js`.
   */
  constructor() {
    this.apiService = new ApiService(); // Instantiate ApiService for data operations.

    /**
     * @property {Array<Bill>} bills - The main array holding all Bill objects.
     * This array is encapsulated within the BillManager instance.
     * Initialized as empty; populated by an async load call after construction.
     */
    this.bills = [];

    /**
     * @property {'All' | 'Paid' | 'Unpaid' | 'Pending'} currentFilter - The active filter applied to bills.
     * This state is managed internally by BillManager.
     */
    this.currentFilter = 'All';

    /**
     * @property {'default' | 'amount-high-low' | 'amount-low-high' | 'name-az'} currentSort - The active sort order for bills.
     * This state is managed internally by BillManager.
     */
    this.currentSort = 'default';
  }

  /**
   * @private
   * Saves the current 'bills' array to the backend via ApiService.
   * This method is asynchronous and should be awaited.
   * It maps Bill instances to plain objects for safe JSON stringification.
   * @async
   */
  async _saveBillsToLocalStorage() {
    const billsPlainData = this.bills.map(bill => ({
        id: bill.id,
        type: bill.type,
        name: bill.name,
        paymentMethod: bill.paymentMethod,
        status: bill.status,
        amount: bill.amount // amount is already an object {value, currency}
    }));
    await this.apiService.saveBills(billsPlainData);
  }

  /**
   * @private
   * Loads bills from the backend via ApiService and rehydrates them into Bill instances.
   * This method is asynchronous and should be awaited.
   * @returns {Promise<Array<Bill>>} A promise that resolves with the array of Bill objects.
   * @async
   */
  async _loadBillsFromLocalStorage() {
    const plainBills = await this.apiService.fetchBills(); // Fetch plain data from API service.

    if (plainBills) {
      // Rehydrate plain objects back into proper Bill instances.
      // This is crucial to restore Bill methods and correct nested object structures.
      return plainBills.map(billData => new Bill({
        id: billData.id,
        type: billData.type,
        name: billData.name,
        paymentMethod: billData.paymentMethod,
        status: billData.status,
        // When rehydrating, ensure amount.value and amount.currency are passed correctly.
        amount: billData.amount ? billData.amount.value : 0, // Handle cases where amount might be missing
        currency: billData.amount ? billData.amount.currency : 'EUR' // Handle cases where currency might be missing
      }));
    } else {
      return []; // Return an empty array if no bills are found.
    }
  }

  /**
   * Adds a new Bill instance to the collection and saves the updated list.
   * This method is asynchronous because it calls the asynchronous _saveBillsToLocalStorage.
   * @param {Bill} newBill - The Bill object to be added.
   * @async
   */
  async addBill(newBill) {
    this.bills.push(newBill);
    await this._saveBillsToLocalStorage(); // Await the asynchronous save operation.
  }

  /**
   * Deletes a bill from the collection by its unique ID and saves the updated list.
   * This method is asynchronous because it calls the asynchronous _saveBillsToLocalStorage.
   * @param {string} id - The unique ID of the bill to delete.
   * @async
   */
  async deleteBill(id) {
    this.bills = this.bills.filter(bill => bill.id !== id);
    await this._saveBillsToLocalStorage(); // Await the asynchronous save operation.
  }

  /**
   * Updates an existing bill in the collection with new data and saves the updated list.
   * This method is asynchronous because it calls the asynchronous _saveBillsToLocalStorage.
   * It uses immutable updates for the bill object.
   * @param {object} updatedData - An object containing the bill's ID and updated properties (amount, status).
   * @async
   */
  async updateBill(updatedData) {
    this.bills = this.bills.map(bill => {
      if (bill.id === updatedData.id) {
        // Return a new Bill object by spreading existing properties and
        // overwriting the amount value and status.
        return {
          ...bill, // Copy all existing properties
          amount: {
            ...bill.amount, // Copy existing amount properties (like currency)
            value: parseFloat(updatedData.amount) // Overwrite only the value
          },
          status: updatedData.status // Overwrite status
        };
      }
      return bill; // Return unchanged bills
    });
    await this._saveBillsToLocalStorage(); // Await the asynchronous save operation.
  }

  /**
   * Sets the internal filter state of the BillManager.
   * No asynchronous operation or saving to localStorage is needed, as this is a view state.
   * @param {'All' | 'Paid' | 'Unpaid' | 'Pending'} newFilter - The new filter status.
   */
  setFilter(newFilter) {
    this.currentFilter = newFilter;
  }

  /**
   * Sets the internal sort order state of the BillManager.
   * No asynchronous operation or saving to localStorage is needed, as this is a view state.
   * @param {'default' | 'amount-high-low' | 'amount-low-high' | 'name-az'} newSort - The new sort order.
   */
  setSort(newSort) {
    this.currentSort = newSort;
  }

  /**
   * Retrieves a filtered and sorted list of bills based on the BillManager's
   * internal 'currentFilter' and 'currentSort' states.
   * This method is synchronous as it operates on the already loaded `this.bills` array.
   * @returns {Array<Bill>} A new array containing the bills ready for display.
   */
  getDisplayBills() {
    let filteredBills;

    // Apply filtering based on currentFilter
    if (this.currentFilter === 'All') {
      filteredBills = this.bills;
    } else {
      filteredBills = this.bills.filter(bill => bill.status === this.currentFilter);
    }

    // Apply sorting based on currentSort.
    // A shallow copy ([...filteredBills]) is created to sort without modifying
    // the original 'filteredBills' array, ensuring consistent behavior.
    const sortedAndFilteredBills = [...filteredBills].sort((a, b) => {
      switch (this.currentSort) {
        case 'amount-high-low':
          return b.amount.value - a.amount.value;
        case 'amount-low-high':
          return a.amount.value - b.amount.value;
        case 'name-az':
          const nameA = a.name || a.type;
          const nameB = b.name || b.type;
          return nameA.localeCompare(nameB); // Use localeCompare for proper string sorting.
        default:
          return 0; // Default case means no specific sorting is applied.
      }
    });

    return sortedAndFilteredBills;
  }

  /**
   * Calculates the total amount for bills based on their status (Paid, Unpaid, Pending).
   * This method is synchronous as it operates on the already loaded `this.bills` array.
   * @returns {object} An object with keys 'Paid', 'Unpaid', 'Pending' and their respective sums.
   */
  getTotalsByStatus() {
    const initialTotals = {
      Paid: 0,
      Unpaid: 0,
      Pending: 0
    };

    // Use .reduce() to iterate through all bills and sum amounts into the correct category.
    const totals = this.bills.reduce((acc, bill) => {
      if (acc.hasOwnProperty(bill.status)) {
        acc[bill.status] += bill.amount.value;
      }
      return acc;
    }, initialTotals);

    return totals;
  }

  /**
   * @public
   * Initializes the BillManager by loading bills asynchronously from the API Service.
   * This method should be called externally (e.g., from script.js init) after
   * the BillManager instance has been created.
   * @async
   */
  async initialize() {
    this.bills = await this._loadBillsFromLocalStorage(); // Await the asynchronous load operation.
    console.log("BillManager: Initialized with bills from API service (simulated)", this.bills);
  }
}