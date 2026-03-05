# Bill Calculator Pro - Customization Guide

This project is designed to be quickly customized for different clients without rewriting logic.

Most customization lives in:

- `docs/config/app-config.js` (labels, options, badge maps, storage key, defaults)
- `docs/styles/theme.css` (CSS variables for branding)

---

## 1) Quick customization checklist (for a client build)

Ask the client for:
- App title + subtitle
- Preferred currency + supported currencies
- Bill categories/types
- Payment methods
- Status labels (e.g. Paid / Pending / Unpaid)
- Brand colors (primary, success/warning/danger optional)
- Any word changes (button labels, headings)

---

## 2) Where to change text labels (UI copy)

Edit: `docs/config/app-config.js`

Look under:

```js
ui: { labels: { ... } }
```
Examples:

- **App titles:**

    - `app.title`, `app.subtitle`

- **Section headings:**

    - `addFormTitle`, `listTitle`

- **Buttons:**

    - `addButton`, `editButtonLabel`, `deleteButtonLabel`

- **Totals labels:**

    - `totalsPaidLabel`, `totalsPendingLabel`, `totalsUnpaidLabel`

- **Modal labels:**

    - `editModalTitle`,`editModalCloseLabel`, `editModalSaveLabel`

- **Form/toolbar labels:**

    - `billTypeLabel`, `amountLabel`,`paymentMethodLabel`,`statusLabel`, `sortByLabel`

After changing labels, refresh the app — most text is rendered from config at startup.

---

## 3) Where to change dropdown/filter options

Edit: `docs/config/app-config.js`

Look under:

```js
options: { ... }
```
### Bill Types
`options.billTypes`

> [!IMPORTANT]
> The `value` must match the app logic for conditional inputs:

- **Streaming** triggers the streaming name field

- **Other** triggers the custom type field

Keep these values unless you also update logic in `handleBillTypeChange()`.

### Payment Methods

`options.paymentMethods`

### Status options

`options.statuses`

> [!IMPORTANT]
> These values are used throughout filtering and totals.
If you change values, you may need to update **BillManager** logic and badge mappings.

### Sort options

`options.sortChoices`

> [!IMPORTANT]
> The `value` must match BillManager sort keys:

- `default`

- `amount-high-low`

- `amount-low-high`

- `name-az`

### Filter buttons

`options.filterChoices`

> [!IMPORTANT]
> The `value` must match BillManager filter keys:

`All`, `Paid`, `Pending`, `Unpaid`

---

## 4) Status badge styling (card badges)

Edit: `docs/config/app-config.js`

### Card badge mapping

`ui.statusBadgeMap`

Example:
```js
statusBadgeMap: {
  Paid: "success",
  Pending: "warning",
  Unpaid: "danger"
}
```
Values are **Bootstrap** badge variants (e.g., `success`, `warning`, `danger`, `primary`, `info`, `secondary`).

If a status is missing from the map, the UI falls back to `secondary`.

---
## 5) Totals badge styling (summary badges)

Edit: `docs/config/app-config.js`

### Totals badge mapping

`ui.totalsBadgeMap`

Example:
```js
totalsBadgeMap: {
  Paid: "success",
  Pending: "warning",
  Unpaid: "danger"
}
```
`Pending: "warning"` automatically applies readable dark text.

---
## 6) Theme / branding (colors, spacing, surface)

Edit: `docs/styles/theme.css`

This file defines CSS variables (tokens) for quick rebranding.

Typical edits:

- `--app-bg`

- `--app-surface`

- `--app-primary`

- `--app-success`

- `--app-warning`

- `--app-danger`

- `--app-radius`

These override Bootstrap defaults without rewriting component classes.

---
## 7) LocalStorage key (multi-client safety)

Edit: `docs/config/app-config.js`

```js
app: {
  storageKey: "myBills"
```
For client builds, change this to avoid collisions:

```js
storageKey: "bills_acme_v1"
```

> [!WARNING]
> Changing storageKey will make old saved bills disappear (because they’re stored under a different key).

---
## 8) What NOT to change casually

Only change these if you’re ready to test logic:

- Filter values (`All`/`Paid`/`Pending`/`Unpaid`)

- Sort values (`default`/`amount-high-low`/`amount-low-high`/`name-az`)

- Status values (`Paid`/`Pending`/`Unpaid`) (used in totals + badge maps + filtering)

Bill Type values `Streaming` / `Other` unless you also update conditional UI logic

---
## 9) Quick QA checklist after customization

- Add bill (each status)
- Edit bill status
- Delete bill
- Filter: `All`/`Paid`/`Pending`/`Unpaid`
- Sort: `default`/`amount-high-low`/`amount-low-high`/`name-az`
- Refresh page (localStorage persists)
- Mobile layout quick check
