/**
 * @file renderPaymentMethodChoices.js
 * @description Renders payment method choices into a select element from config.
 * @param {Object} params
 * @param {HTMLSelectElement} params.selEl - The select element to populate.
 * @param {Array} params.paymentMethods - Array of payment method options from config.
 */
 export default function renderPaymentMethodChoices({ selEl, paymentMethodChoices }) {
    if (!selEl || !paymentMethodChoices.length) return;

    const currentValue = selEl.value; // Preserve current selection if possible

    selEl.innerHTML = ""; // Clear existing options

    paymentMethodChoices.forEach(({ value, label }) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        selEl.appendChild(option);
    });

    const hasCurrentValue = paymentMethodChoices.some(
        (choice) => choice.value === currentValue);

    selEl.value = hasCurrentValue ? currentValue : paymentMethodChoices[0]?.value || ""; // If no current value, select first option or empty    
}