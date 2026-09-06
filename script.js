// Archivo script.js - BH2 Value List & Calculator (Formato Cuadrícula)

const items = [
  // --- OVERLAYS ---
  { "name": "Altered Soldier", "category": "Overlays", "price": "4m", "value": 4.0, "status": "⚪", "image": "images/altered_soldier.png" },
  { "name": "Amnesia Soldier", "category": "Overlays", "price": "5-6.5m", "value": 5.75, "status": "🟣", "image": "images/amnesia_soldier.png" },
  { "name": "Chivalric Executioner", "category": "Overlays", "price": "4-6m", "value": 5.0, "status": "🟣", "image": "images/chivalric_executioner.png" },
  { "name": "Death Ouroboros", "category": "Overlays", "price": "2m", "value": 2.0, "status": "⚪", "image": "images/death_ouroboros.png" },
  { "name": "Demonstone Blade", "category": "Overlays", "price": "5m", "value": 5.0, "status": "⚪", "image": "images/demonstone_blade.png" },
  { "name": "Fallen Angel Armor", "category": "Overlays", "price": "6-8m", "value": 7.0, "status": "🟣", "image": "images/fallen_angel_armor.png" },
  { "name": "Final Aegis", "category": "Overlays", "price": "3-4.5m", "value": 3.75, "status": "🟣", "image": "images/final_aegis.png" },
  { "name": "Frank", "category": "Overlays", "price": "1m", "value": 1.0, "status": "⚪", "image": "images/frank.png" },
  { "name": "Frustrated Furball", "category": "Overlays", "price": "2-3m", "value": 2.5, "status": "🟣", "image": "images/frustrated_furball.png" },
  { "name": "Gingerbread Outfit", "category": "Overlays", "price": "14-16m", "value": 15.0, "status": "⚪", "image": "images/gingerbread_outfit.png" },
  { "name": "Heart of The Forest", "category": "Overlays", "price": "4-5.5m", "value": 4.75, "status": "🟣", "image": "images/heart_of_the_forest.png" },
  { "name": "Hollowflare Gourdmail", "category": "Overlays", "price": "15m", "value": 15.0, "status": "⚪", "image": "images/hollowflare_gourdmail.png" },
  { "name": "Holy Excalibur", "category": "Overlays", "price": "2-3.5m", "value": 2.75, "status": "🟣", "image": "images/holy_excalibur.png" },
  { "name": "Hypnotist Jester Costume", "category": "Overlays", "price": "13m", "value": 13.0, "status": "⚪", "image": "images/hypnotist_jester_costume.png" },
  { "name": "Kyodai Robes", "category": "Overlays", "price": "7m", "value": 7.0, "status": "⚪", "image": "images/kyodai_robes.png" },
  { "name": "Masked Demon", "category": "Overlays", "price": "7m", "value": 7.0, "status": "⚪", "image": "images/masked_demon.png" },
  { "name": "Mythic Homura", "category": "Overlays", "price": "4m", "value": 4.0, "status": "⚪", "image": "images/mythic_homura.png" },
  { "name": "Nun Robes", "category": "Overlays", "price": "5-6m", "value": 5.5, "status": "🟣", "image": "images/nun_robes.png" },
  { "name": "Radiant Falcon Armor", "category": "Overlays", "price": "5m", "value": 5.0, "status": "⚪", "image": "images/radiant_falcon_armor.png" },
  { "name": "Sacraficial Soul Set", "category": "Overlays", "price": "7m", "value": 7.0, "status": "⚪", "image": "images/sacraficial_soul_set.png" },
  { "name": "Scuba Outfit", "category": "Overlays", "price": "5-7m", "value": 6.0, "status": "🟣", "image": "images/scuba_outfit.png" },
  { "name": "Snowman Costume", "category": "Overlays", "price": "14m", "value": 14.0, "status": "⚪", "image": "images/snowman_costume.png" },
  { "name": "Tsuu Costume", "category": "Overlays", "price": "4-6m", "value": 5.0, "status": "🟣", "image": "images/tsuu_costume.png" },
  { "name": "Valentine Dress", "category": "Overlays", "price": "20m", "value": 20.0, "status": "⚪", "image": "images/valentine_dress.png" },
  { "name": "Wintertide Coat", "category": "Overlays", "price": "18-23m", "value": 20.5, "status": "🟣", "image": "images/wintertide_coat.png" },

  // --- AURAS ---
  { "name": "Bloodshed", "category": "Auras", "price": "12-14m", "value": 13.0, "status": "🟣", "image": "images/bloodshed.png" },
  { "name": "Blue Soul", "category": "Auras", "price": "6-8m", "value": 7.0, "status": "⚪", "image": "images/blue_soul.png" },
  { "name": "Conflagration", "category": "Auras", "price": "4-6m", "value": 5.0, "status": "🟣", "image": "images/conflagration.png" },
  { "name": "Cosmic Kitten", "category": "Auras", "price": "6m", "value": 6.0, "status": "⚪", "image": "images/cosmic_kitten.png" },
  { "name": "Cupid's Flame", "category": "Auras", "price": "21m", "value": 21.0, "status": "⚪", "image": "images/cupids_flame.png" },
  { "name": "Cupid's Storm", "category": "Auras", "price": "14m", "value": 14.0, "status": "⚪", "image": "images/cupids_storm.png" },
  { "name": "Dark Lightning", "category": "Auras", "price": "9m", "value": 9.0, "status": "🟢", "image": "images/dark_lightning.png" },
  { "name": "Falling Feels", "category": "Auras", "price": "12-14m", "value": 13.0, "status": "🟣", "image": "images/falling_feels.png" },
  { "name": "Frozen Storm", "category": "Auras", "price": "7m", "value": 7.0, "status": "⚪", "image": "images/frozen_storm.png" },
  { "name": "Icy Inferno", "category": "Auras", "price": "9m", "value": 9.0, "status": "🟢", "image": "images/icy_inferno.png" },
  { "name": "Jelly Surge", "category": "Auras", "price": "3-4m", "value": 3.5, "status": "🟣", "image": "images/jelly_surge.png" },
  { "name": "Leaping Legend", "category": "Auras", "price": "6m", "value": 6.0, "status": "⚪", "image": "images/leaping_legend.png" },
  { "name": "Lightshow", "category": "Auras", "price": "4m", "value": 4.0, "status": "⚪", "image": "images/lightshow.png" },
  { "name": "Poison Peak", "category": "Auras", "price": "1.5-3m", "value": 2.25, "status": "🟣", "image": "images/poison_peak.png" },
  { "name": "Shadow Ash", "category": "Auras", "price": "2.5-3.5m", "value": 3.0, "status": "🟣", "image": "images/shadow_ash.png" },
  { "name": "Sightful", "category": "Auras", "price": "4m", "value": 4.0, "status": "⚪", "image": "images/sightful.png" },
  { "name": "Solar Flare", "category": "Auras", "price": "3m", "value": 3.0, "status": "⚪", "image": "images/solar_flare.png" },
  { "name": "Sun Wrath", "category": "Auras", "price": "17-20m", "value": 18.5, "status": "⚪", "image": "images/sun_wrath.png" },
  { "name": "Supernova", "category": "Auras", "price": "2-3.5m", "value": 2.75, "status": "🟣", "image": "images/supernova.png" },
  { "name": "Teal Bloom", "category": "Auras", "price": "10m", "value": 10.0, "status": "⚪", "image": "images/teal_bloom.png" },
  { "name": "Water Wrath", "category": "Auras", "price": "6-7.5m", "value": 6.75, "status": "⚪", "image": "images/water_wrath.png" },
  { "name": "Yuletide Blaze", "category": "Auras", "price": "25m", "value": 25.0, "status": "⚪", "image": "images/yuletide_blaze.png" },

  // --- MOUNTS ---
  { "name": "Dune Rider", "category": "Mounts", "price": "6-7m", "value": 6.5, "status": "🟣", "image": "images/dune_rider.png" },
  { "name": "Enchanted Hyoraiten", "category": "Mounts", "price": "8m", "value": 8.0, "status": "🟢", "image": "images/enchanted_hyoraiten.png" },
  { "name": "Fluffim", "category": "Mounts", "price": "2.5m", "value": 2.5, "status": "⚪", "image": "images/fluffim.png" },
  { "name": "Hell Horse", "category": "Mounts", "price": "10m", "value": 10.0, "status": "🟢", "image": "images/hell_horse.png" },
  { "name": "Hikariryuu", "category": "Mounts", "price": "4.5m", "value": 4.5, "status": "⚪", "image": "images/hikariryuu.png" },
  { "name": "Infernal Wolf", "category": "Mounts", "price": "1.6-2.2m", "value": 1.9, "status": "🟣", "image": "images/infernal_wolf.png" },
  { "name": "Metal Slime", "category": "Mounts", "price": "0.5-1m", "value": 0.75, "status": "⚪", "image": "images/metal_slime.png" },
  { "name": "Submarine", "category": "Mounts", "price": "5m", "value": 5.0, "status": "⚪", "image": "images/submarine.png" },
  { "name": "Yeti", "category": "Mounts", "price": "1-2m", "value": 1.5, "status": "🟣", "image": "images/yeti.png" }
];

// Listas para la calculadora
let yourTrade = [];
let theirTrade = [];

// Función para renderizar la cuadrícula (evita problemas de caché en las imágenes)
function renderItemsGrid(itemsToRender) {
  const container = document.getElementById("itemsGrid");
  if (!container) return;

  container.innerHTML = "";

  itemsToRender.forEach((item) => {
    const card = document.createElement("div");
    card.className = "item-card";

    // Se añade un parámetro de versión para forzar al navegador a solicitar la imagen real actualizada
    const imageUrl = item.image + "?v=4";

    card.innerHTML = `
      <img src="${imageUrl}" alt="${item.name}" onerror="this.onerror=null; this.src='https://via.placeholder.com/60?text=?';">
      <div class="item-name">${item.name}</div>
      <div class="item-price">${item.price}</div>
      <div class="badge">${item.status} ${item.category}</div>
      <div class="btn-group">
        <button class="btn-add btn-your" onclick="addToYour('${item.name}')">+ Your</button>
        <button class="btn-add btn-their" onclick="addToTheir('${item.name}')">+ Their</button>
      </div>
    `;

    container.appendChild(card);
  });
}

// Filtro Multicriterio (Búsqueda, Categoría y Estado)
function filterData() {
  const searchText = document.getElementById("searchInput").value.toLowerCase();
  const categorySelected = document.getElementById("categoryFilter") ? document.getElementById("categoryFilter").value : "";
  const statusSelected = document.getElementById("statusFilter").value;

  const filtered = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchText);
    const matchesCategory = categorySelected === "" || item.category === categorySelected;
    const matchesStatus = statusSelected === "" || item.status === statusSelected;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  renderItemsGrid(filtered);
}

// Lógica de la Calculadora de Trades
function addToYour(itemName) {
  const item = items.find((i) => i.name === itemName);
  if (item) {
    yourTrade.push(item);
    updateCalculator();
  }
}

function addToTheir(itemName) {
  const item = items.find((i) => i.name === itemName);
  if (item) {
    theirTrade.push(item);
    updateCalculator();
  }
}

function removeFromYour(index) {
  yourTrade.splice(index, 1);
  updateCalculator();
}

function removeFromTheir(index) {
  theirTrade.splice(index, 1);
  updateCalculator();
}

function updateCalculator() {
  const yourListEl = document.getElementById("yourList");
  const theirListEl = document.getElementById("theirList");
  const yourTotalEl = document.getElementById("yourTotal");
  const theirTotalEl = document.getElementById("theirTotal");
  const verdictBox = document.getElementById("verdictBox");

  // Render Your Side
  yourListEl.innerHTML = "";
  let yourSum = 0;
  yourTrade.forEach((item, idx) => {
    yourSum += item.value;
    yourListEl.innerHTML += `
      <li class="trade-item">
        <span>${item.name} (${item.value}m)</span>
        <span class="remove-icon" onclick="removeFromYour(${idx})">✕</span>
      </li>
    `;
  });

  // Render Their Side
  theirListEl.innerHTML = "";
  let theirSum = 0;
  theirTrade.forEach((item, idx) => {
    theirSum += item.value;
    theirListEl.innerHTML += `
      <li class="trade-item">
        <span>${item.name} (${item.value}m)</span>
        <span class="remove-icon" onclick="removeFromTheir(${idx})">✕</span>
      </li>
    `;
  });

  yourTotalEl.innerText = `${yourSum.toFixed(2)}m`;
  theirTotalEl.innerText = `${theirSum.toFixed(2)}m`;

  // Dictamen / Verdict
  const diff = theirSum - yourSum;
  verdictBox.className = "verdict-box";

  if (yourSum === 0 && theirSum === 0) {
    verdictBox.innerText = "Equal Trade";
    verdictBox.classList.add("verdict-fair");
  } else if (Math.abs(diff) <= 0.5) {
    verdictBox.innerText = "Fair Trade ⚖️";
    verdictBox.classList.add("verdict-fair");
  } else if (diff > 0.5) {
    verdictBox.innerText = `BIG WIN (+${diff.toFixed(2)}m) 🚀`;
    verdictBox.classList.add("verdict-win");
  } else {
    verdictBox.innerText = `LOSE (${diff.toFixed(2)}m) 🛑`;
    verdictBox.classList.add("verdict-loss");
  }
}

// Inicializar al cargar
document.addEventListener("DOMContentLoaded", () => {
  renderItemsGrid(items);
});
