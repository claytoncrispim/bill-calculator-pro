/**
 * @file app-config.js
 * @description App configuration object for Bill Calculator Pro. This centralizes all app settings, options, and UI text.
 * @param {Object} window.APP_CONFIG - The global configuration object for the app.
 * It is frozen to prevent accidental modifications at runtime.
 */
window.APP_CONFIG = Object.freeze({  
  app: {
    apiDelayMs: 500,
    title: "Bill Calculator Pro",
    subtitle: "Manage your monthly expenses with ease.",
    storageKey: "myBills", // keep same key to avoid breaking existing saved data
    currency: {
      defaultCode: "EUR",
      supported: ["EUR", "USD", "BRL", "GBP"]
    }
  },

  options: {
    billTypes: [
      { value: "", label: "Select a type..." },
      { value: "Energy", label: "Energy" },
      { value: "Broadband", label: "Broadband" },
      { value: "Streaming", label: "Streaming" },
      { value: "Other", label: "Other" }
    ],
    paymentMethods: [
      { value: "Direct Debit", label: "Direct Debit" },
      { value: "Credit Card", label: "Credit Card" },
      { value: "Debit Card", label: "Debit Card" },
      { value: "Cash", label: "Cash" }
    ],
    statuses: [
      { value: "Paid", label: "Paid" },
      { value: "Pending", label: "Pending" },
      { value: "Unpaid", label: "Unpaid" }
    ],
    filterChoices: [
      { value: "All", label: "All" },
      { value: "Paid", label: "Paid" },
      { value: "Unpaid", label: "Unpaid" },
      { value: "Pending", label: "Pending" }      
    ],
    sortChoices: [
      { value: "default", label: "Default Sort" },
      { value: "amount-high-low", label: "Amount (High to Low)" },
      { value: "amount-low-high", label: "Amount (Low to High)" },
      { value: "name-az", label: "Name (A-Z)" }
    ]
  },

  ui: {
    labels: {
      addFormTitle: "Add a New Bill",
      listTitle: "My Bills",
      emptyStateText: "No bills to display.",
      addButton: "Add Bill",
      totalsPaidLabel: "Paid",
      totalsPendingLabel: "Pending",
      totalsUnpaidLabel: "Unpaid"
    }
  },

  theme: {
    // purely informational for now — CSS vars will control real styling
    brandName: "default",
    primary: "#0d6efd",
    success: "#198754",
    warning: "#ffc107",
    danger: "#dc3545"
  }
});