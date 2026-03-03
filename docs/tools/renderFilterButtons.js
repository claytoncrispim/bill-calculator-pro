/**
 * @file renderFilterButtons.js
 * @description Renders filter buttons into the filter button container from config.
 * @param {Object} params
 * @param {HTMLElement} params.containerEl - The container element to populate.
 * @param {Array} params.filterChoices - Array of filter button options from config.
 * @param {Object} params.manager - The BillManager instance to get current filter state.
 */
export default function renderFilterButtons({ containerEl, filterChoices, manager }) {
  if (!containerEl || !filterChoices.length) return;
  
  // Get current filter from manager to set active state on buttons
  const currentFilter = manager?.currentFilter || "All";

  // Clear existing buttons
  containerEl.innerHTML = "";

    // Create and append buttons based on filterChoices
    filterChoices.forEach(({ value, label }) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn-outline-primary filter-btn";
      button.dataset.filter = value;
      button.textContent = label;

      // Set active class if this button's value matches the current filter
      if (value === currentFilter) {
        button.classList.add("active");
      }
      
      containerEl.appendChild(button);
    });
  }