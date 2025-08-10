// docs/components/BillManager.test.js

// Import the BillManager and Bill classes we want to test.
// Note: Jest provides 'describe', 'it', and 'expect' globally, so they are not imported.
import BillManager from './BillManager.js';
import Bill from './Bill.js';
import ApiService from './ApiService.js';

// Mock the ApiService class to prevent actual async operations during tests.
// This allows us to control the behavior of fetching and saving data.
jest.mock('./ApiService');

describe('BillManager', () => {
  // Before each test in this suite, clear the localStorage mock.
  beforeEach(() => {
    localStorage.clear();
    ApiService.mockClear(); // Clear any mock calls
  });

  // Test case 1: Check if the constructor initializes correctly.
  it('should initialize with an empty bills array and default states', () => {
    const manager = new BillManager();
    expect(manager.bills).toEqual([]);
    expect(manager.currentFilter).toBe('All');
    expect(manager.currentSort).toBe('default');
  });

  // --- Tests for CRUD Operations ---
  describe('CRUD Operations', () => {
    // A mock Bill object to use in our tests.
    const mockBill = new Bill({
      id: 'mock-123',
      type: 'Streaming',
      name: 'Netflix',
      paymentMethod: 'Credit Card',
      status: 'Pending',
      amount: 15.99,
      currency: 'EUR'
    });

    // Test case 2: Check the addBill method.
    it('should add a new bill and call save to localStorage', async () => {
      const manager = new BillManager();
      // Spy on the save method to ensure it's called.
      const saveSpy = jest.spyOn(manager, '_saveBillsToLocalStorage');

      await manager.addBill(mockBill);

      // Check if the bills array now contains the new bill.
      expect(manager.bills).toHaveLength(1);
      expect(manager.bills[0]).toEqual(mockBill);

      // Check if the save method was called exactly once.
      expect(saveSpy).toHaveBeenCalledTimes(1);
    });

    // Test case 3: Check the deleteBill method.
    it('should delete a bill by id and call save to localStorage', async () => {
      const manager = new BillManager();
      manager.bills.push(mockBill);
      const saveSpy = jest.spyOn(manager, '_saveBillsToLocalStorage');

      await manager.deleteBill('mock-123');
      
      // Check if the bills array is now empty.
      expect(manager.bills).toHaveLength(0);

      // Check if the save method was called exactly once.
      expect(saveSpy).toHaveBeenCalledTimes(1);
    });

    // Test case 4: Check the updateBill method.
    it('should update a bill by id and call save to localStorage', async () => {
      const manager = new BillManager();
      manager.bills.push(mockBill);

      const updatedData = {
        id: 'mock-123',
        amount: 20.00,
        status: 'Paid'
      };

      const saveSpy = jest.spyOn(manager, '_saveBillsToLocalStorage');

      await manager.updateBill(updatedData);

      // Check if the bills array still has one element.
      expect(manager.bills).toHaveLength(1);

      // Check if the properties were correctly updated.
      expect(manager.bills[0].amount.value).toBe(20);
      expect(manager.bills[0].status).toBe('Paid');

      // Check if other properties remained unchanged.
      expect(manager.bills[0].name).toBe('Netflix');

      // Check if the save method was called exactly once.
      expect(saveSpy).toHaveBeenCalledTimes(1);
    });
  });

  // --- Tests for Filtering and Sorting ---
  describe('Filtering and sorting', () => {
    // Mock a set of bills for testing these features.
    const billsForTests = [
      new Bill({ id: 'b1', name: 'Zeta', amount: 10, status: 'Unpaid' }),
      new Bill({ id: 'b2', name: 'Alpha', amount: 5, status: 'Paid' }),
      new Bill({ id: 'b3', name: 'Beta', amount: 20, status: 'Unpaid' }),
      new Bill({ id: 'b4', name: 'Gamma', amount: 5, status: 'Paid' }),
      new Bill({ id: 'b5', name: 'Delta', amount: 15, status: 'Pending' }),
    ];

    // beforeEach hook to set up the manager with test data before each test.
    let manager;
    beforeEach(() => {
      manager = new BillManager();
      manager.bills = billsForTests;
    });

    // Test case 5: Check filtering by 'Paid' status.
    it('should filter bills by status "Paid"', () => {
      manager.setFilter('Paid');
      const filteredBills = manager.getDisplayBills();
      expect(filteredBills).toHaveLength(2);
      expect(filteredBills.every(bill => bill.status === 'Paid')).toBe(true);
    });

    // Test case 6: Check filtering by 'Unpaid' status.
    it('should filter bills by status "Unpaid"', () => {
      manager.setFilter('Unpaid');
      const filteredBills = manager.getDisplayBills();
      expect(filteredBills).toHaveLength(2);
      expect(filteredBills.every(bill => bill.status === 'Unpaid')).toBe(true);
    });
    
    // Test case 7: Check filtering by 'Pending' status.
    it('should filter bills by status "Pending"', () => {
      manager.setFilter('Pending');
      const filteredBills = manager.getDisplayBills();
      expect(filteredBills).toHaveLength(1);
      expect(filteredBills[0].name).toBe('Delta');
    });

    // Test case 8: Check filtering by 'All' status.
    it('should filter for all bills when filter is "All"', () => {
      manager.setFilter('All');
      const filteredBills = manager.getDisplayBills();
      expect(filteredBills).toHaveLength(5);
    });
    
    // Test case 9: Check sorting by amount from low to high.
    it('should sort bills by amount from low to high', () => {
      manager.setSort('amount-low-high');
      const sortedBills = manager.getDisplayBills();
      expect(sortedBills.map(bill => bill.amount.value)).toEqual([5, 5, 10, 15, 20]);
    });
    
    // Test case 10: Check sorting by amount from high to low.
    it('should sort bills by amount from high to low', () => {
      manager.setSort('amount-high-low');
      const sortedBills = manager.getDisplayBills();
      expect(sortedBills.map(bill => bill.amount.value)).toEqual([20, 15, 10, 5, 5]);
    });
    
    // Test case 11: Check sorting by name from A-Z.
    it('should sort bills by name from A-Z', () => {
      manager.setSort('name-az');
      const sortedBills = manager.getDisplayBills();
      expect(sortedBills.map(bill => bill.name)).toEqual(['Alpha', 'Beta', 'Delta', 'Gamma', 'Zeta']);
    });
  });

  // --- Tests for Total Calculations ---
  describe('Total Calculations', () => {
    // Mock a set of bills with varying statuses and amounts.
    const billsForTotals = [
      new Bill({ id: 't1', name: 'Bill A', amount: 10, status: 'Paid' }),
      new Bill({ id: 't2', name: 'Bill B', amount: 20, status: 'Unpaid' }),
      new Bill({ id: 't3', name: 'Bill C', amount: 5, status: 'Pending' }),
      new Bill({ id: 't4', name: 'Bill D', amount: 15, status: 'Paid' }),
      new Bill({ id: 't5', name: 'Bill E', amount: 25, status: 'Unpaid' }),
    ];
  
    // Test case 12: Check if totals are calculated correctly.
    it('should correctly calculate total amounts by status', () => {
      const manager = new BillManager();
      manager.bills = billsForTotals;
  
      const totals = manager.getTotalsByStatus();
  
      // Check the calculated totals.
      expect(totals.Paid).toBe(25);      // 10 + 15
      expect(totals.Unpaid).toBe(45);    // 20 + 25
      expect(totals.Pending).toBe(5);    // 5
    });
  });
});
