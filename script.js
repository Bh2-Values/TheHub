// Estructura de datos procesada desde tu CSV
const items = [
  { name: "Altered Soldier", price: "4m", value: 4, status: "⚪" },
  { name: "Amnesia Soldier", price: "5-6.5m", value: 5.75, status: "🟣" },
  { name: "Gingerbread Outfit", price: "14-16m", value: 15, status: "⚪" },
  { name: "Bloodshed", price: "12-14m", value: 13, status: "🟣" },
  { name: "Yuletide Blaze", price: "25m", value: 25, status: "⚪" },
  { name: "Poison Peak", price: "1.5-3m", value: 2.25, status: "🟣" }
];

let yourOffer = [];
let theirOffer = [];

function renderTable(data) {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  data.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${item.name}</strong></td>
      <td>${item.price}</td>
      <td><span class="status-badge">${item.status}</span></td>
      <td>
        <button onclick="addToTrade('${item.name}', ${item.value}, 'your')">+ Tu Lado</button>
        <button onclick="addToTrade('${item.name}', ${item.value}, 'their')">+ Su Lado</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function filterData() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const status = document.getElementById("statusFilter").value;

  const filtered = items.filter(item => {
    matchesSearch = item.name.toLowerCase().includes(query);
    matchesStatus = status === "" || item.status === status;
    return matchesSearch && matchesStatus;
  });

  renderTable(filtered);
}

function addToTrade(name, val, side) {
  if (side === 'your') {
    yourOffer.push({ name, val });
  } else {
    theirOffer.push({ name, val });
  }
  updateTradeUI();
}

function updateTradeUI() {
  const yourList = document.getElementById("yourSide");
  const yourTotal = document.getElementById("yourTotal");
  yourList.innerHTML = yourOffer.map(i => `<li>${i.name} (${i.val}m)</li>`).join("");
  const sumYour = yourOffer.reduce((acc, i) => acc + i.val, 0);
  yourTotal.innerText = `${sumYour}m`;

  const theirList = document.getElementById("theirSide");
  const theirTotal = document.getElementById("theirTotal");
  theirList.innerHTML = theirOffer.map(i => `<li>${i.name} (${i.val}m)</li>`).join("");
  const sumTheir = theirOffer.reduce((acc, i) => acc + i.val, 0);
  theirTotal.innerText = `${sumTheir}m`;
}

// Carga inicial
renderTable(items);
