/**
 * @file renderStatusChoices.js
 * @description Renders status choices into a select element from config.
 * @param {Object} params
 * @param {HTMLSelectElement} params.selEl - The select element to populate.
 * @param {Array} params.statusChoices - Array of status options from config.
 */
export default function renderStatusChoices({ selEl, statusChoices }) {
    if (!selEl || !statusChoices.length) return;

    const currentValue = selEl.value; // Preserve current selection if possible

    selEl.innerHTML = ""; // Clear existing options

    statusChoices.forEach(({ value, label }) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        selEl.appendChild(option);
    });
        const hasCurrentValue = statusChoices.some(
            (choice) => choice.value === currentValue);

        selEl.value = hasCurrentValue ? currentValue : statusChoices[0]?.value || ""; // If no current value, select first option or empty    
}
