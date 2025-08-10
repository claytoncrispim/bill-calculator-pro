export default class Bill {
  constructor({ id, type, name, paymentMethod, amount, currency, status }) {
    // Use the provided 'id' if it exists, otherwise generate a new one.
    this.id = id || Date.now().toString(); // Simple unique ID based on timestamp

    this.type = type; // e.g., 'Energy', 'Broadband', 'Streaming'
    this.name = name; // Specifically for the streaming service name, e.g., 'Netflix'
    this.paymentMethod = paymentMethod; // e.g., 'Credit Card'
    this.status = status || 'Pending'; // Default to 'Pending' if not provided

    // The amount is now an object to hold both value and currency
    this.amount = {
      value: parseFloat(amount) || 0, // Ensure amount is a number
      currency: currency || 'EUR' // Default to EUR
    };
  }
}