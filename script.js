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
const themeToggle = document.querySelector("#theme-toggle");
const storageKey = "smeta-5-minutes-draft-v1";
let copyStatusTimer;
let copyStatusKey = "";
let language = "ru";
let theme = "light";

const translations = {
  ru: {
    appTitle: "Смета за 5 минут", hint: "Добавьте позиции — суммы и итог посчитаются автоматически.",
    languageLabel: "Язык интерфейса", details: "Реквизиты", from: "От кого", to: "Для кого",
    estimateNumber: "Номер сметы", date: "Дата", positions: "Позиции", name: "Наименование",
    quantity: "Количество", unit: "Единица", price: "Цена", sum: "Сумма", remove: "Удалить",
    rowActions: "Действия", duplicate: "Дублировать", duplicatePosition: "Дублировать позицию",
    addPosition: "+ Добавить позицию", discountPercent: "Скидка, %", vatPercent: "НДС, %",
    currency: "Валюта", totalLabel: "Итог сметы", discount: "Скидка",
    discountedSum: "Сумма со скидкой", vat: "НДС", grandTotal: "Итого к оплате",
    comment: "Комментарий", signature: "Подпись ____________________", newEstimate: "Новая смета",
    copyWhatsApp: "Скопировать для WhatsApp", savePdf: "Сохранить PDF",
    manualCopy: "Текст для копирования вручную", fromPlaceholder: "Ваша компания или имя",
    toPlaceholder: "Клиент или организация", numberPlaceholder: "Например, 001",
    commentPlaceholder: "Сроки, условия оплаты и другие примечания",
    namePlaceholder: "Название товара или услуги", removePosition: "Удалить позицию",
    unitPiece: "шт", unitHour: "час", unitService: "услуга", unnamed: "Без названия",
    newConfirm: "Создать новую смету? Текущий черновик будет удалён.",
    copied: "Скопировано ✓", copyManually: "Скопируйте текст вручную",
    themeLight: "Светлая тема", themeDark: "Тёмная тема",
  },
  kk: {
    appTitle: "5 минутта смета", hint: "Позицияларды қосыңыз — сомалар мен қорытынды автоматты түрде есептеледі.",
    languageLabel: "Интерфейс тілі", details: "Деректемелер", from: "Кімнен", to: "Кімге",
    estimateNumber: "Смета нөмірі", date: "Күні", positions: "Позициялар", name: "Атауы",
    quantity: "Саны", unit: "Өлшем бірлігі", price: "Бағасы", sum: "Сомасы", remove: "Өшіру",
    rowActions: "Әрекеттер", duplicate: "Көшірмелеу", duplicatePosition: "Позицияны көшірмелеу",
    addPosition: "+ Позиция қосу", discountPercent: "Жеңілдік, %", vatPercent: "ҚҚС, %",
    currency: "Валюта", totalLabel: "Смета қорытындысы", discount: "Жеңілдік",
    discountedSum: "Жеңілдіктен кейінгі сома", vat: "ҚҚС", grandTotal: "Төленетін жалпы сома",
    comment: "Түсініктеме", signature: "Қолы ____________________", newEstimate: "Жаңа смета",
    copyWhatsApp: "WhatsApp үшін көшіру", savePdf: "PDF сақтау",
    manualCopy: "Қолмен көшіруге арналған мәтін", fromPlaceholder: "Компанияңыз немесе атыңыз",
    toPlaceholder: "Клиент немесе ұйым", numberPlaceholder: "Мысалы, 001",
    commentPlaceholder: "Мерзімдер, төлем шарттары және басқа ескертпелер",
    namePlaceholder: "Тауар немесе қызмет атауы", removePosition: "Позицияны өшіру",
    unitPiece: "дана", unitHour: "сағ", unitService: "қызмет", unnamed: "Атауы жоқ",
    newConfirm: "Жаңа смета жасайсыз ба? Ағымдағы жоба өшіріледі.",
    copied: "Көшірілді ✓", copyManually: "Мәтінді қолмен көшіріңіз",
    themeLight: "Жарық тақырып", themeDark: "Қараңғы тақырып",
  },
};

function t(key) {
  return translations[language][key];
}

function updateTheme() {
  document.documentElement.dataset.theme = theme;
  themeToggle.textContent = t(theme === "dark" ? "themeLight" : "themeDark");
  themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
}

function unitLabel(value) {
  return { шт: t("unitPiece"), час: t("unitHour"), услуга: t("unitService") }[value] || t("unitPiece");
}

function translateRow(row) {
  ["name", "quantity", "unit", "price", "sum", "rowActions"].forEach((key, index) => {
    row.cells[index].dataset.label = t(key);
  });
  row.querySelector(".name-input").placeholder = t("namePlaceholder");
  row.querySelector('.unit-select option[value="шт"]').textContent = t("unitPiece");
  row.querySelector('.unit-select option[value="час"]').textContent = t("unitHour");
  row.querySelector('.unit-select option[value="услуга"]').textContent = t("unitService");
  row.querySelector(".remove-button").title = t("removePosition");
  row.querySelector(".duplicate-button").textContent = t("duplicate");
}

function updateLanguage() {
  document.documentElement.lang = language;
  document.title = t("appTitle");
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAria));
  });
  document.querySelectorAll("[data-language]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.language === language));
  });
  [...positions.rows].forEach(translateRow);
  updateLabels();
  if (copyStatusKey) copyStatus.textContent = t(copyStatusKey);
  if (!manualCopy.hidden) manualCopyText.value = whatsappText();
  updateTheme();
}

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
    row.querySelector(".name-input").setAttribute("aria-label", `${t("name")}, № ${number}`);
    row.querySelector(".quantity-input").setAttribute("aria-label", `${t("quantity")}, № ${number}`);
    row.querySelector(".unit-select").setAttribute("aria-label", `${t("unit")}, № ${number}`);
    row.querySelector(".price-input").setAttribute("aria-label", `${t("price")}, № ${number}`);
    row.querySelector(".remove-button").setAttribute("aria-label", `${t("removePosition")} № ${number}`);
    row.querySelector(".duplicate-button").setAttribute("aria-label", `${t("duplicatePosition")} № ${number}`);
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

function addPosition(focusName = true, afterRow = null) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td data-label="Наименование"><input class="name-input" type="text" placeholder="Название товара или услуги"><span class="print-value print-name"></span></td>
    <td data-label="Количество"><input class="quantity-input" type="text" inputmode="decimal" placeholder="0"><span class="print-value print-quantity"></span></td>
    <td data-label="Единица"><select class="unit-select"><option value="шт">шт</option><option value="час">час</option><option value="услуга">услуга</option></select><span class="print-value print-unit"></span></td>
    <td data-label="Цена"><input class="price-input" type="text" inputmode="decimal" placeholder="0"><span class="print-value print-price"></span></td>
    <td data-label="Сумма"><output class="row-total">0 ₸</output></td>
    <td data-label="Действия"><div class="row-actions"><button class="secondary-button duplicate-button" type="button">Дублировать</button><button class="remove-button" type="button" title="Удалить позицию">✕</button></div></td>
  `;
  if (afterRow) afterRow.after(row);
  else positions.append(row);
  translateRow(row);
  updateLabels();
  recalculate();
  if (focusName) row.querySelector(".name-input").focus();
  return row;
}

function syncPrintDocument() {
  const number = numberInput.value.trim();
  const date = formatDate(dateInput.value);
  document.querySelector("#print-heading").textContent = language === "ru"
    ? `Смета № ${number || "—"} от ${date || "—"}`
    : `№ ${number || "—"} смета · ${date || "—"}`;
  document.querySelector("#print-from").textContent = fromInput.value.trim();
  document.querySelector("#print-to").textContent = toInput.value.trim();
  document.querySelector("#print-detail-number").textContent = number;
  document.querySelector("#print-detail-date").textContent = date;
  document.querySelector("#print-comment").textContent = commentInput.value.trim();

  [...positions.rows].forEach((row) => {
    row.querySelector(".print-name").textContent = row.querySelector(".name-input").value.trim();
    row.querySelector(".print-quantity").textContent = String(readNumber(row.querySelector(".quantity-input").value));
    row.querySelector(".print-unit").textContent = unitLabel(row.querySelector(".unit-select").value);
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
    language,
    theme,
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
  if (draft.language === "ru" || draft.language === "kk") language = draft.language;
  if (draft.theme === "light" || draft.theme === "dark") theme = draft.theme;
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
  if (!window.confirm(t("newConfirm"))) return;
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
  copyStatusKey = "";
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
  const number = numberInput.value.trim() || "—";
  const date = formatDate(dateInput.value) || "—";
  const lines = [language === "ru" ? `Смета № ${number} от ${date}` : `№ ${number} смета · ${date}`];
  [...positions.rows].forEach((row) => {
    const name = row.querySelector(".name-input").value.trim();
    const quantity = row.querySelector(".quantity-input").value;
    const price = row.querySelector(".price-input").value;
    if (!name && readNumber(quantity) === 0 && readNumber(price) === 0) return;
    lines.push(`• ${name || t("unnamed")} — ${formatQuantity(quantity)} ${unitLabel(row.querySelector(".unit-select").value)} × ${formatMoney(readNumber(price))} = ${row.querySelector(".row-total").textContent}`);
  });
  if (!discountRow.hidden) lines.push(`${t("discount")} ${Math.min(readNumber(discountInput.value), 100)} %: ${discountOutput.textContent}`);
  if (!vatRow.hidden) lines.push(`${t("vat")} ${formatQuantity(vatInput.value)} %: ${vatOutput.textContent}`);
  lines.push(`${t("grandTotal")}: ${grandTotal.textContent}`);
  return lines.join("\n");
}

async function copyForWhatsApp() {
  const text = whatsappText();
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(text);
    manualCopy.hidden = true;
    copyStatusKey = "copied";
    copyStatus.textContent = t(copyStatusKey);
    clearTimeout(copyStatusTimer);
    copyStatusTimer = setTimeout(() => { copyStatus.textContent = ""; copyStatusKey = ""; }, 2000);
  } catch {
    manualCopyText.value = text;
    manualCopy.hidden = false;
    copyStatusKey = "copyManually";
    copyStatus.textContent = t(copyStatusKey);
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
document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => {
    language = button.dataset.language;
    updateLanguage();
    saveDraft();
  });
});
themeToggle.addEventListener("click", () => {
  theme = theme === "dark" ? "light" : "dark";
  updateTheme();
  saveDraft();
});
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
  const duplicateButton = event.target.closest(".duplicate-button");
  if (duplicateButton) {
    const source = duplicateButton.closest("tr");
    const copy = addPosition(false, source);
    ["name-input", "quantity-input", "unit-select", "price-input"].forEach((className) => {
      copy.querySelector(`.${className}`).value = source.querySelector(`.${className}`).value;
    });
    recalculate();
    saveDraft();
    copy.querySelector(".name-input").focus();
    return;
  }
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
updateLanguage();
