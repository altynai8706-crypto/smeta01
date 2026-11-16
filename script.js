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
const numberInput = document.querySelector('[name="estimate-number"]');
const commentInput = document.querySelector("#comment");
const savePdfButton = document.querySelector("#save-pdf");
const newEstimateButton = document.querySelector("#new-estimate");
const copyWhatsAppButton = document.querySelector("#copy-whatsapp");
const copyStatus = document.querySelector("#copy-status");
const manualCopy = document.querySelector("#manual-copy");
const manualCopyText = document.querySelector("#manual-copy-text");
const fromInput = document.querySelector('[name="from"]');
const toInput = document.querySelector('[name="to"]');
const storageKey = "smeta-5-minutes-draft-v1";
let copyStatusTimer;

function todayValue() {
  const today = new Date();
  return [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-");
}

dateInput.value = todayValue();

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
    <td data-label="Наименование"><input class="name-input" type="text" placeholder="Название товара или услуги"><span class="print-value print-name"></span></td>
    <td data-label="Количество"><input class="quantity-input" type="text" inputmode="decimal" placeholder="0"><span class="print-value print-quantity"></span></td>
    <td data-label="Единица"><select class="unit-select"><option value="шт">шт</option><option value="час">час</option><option value="услуга">услуга</option></select><span class="print-value print-unit"></span></td>
    <td data-label="Цена"><input class="price-input" type="text" inputmode="decimal" placeholder="0"><span class="print-value print-price"></span></td>
    <td data-label="Сумма"><output class="row-total">0 ₸</output></td>
    <td data-label="Удалить"><button class="remove-button" type="button" title="Удалить позицию">✕</button></td>
  `;
  positions.append(row);
  updateLabels();
  recalculate();
  if (focusName) row.querySelector(".name-input").focus();
}

function syncPrintDocument() {
  const number = numberInput.value.trim();
  const date = formatDate(dateInput.value);
  document.querySelector("#print-number").textContent = number || "—";
  document.querySelector("#print-date").textContent = date || "—";
  document.querySelector("#print-from").textContent = fromInput.value.trim();
  document.querySelector("#print-to").textContent = toInput.value.trim();
  document.querySelector("#print-detail-number").textContent = number;
  document.querySelector("#print-detail-date").textContent = date;
  document.querySelector("#print-comment").textContent = commentInput.value.trim();

  [...positions.rows].forEach((row) => {
    row.querySelector(".print-name").textContent = row.querySelector(".name-input").value.trim();
    row.querySelector(".print-quantity").textContent = String(readNumber(row.querySelector(".quantity-input").value));
    row.querySelector(".print-unit").textContent = row.querySelector(".unit-select").value;
    row.querySelector(".print-price").textContent = formatMoney(readNumber(row.querySelector(".price-input").value));
  });
}

function formatDate(value) {
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}.${month}.${year}` : "";
}

function saveDraft() {
  const draft = {
    from: fromInput.value,
    to: toInput.value,
    number: numberInput.value,
    date: dateInput.value,
    discount: discountInput.value,
    vat: vatInput.value,
    currency: currencySelect.value,
    comment: commentInput.value,
    positions: [...positions.rows].map((row) => ({
      name: row.querySelector(".name-input").value,
      quantity: row.querySelector(".quantity-input").value,
      unit: row.querySelector(".unit-select").value,
      price: row.querySelector(".price-input").value,
    })),
  };
  try {
    localStorage.setItem(storageKey, JSON.stringify(draft));
  } catch {
    // Расчёт остаётся доступным, если браузер запретил хранение данных.
  }
}

function restoreDraft() {
  let draft;
  try {
    draft = JSON.parse(localStorage.getItem(storageKey));
  } catch {
    draft = null;
  }
  if (!draft || typeof draft !== "object") {
    addPosition(false);
    return;
  }
  if (typeof draft.from === "string") fromInput.value = draft.from;
  if (typeof draft.to === "string") toInput.value = draft.to;
  if (typeof draft.number === "string") numberInput.value = draft.number;
  if (typeof draft.date === "string") dateInput.value = draft.date;
  if (typeof draft.discount === "string") discountInput.value = draft.discount;
  if (typeof draft.vat === "string") vatInput.value = draft.vat;
  if (["₸", "₽", "$", "€"].includes(draft.currency)) currencySelect.value = draft.currency;
  if (typeof draft.comment === "string") commentInput.value = draft.comment;

  if (Array.isArray(draft.positions)) {
    draft.positions.forEach((item) => {
      if (!item || typeof item !== "object") return;
      addPosition(false);
      const row = positions.lastElementChild;
      if (typeof item.name === "string") row.querySelector(".name-input").value = item.name;
      if (typeof item.quantity === "string") row.querySelector(".quantity-input").value = item.quantity;
      if (["шт", "час", "услуга"].includes(item.unit)) row.querySelector(".unit-select").value = item.unit;
      if (typeof item.price === "string") row.querySelector(".price-input").value = item.price;
    });
  }
  if (positions.rows.length === 0) addPosition(false);
  recalculate();
}

function nextEstimateNumber(current) {
  const match = current.trim().match(/^(.*?)(\d+)$/);
  if (!match) return "1";
  const next = Number(match[2]) + 1;
  return Number.isSafeInteger(next) ? `${match[1]}${String(next).padStart(match[2].length, "0")}` : "1";
}

function newEstimate() {
  if (!window.confirm("Создать новую смету? Текущий черновик будет удалён.")) return;
  const nextNumber = nextEstimateNumber(numberInput.value);
  fromInput.value = "";
  toInput.value = "";
  numberInput.value = nextNumber;
  dateInput.value = todayValue();
  discountInput.value = "0";
  vatInput.value = "0";
  currencySelect.value = "₸";
  commentInput.value = "";
  positions.replaceChildren();
  addPosition(false);
  manualCopy.hidden = true;
  copyStatus.textContent = "";
  clearTimeout(copyStatusTimer);
  saveDraft();
  fromInput.focus();
}

function formatQuantity(value) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 10 })
    .format(readNumber(value)).replace(/[\s\u00a0\u202f]/g, " ");
}

function whatsappText() {
  recalculate();
  const lines = [`Смета № ${numberInput.value.trim() || "—"} от ${formatDate(dateInput.value) || "—"}`];
  [...positions.rows].forEach((row) => {
    const name = row.querySelector(".name-input").value.trim();
    const quantity = row.querySelector(".quantity-input").value;
    const price = row.querySelector(".price-input").value;
    if (!name && readNumber(quantity) === 0 && readNumber(price) === 0) return;
    lines.push(`• ${name || "Без названия"} — ${formatQuantity(quantity)} ${row.querySelector(".unit-select").value} × ${formatMoney(readNumber(price))} = ${row.querySelector(".row-total").textContent}`);
  });
  if (!discountRow.hidden) lines.push(`Скидка ${Math.min(readNumber(discountInput.value), 100)} %: ${discountOutput.textContent}`);
  if (!vatRow.hidden) lines.push(`НДС ${formatQuantity(vatInput.value)} %: ${vatOutput.textContent}`);
  lines.push(`Итого к оплате: ${grandTotal.textContent}`);
  return lines.join("\n");
}

async function copyForWhatsApp() {
  const text = whatsappText();
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(text);
    manualCopy.hidden = true;
    copyStatus.textContent = "Скопировано ✓";
    clearTimeout(copyStatusTimer);
    copyStatusTimer = setTimeout(() => { copyStatus.textContent = ""; }, 2000);
  } catch {
    manualCopyText.value = text;
    manualCopy.hidden = false;
    copyStatus.textContent = "Скопируйте текст вручную";
    clearTimeout(copyStatusTimer);
    manualCopyText.focus();
    manualCopyText.select();
  }
}

addPositionButton.addEventListener("click", () => {
  addPosition();
  saveDraft();
});
discountInput.addEventListener("input", recalculate);
vatInput.addEventListener("input", recalculate);
currencySelect.addEventListener("change", recalculate);
document.querySelector(".page").addEventListener("input", saveDraft);
document.querySelector(".page").addEventListener("change", saveDraft);
newEstimateButton.addEventListener("click", newEstimate);
copyWhatsAppButton.addEventListener("click", copyForWhatsApp);
savePdfButton.addEventListener("click", () => {
  recalculate();
  syncPrintDocument();
  window.print();
});
window.addEventListener("beforeprint", () => {
  recalculate();
  syncPrintDocument();
});

positions.addEventListener("input", (event) => {
  if (event.target.matches(".quantity-input, .price-input")) recalculate();
});

positions.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || event.isComposing || !event.target.matches("input")) return;
  const row = event.target.closest("tr");
  if (row === positions.lastElementChild) {
    event.preventDefault();
    addPosition();
    saveDraft();
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
  saveDraft();
});

restoreDraft();
