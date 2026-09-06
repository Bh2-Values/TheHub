const items = [
  {"name": "Altered Soldier", "price": "4m", "value": 4.0, "status": "⚪"},
  {"name": "Amnesia Soldier", "price": "5-6.5m", "value": 5.75, "status": "🟣"},
  {"name": "Chivalric Executioner", "price": "4-6m", "value": 5.0, "status": "🟣"},
  {"name": "Death Ouroboros", "price": "2m", "value": 2.0, "status": "⚪"},
  {"name": "Demonstone Blade", "price": "5m", "value": 5.0, "status": "⚪"},
  {"name": "Fallen Angel Armor", "price": "6-8m", "value": 7.0, "status": "🟣"},
  {"name": "Final Aegis", "price": "3-4.5m", "value": 3.75, "status": "🟣"},
  {"name": "Frank", "price": "1m", "value": 1.0, "status": "⚪"},
  {"name": "Frustrated Furball", "price": "2-3m", "value": 2.5, "status": "🟣"},
  {"name": "Gingerbread Outfit", "price": "14-16m", "value": 15.0, "status": "⚪"},
  {"name": "Heart of The Forest", "price": "4-5.5m", "value": 4.75, "status": "🟣"},
  {"name": "Hollowflare Gourdmail", "price": "15m", "value": 15.0, "status": "⚪"},
  {"name": "Holy Excalibur", "price": "2-3.5m", "value": 2.75, "status": "🟣"},
  {"name": "Hypnotist Jester Costume", "price": "13m", "value": 13.0, "status": "⚪"},
  {"name": "Kyodai Robes", "price": "7m", "value": 7.0, "status": "⚪"},
  {"name": "Masked Demon", "price": "7m", "value": 7.0, "status": "⚪"},
  {"name": "Mythic Homura", "price": "4m", "value": 4.0, "status": "⚪"},
  {"name": "Nun Robes", "price": "5-6m", "value": 5.5, "status": "🟣"},
  {"name": "Puppet Theater", "price": "10-13m", "value": 11.5, "status": "🟣"},
  {"name": "Regal Reindeer Armor", "price": "10-12m", "value": 11.0, "status": "🟣"},
  {"name": "Slick Stalker Coat", "price": "12-14m", "value": 13.0, "status": "🟣"},
  {"name": "Spectral Scythe", "price": "8m", "value": 8.0, "status": "⚪"},
  {"name": "Splendor Vanguard Armor", "price": "2m", "value": 2.0, "status": "⚪"},
  {"name": "Steam Juggernaut", "price": "3m", "value": 3.0, "status": "⚪"},
  {"name": "Summoner's Ring", "price": "1m", "value": 1.0, "status": "⚪"},
  {"name": "Supreme Enforcer", "price": "18m", "value": 18.0, "status": "🔴"},
  {"name": "The Monarch Armor", "price": "6-8.5m", "value": 7.25, "status": "🟣"},
  {"name": "Treant Sentinel", "price": "2m", "value": 2.0, "status": "⚪"},
  {"name": "Trickster's Smile", "price": "8-10m", "value": 9.0, "status": "🟣"},
  {"name": "Twilight Bat Wing", "price": "5-7m", "value": 6.0, "status": "🟣"},
  {"name": "Winter Warden's Armor", "price": "2m", "value": 2.0, "status": "⚪"},
  {"name": "Yuletide Blaze", "price": "25m", "value": 25.0, "status": "⚪"},
  {"name": "Bloodshed", "price": "12-14m", "value": 13.0, "status": "🟣"},
  {"name": "Glacial Wings", "price": "2-3.5m", "value": 2.75, "status": "🟣"},
  {"name": "Poison Peak", "price": "1.5-3m", "value": 2.25, "status": "🟣"},
  {"name": "Spooky Pumpkins", "price": "12-15m", "value": 13.5, "status": "🟣"},
  {"name": "Stars align", "price": "8-11m", "value": 9.5, "status": "🟣"},
  {"name": "Sunset Paradise", "price": "1m", "value": 1.0, "status": "⚪"},
  {"name": "Valkyrie Helmet", "price": "2m", "value": 2.0, "status": "⚪"},
  {"name": "Wings of time", "price": "8-10m", "value": 9.0, "status": "🟣"},
  {"name": "Aura of the Hunted", "price": "15-18m", "value": 16.5, "status": "🟣"},
  {"name": "Demon Eyes", "price": "4-6m", "value": 5.0, "status": "🟣"},
  {"name": "Jack O' Lantern", "price": "4m", "value": 4.0, "status": "⚪"},
  {"name": "Monster Unleashed", "price": "8m", "value": 8.0, "status": "⚪"},
  {"name": "Phantom Fireflies", "price": "4-6.5m", "value": 5.25, "status": "🟣"},
  {"name": "Saint's Blessing", "price": "2-3.5m", "value": 2.75, "status": "🟣"},
  {"name": "Soul devouring Flames", "price": "8m", "value": 8.0, "status": "⚪"},
  {"name": "Unstable Magic", "price": "1m", "value": 1.0, "status": "⚪"},
  {"name": "Abyssal Horror", "price": "2m", "value": 2.0, "status": "⚪"},
  {"name": "Corrupted Demon", "price": "1.5-3m", "value": 2.25, "status": "🟣"},
  {"name": "Demented Clown", "price": "10-12m", "value": 11.0, "status": "🟣"},
  {"name": "Gingerbread Man", "price": "6-8.5m", "value": 7.25, "status": "🟣"},
  {"name": "Snowman", "price": "4m", "value": 4.0, "status": "⚪"},
  {"name": "Soul Sucker", "price": "8-11m", "value": 9.5, "status": "🟣"},
  {"name": "Dark Essence", "price": "300-450k", "value": 0.375, "status": "🟣"},
  {"name": "Demonic Essence", "price": "1.5m", "value": 1.5, "status": "🟢"},
  {"name": "Light Essence", "price": "400-600k", "value": 0.5, "status": "🟣"},
  {"name": "Undead Essence", "price": "800k-1.2m", "value": 1.0, "status": "🟣"}
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
      <td>${item.status}</td>
      <td>
        <button class="btn-trade btn-your" onclick="addToTrade('${item.name.replace(/'/g, "\\'")}', ${item.value}, 'your')">+ Your Side</button>
        <button class="btn-trade btn-their" onclick="addToTrade('${item.name.replace(/'/g, "\\'")}', ${item.value}, 'their')">+ Their Side</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function filterData() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const status = document.getElementById("statusFilter").value;

  const filtered = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(query);
    const matchesStatus = status === "" || item.status === status;
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

function removeFromTrade(index, side) {
  if (side === 'your') {
    yourOffer.splice(index, 1);
  } else {
    theirOffer.splice(index, 1);
  }
  updateTradeUI();
}

function updateTradeUI() {
  const yourList = document.getElementById("yourList");
  const yourTotal = document.getElementById("yourTotal");
  yourList.innerHTML = yourOffer.map((item, idx) => `
    <li>
      <span>${item.name} (${item.val >= 1 ? item.val + 'm' : (item.val * 1000) + 'k'})</span>
      <span class="remove-btn" onclick="removeFromTrade(${idx}, 'your')">✕</span>
    </li>
  `).join("");
  const sumYour = yourOffer.reduce((acc, i) => acc + i.val, 0);
  yourTotal.innerText = sumYour >= 1 ? `${sumYour.toFixed(2)}m` : `${(sumYour * 1000).toFixed(0)}k`;

  const theirList = document.getElementById("theirList");
  const theirTotal = document.getElementById("theirTotal");
  theirList.innerHTML = theirOffer.map((item, idx) => `
    <li>
      <span>${item.name} (${item.val >= 1 ? item.val + 'm' : (item.val * 1000) + 'k'})</span>
      <span class="remove-btn" onclick="removeFromTrade(${idx}, 'their')">✕</span>
    </li>
  `).join("");
  const sumTheir = theirOffer.reduce((acc, i) => acc + i.val, 0);
  theirTotal.innerText = sumTheir >= 1 ? `${sumTheir.toFixed(2)}m` : `${(sumTheir * 1000).toFixed(0)}k`;
}

// Initial render
renderTable(items);