 /**
 * @file renderSortChoices.js
 * @description Renders sort choices for a select element based on the provided configuration.
 * @param {Object} params - The parameters for rendering sort choices.
 * @param {HTMLSelectElement} params.selEl - The select element to populate.
 * @param {Array} params.sortChoices - The array of sort choices.
 * @param {Object} params.manager - The BillManager instance to get the current sort state.
 */
export default function renderSortChoices({ selEl, sortChoices, manager }) {
    if (!selEl || !sortChoices.length) return;
    
    selEl.innerHTML = ""; // Clear existing options
    
    //Dynamically create and append option elements based on the provided sortChoices array
    sortChoices.forEach(({value, label}) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        selEl.appendChild(option);
    });

    const hasCurrentSort = sortChoices.some(
        (choice) => choice.value === 
        manager.currentSort
    );

    selEl.value = hasCurrentSort 
        ? manager.currentSort 
        : "default";

}