/**
 * @file renderBillTypeChoices.js
 * @description Renders bill type choices into the bill type select element.
 * @param {Object} params
 * @param {HTMLSelectElement} params.selEl - The select element to populate with bill type options.
 * @param {Array} params.billTypes - The configured bill type options.
 */
export default function renderBillTypeChoices({ selEl, billTypes }) {
    if (!selEl || !billTypes.length) return;

    const currentValue = selEl.value; // Preserve current selection if possible

    selEl.innerHTML = ""; // Clear existing options

    billTypes.forEach(({ value, label }) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;

        // Keep placeholder disabled
        if (value === "") {
            option.disabled = true;
        }
        selEl.appendChild(option);
    });

    const hasCurrentValue = billTypes.some(
        (choice) => choice.value === currentValue);

    selEl.value = hasCurrentValue ? currentValue : "";
}