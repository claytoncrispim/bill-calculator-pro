/**
 * @class ApiService
 * @description Simulates asynchronous API calls for fetching and saving bill data.
 * Uses Promises to mimic network delays.
 */
export default class ApiService {
    /**
     * @private
     * @property {number} _delay - The simulated network delay in milliseconds.
     */
    _delay = 500; // Simulate a 0.5 second network delay

    /**
     * @private
     * @property {string} _localStorageKey - The key used to store data in localStorage for simulation.
     * 
     */
    _localStorageKey = 'myBills'; // Use the same key as before

    /**
     * Simulates fetching bills from a backend API.
     * Resolves with an array of bill data after a delay.
     * @returns {Promise<Array<object>>} A promise that resolves with the bill data.
     */
    fetchBills() {
        return new Promise(resolve => {
            setTimeout(() => {
                const savedBillsJson = localStorage.getItem(this._localStorageKey);
                const bills = savedBillsJson ? JSON.parse(savedBillsJson) : [];
                console.log('API Service: Fetched data (simulated)', bills);
                resolve(bills);
            }, this._delay);
        });
    }

    /**
     * Simulates saving bills to a backend API.
     * Resolves after a delay, confirming the save.
     * @param {Array<object>} billsData - The array of bill data to save.
     * @returns {Promise<void>} A promise that resolves when the data is "saved".
     */
    saveBills(billsData) {
        return new Promise(resolve => {
            setTimeout(() => {
                localStorage.setItem(this._localStorageKey, JSON.stringify(billsData));
                console.log('API Service: Saved data (simulated)', billsData);
                resolve();
            }, this._delay);
        });
    }
}