const filters = document.querySelectorAll(".filter");
const inventoryRows = document.querySelectorAll("#restock-table-body tr");
const dialog = document.getElementById("restock-dialog");
const dialogItem = document.getElementById("dialog-item");
const quantityInput = document.getElementById("restock-quantity");
const message = document.getElementById("action-message");
const sectionLabel = document.getElementById("current-section");
const pageTitle = document.getElementById("page-title");
let selectedItem = "";

const screenTitles = {
  "overview-screen": "Inventory overview",
  "inventory-screen": "Electronics inventory",
  "rules-screen": "Restock rules",
  "suppliers-screen": "Electronics suppliers",
};

filters.forEach((button) => {
  button.addEventListener("click", () => {
    filters.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    inventoryRows.forEach((row) => {
      row.hidden = button.dataset.filter !== "all" && row.dataset.status !== button.dataset.filter;
    });
  });
});

document.querySelectorAll(".restock-button").forEach((button) => {
  button.addEventListener("click", () => {
    selectedItem = button.dataset.item;
    dialogItem.textContent = selectedItem;
    quantityInput.value = button.dataset.quantity;
    dialog.showModal();
  });
});

document.getElementById("confirm-restock").addEventListener("click", (event) => {
  if (!quantityInput.checkValidity()) return;
  event.preventDefault();
  dialog.close();
  message.textContent = `Request created for ${quantityInput.value} units of ${selectedItem}.`;
});

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    document.querySelectorAll(".workspace-screen").forEach((screen) => {
      screen.classList.toggle("active", screen.id === button.dataset.screen);
    });
    sectionLabel.textContent = button.dataset.label;
    pageTitle.textContent = screenTitles[button.dataset.screen];
    message.textContent = "";
    window.history.replaceState(null, "", `#${button.dataset.screen.replace("-screen", "")}`);
  });
});

document.querySelector(".brand").addEventListener("click", (event) => {
  event.preventDefault();
  document.querySelector('[data-screen="overview-screen"]').click();
});

const catalogSearch = document.querySelector(".catalog-search input");
catalogSearch.addEventListener("input", () => {
  const query = catalogSearch.value.trim().toLowerCase();
  document.querySelectorAll(".product-card").forEach((card) => {
    card.hidden = !card.textContent.toLowerCase().includes(query);
  });
});

const initialScreen = `${window.location.hash.slice(1)}-screen`;
const initialButton = document.querySelector(`[data-screen="${initialScreen}"]`);
if (initialButton) initialButton.click();
