/**
 * @file renderCurrencyChoices.js
 * @description Renders currency choices into a select element from config.
 * @param {Object} params
 * @param {HTMLSelectElement} params.selEl - The select element to populate.
 * @param {Array} params.currencyChoices - Array of currency options from config.
 */
export default function renderCurrencyChoices({ selEl, currencyChoices, defaultCode }) {
    if (!selEl || !currencyChoices.length) return;

    const currentValue = selEl.value; // Preserve current selection if possible

    selEl.innerHTML = ""; // Clear existing options

    currencyChoices.forEach((code) => {
        const option = document.createElement("option");
        option.value = code;
        option.textContent = code;
        selEl.appendChild(option);
    });

    const hasDefaultValue = currencyChoices.includes(defaultCode);
    const hasCurrentValue = currencyChoices.includes(currentValue);    

    if (hasDefaultValue) {
        selEl.value = defaultCode; // Set to default from config if available
    } else if (hasCurrentValue) {
        selEl.value = currentValue; // Preserve current selection if possible
    } else {
        selEl.value = currencyChoices[0]; // Fallback to first option if default is not available
    } 
}
