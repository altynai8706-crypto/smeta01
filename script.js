const positions = document.querySelector("#positions");
const grandTotal = document.querySelector("#grand-total");
const addPositionButton = document.querySelector("#add-position");
const dateInput = document.querySelector("#estimate-date");
const discountInput = document.querySelector("#discount-percent");
const vatInput = document.querySelector("#vat-percent");
const currencySelect = document.querySelector("#currency");
const subtotalOutput = document.querySelector("#subtotal");
const discountRow = document.querySelector("#discount-row");
const discountOutput = document.querySelector("#discount-amount");
const discountedRow = document.querySelector("#discounted-row");
const discountedOutput = document.querySelector("#discounted-total");
const vatRow = document.querySelector("#vat-row");
const vatOutput = document.querySelector("#vat-amount");

const today = new Date();
dateInput.value = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0"),
].join("-");

const currencyFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 0,
});

function formatMoney(value) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `${currencyFormatter.format(Math.round(safeValue)).replace(/[\s\u00a0\u202f]/g, " ")} ${currencySelect.value}`;
}

function readNumber(value) {
  const normalized = value.trim().replace(/[\s\u00a0\u202f]/g, "").replace(",", ".");
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return 0;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function updateLabels() {
  [...positions.rows].forEach((row, index) => {
    const number = index + 1;
    row.querySelector(".name-input").setAttribute("aria-label", `Наименование, позиция ${number}`);
    row.querySelector(".quantity-input").setAttribute("aria-label", `Количество, позиция ${number}`);
    row.querySelector(".unit-select").setAttribute("aria-label", `Единица, позиция ${number}`);
    row.querySelector(".price-input").setAttribute("aria-label", `Цена, позиция ${number}`);
    row.querySelector(".remove-button").setAttribute("aria-label", `Удалить позицию ${number}`);
  });
}

function recalculate() {
  let subtotal = 0;
  [...positions.rows].forEach((row) => {
    const quantity = readNumber(row.querySelector(".quantity-input").value);
    const price = readNumber(row.querySelector(".price-input").value);
    const rawAmount = quantity * price;
    const amount = Number.isFinite(rawAmount) ? Math.round(rawAmount) : 0;
    row.querySelector(".row-total").textContent = formatMoney(amount);
    subtotal += amount;
  });
  subtotal = Number.isFinite(subtotal) ? subtotal : 0;
  const discountPercent = Math.min(readNumber(discountInput.value), 100);
  const vatPercent = readNumber(vatInput.value);
  const rawDiscount = subtotal * discountPercent / 100;
  const discount = Number.isFinite(rawDiscount) ? Math.round(rawDiscount) : 0;
  const discountedTotal = subtotal - discount;
  const rawVat = discountedTotal * vatPercent / 100;
  const vat = Number.isFinite(rawVat) ? Math.round(rawVat) : 0;

  subtotalOutput.textContent = formatMoney(subtotal);
  discountOutput.textContent = formatMoney(-discount);
  discountedOutput.textContent = formatMoney(discountedTotal);
  vatOutput.textContent = formatMoney(vat);
  grandTotal.textContent = formatMoney(discountedTotal + vat);
  discountRow.hidden = discount === 0;
  discountedRow.hidden = discountedTotal === 0;
  vatRow.hidden = vat === 0;
}

function addPosition(focusName = true) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td data-label="Наименование"><input class="name-input" type="text" placeholder="Название товара или услуги"></td>
    <td data-label="Количество"><input class="quantity-input" type="text" inputmode="decimal" placeholder="0"></td>
    <td data-label="Единица"><select class="unit-select"><option value="шт">шт</option><option value="час">час</option><option value="услуга">услуга</option></select></td>
    <td data-label="Цена"><input class="price-input" type="text" inputmode="decimal" placeholder="0"></td>
    <td data-label="Сумма"><output class="row-total">0 ₸</output></td>
    <td data-label="Удалить"><button class="remove-button" type="button" title="Удалить позицию">✕</button></td>
  `;
  positions.append(row);
  updateLabels();
  recalculate();
  if (focusName) row.querySelector(".name-input").focus();
}

addPositionButton.addEventListener("click", () => addPosition());
discountInput.addEventListener("input", recalculate);
vatInput.addEventListener("input", recalculate);
currencySelect.addEventListener("change", recalculate);

positions.addEventListener("input", (event) => {
  if (event.target.matches(".quantity-input, .price-input")) recalculate();
});

positions.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || event.isComposing || !event.target.matches("input")) return;
  const row = event.target.closest("tr");
  if (row === positions.lastElementChild) {
    event.preventDefault();
    addPosition();
  }
});

positions.addEventListener("click", (event) => {
  const button = event.target.closest(".remove-button");
  if (!button) return;
  const row = button.closest("tr");
  const nextRow = row.nextElementSibling || row.previousElementSibling;
  row.remove();
  if (positions.rows.length === 0) {
    addPosition();
  } else {
    updateLabels();
    recalculate();
    nextRow.querySelector(".name-input").focus();
  }
});

addPosition(false);
