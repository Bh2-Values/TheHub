const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ActivityType } = require('discord.js');
const fetch = require('node-fetch');
const vm = require('vm');
const http = require('http');
const mongoose = require('mongoose');

// --- SERVIDOR HTTP PARA RENDER ---
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running and alive!\n');
});

server.listen(PORT, () => {
  console.log(`Servidor HTTP escuchando en el puerto ${PORT}`);
});
// ---------------------------------

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const BOT_TOKEN = process.env.DISCORD_TOKEN;
const MONGO_URI = process.env.MONGO_URI; 
const SCRIPT_URL = "https://raw.githubusercontent.com/BH2-Values/TheHub/main/script.js";

// IDs autorizadas para dar y quitar monedas
const ADMIN_IDS = ['597454574302920716', '689866741702197298'];

// --- CONEXIÓN A MONGODB ---
if (!MONGO_URI) {
  console.log("⚠️ ADVERTENCIA: No se ha configurado la variable MONGO_URI. Las monedas se perderán al reiniciar.");
} else {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('📦 Conectado a MongoDB Atlas con éxito (Datos persistentes)'))
    .catch(err => console.error('❌ Error al conectar a MongoDB:', err));
}

// Esquema de la economía para MongoDB
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  tokens: { type: Number, default: 0 }
});
const UserEconomy = mongoose.model('UserEconomy', userSchema);

async function getUserBalance(userId) {
  let user = await UserEconomy.findOne({ userId });
  if (!user) {
    user = new UserEconomy({ userId, tokens: 0 });
    await user.save();
  }
  return user;
}

const workCooldowns = new Map();
const crimeCooldowns = new Map();
const gambleCooldowns = new Map();

client.on('ready', () => {
  console.log(`Values Bot is now online as ${client.user.tag}`);
  
  client.user.setPresence({
    activities: [{ name: 'BH2 Value List | !value', type: ActivityType.Playing }],
    status: 'online',
  });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const args = message.content.trim().split(/ +/);
  const command = args[0].toLowerCase();
  const contentLower = message.content.toLowerCase();

  try {
    // --- COMANDO: !give (Solo Admins) ---
    if (command === '!give') {
      if (!ADMIN_IDS.includes(message.author.id)) {
        return message.reply("❌ No tienes permisos para usar este comando.");
      }

      const targetUser = message.mentions.users.first();
      const amount = parseInt(args[args.length - 1]);

      if (!targetUser || isNaN(amount) || amount <= 0) {
        return message.reply("❌ Uso correcto: `!give @usuario 500`");
      }

      let user = await getUserBalance(targetUser.id);
      user.tokens += amount;
      await user.save();

      const embedGive = new EmbedBuilder()
        .setTitle(`🪙 Tokens Added`)
        .setDescription(`Se han añadido **${amount.toLocaleString()} Tokens** a **${targetUser.username}**.\n\n💰 Nuevo balance: **${user.tokens.toLocaleString()} Tokens**`)
        .setColor(0x00FF66);

      return message.channel.send({ embeds: [embedGive] });
    }

    // --- COMANDO: !remove o !quitar (Solo Admins) ---
    if (command === '!remove' || command === '!quitar') {
      if (!ADMIN_IDS.includes(message.author.id)) {
        return message.reply("❌ No tienes permisos para usar este comando.");
      }

      const targetUser = message.mentions.users.first();
      const amount = parseInt(args[args.length - 1]);

      if (!targetUser || isNaN(amount) || amount <= 0) {
        return message.reply("❌ Uso correcto: `!remove @usuario 500` o `!quitar @usuario 500`");
      }

      let user = await getUserBalance(targetUser.id);
      user.tokens = Math.max(0, user.tokens - amount);
      await user.save();

      const embedRemove = new EmbedBuilder()
        .setTitle(`🪙 Tokens Removed`)
        .setDescription(`Se han retirado **${amount.toLocaleString()} Tokens** a **${targetUser.username}**.\n\n💰 Nuevo balance: **${user.tokens.toLocaleString()} Tokens**`)
        .setColor(0xFF0000);

      return message.channel.send({ embeds: [embedRemove] });
    }

    // --- COMANDO: !bal o !balance ---
    if (command === '!bal' || command === '!balance') {
      const targetUser = message.mentions.users.first() || message.author;
      const userData = await getUserBalance(targetUser.id);
      const userTokens = userData.tokens;

      const embedBal = new EmbedBuilder()
        .setTitle(`💰 Balance of ${targetUser.username}`)
        .setDescription(`They currently have **${userTokens.toLocaleString()} Tokens** in their wallet.`)
        .setColor(0xFFD700)
        .setThumbnail(targetUser.displayAvatarURL());

      if (targetUser.id === message.author.id) {
        embedBal.setDescription(`You currently have **${userTokens.toLocaleString()} Tokens** in your wallet.`);
      }

      return message.channel.send({ embeds: [embedBal] });
    }

    // --- COMANDO: !work ---
    if (command === '!work') {
      const userId = message.author.id;
      const cooldownTime = 3 * 60 * 1000;
      const now = Date.now();

      if (workCooldowns.has(userId)) {
        const expirationTime = workCooldowns.get(userId) + cooldownTime;
        if (now < expirationTime) {
          const timeLeft = expirationTime - now;
          const minutesLeft = Math.floor(timeLeft / (1000 * 60));
          const secondsLeft = Math.floor((timeLeft % (1000 * 60)) / 1000);
          return message.reply(`⏳ You are too tired to work! Please wait **${minutesLeft}m ${secondsLeft}s**.`);
        }
      }

      workCooldowns.set(userId, now);

      const jobs = [
        { name: 'Discord Janitor', earned: Math.floor(Math.random() * 300) + 100 },
        { name: 'Roblox Bug Tester', earned: Math.floor(Math.random() * 600) + 200 },
        { name: 'Professional Glazer', earned: Math.floor(Math.random() * 500) + 150 },
        { name: 'Lowball Trader', earned: Math.floor(Math.random() * 800) + 50 }
      ];

      const randomJob = jobs[Math.floor(Math.random() * jobs.length)];
      let user = await getUserBalance(userId);
      user.tokens += randomJob.earned;
      await user.save();

      const embedWork = new EmbedBuilder()
        .setTitle(`🛠️ Work Shift Completed!`)
        .setDescription(`You worked as a **${randomJob.name}** and earned **${randomJob.earned} Tokens**!`)
        .setColor(0x00FF66);

      return message.channel.send({ embeds: [embedWork] });
    }

    // --- COMANDO: !crime ---
    if (command === '!crime') {
      const userId = message.author.id;
      const cooldownTime = 3 * 60 * 1000;
      const now = Date.now();

      if (crimeCooldowns.has(userId)) {
        const expirationTime = crimeCooldowns.get(userId) + cooldownTime;
        if (now < expirationTime) {
          const timeLeft = expirationTime - now;
          const minutesLeft = Math.floor(timeLeft / (1000 * 60));
          const secondsLeft = Math.floor((timeLeft % (1000 * 60)) / 1000);
          return message.reply(`🚨 The police are still looking for you! Hide out for **${minutesLeft}m ${secondsLeft}s**.`);
        }
      }

      crimeCooldowns.set(userId, now);

      const crimes = [
        { success: true, text: 'You hacked a Roblox trading site and stole', amount: Math.floor(Math.random() * 1000) + 300 },
        { success: true, text: 'You pickpocketed a random lowballer and got', amount: Math.floor(Math.random() * 600) + 200 },
        { success: false, text: 'You got caught trying to steal limited items and had to pay a fine of', amount: Math.floor(Math.random() * 400) + 100 },
        { success: false, text: 'The police busted your illegal trading ring. You lost', amount: Math.floor(Math.random() * 500) + 150 }
      ];

      const randomCrime = crimes[Math.floor(Math.random() * crimes.length)];
      let user = await getUserBalance(userId);

      if (randomCrime.success) {
        user.tokens += randomCrime.amount;
        await user.save();
        const embedCrime = new EmbedBuilder()
          .setTitle(`🦹 Crime Successful!`)
          .setDescription(`${randomCrime.text} **${randomCrime.amount} Tokens**!`)
          .setColor(0x00FF66);
        return message.channel.send({ embeds: [embedCrime] });
      } else {
        user.tokens = Math.max(0, user.tokens - randomCrime.amount);
        await user.save();
        const embedCrimeFail = new EmbedBuilder()
          .setTitle(`🚔 Busted!`)
          .setDescription(`${randomCrime.text} **${randomCrime.amount} Tokens**!`)
          .setColor(0xFF0000);
        return message.channel.send({ embeds: [embedCrimeFail] });
      }
    }

    // --- COMANDO: !gamble ---
    if (command === '!gamble') {
      const userId = message.author.id;
      const cooldownTime = 5 * 1000;
      const now = Date.now();

      if (gambleCooldowns.has(userId)) {
        const expirationTime = gambleCooldowns.get(userId) + cooldownTime;
        if (now < expirationTime) {
          const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
          return message.reply(`⏳ Whoa, slow down! Wait **${timeLeft}s** before gambling again.`);
        }
      }

      let user = await getUserBalance(userId);
      if (user.tokens <= 0) {
        return message.reply("❌ You are completely broke! You need tokens to gamble. Use `!work` first.");
      }

      const userTokens = user.tokens;
      const betArg = args[1];

      if (!betArg) {
        return message.reply("❌ Please specify how much you want to gamble! Example: `!gamble 500` or `!gamble all`");
      }

      let betAmount = 0;
      if (betArg.toLowerCase() === 'all') {
        betAmount = userTokens;
      } else {
        betAmount = parseInt(betArg);
        if (isNaN(betAmount) || betAmount <= 0) {
          return message.reply("❌ Please enter a valid number of tokens to gamble.");
        }
      }

      if (betAmount > userTokens) {
        return message.reply(`❌ You don't have that many tokens! Your current balance is **${userTokens.toLocaleString()} Tokens**.`);
      }

      gambleCooldowns.set(userId, now);

      const hitJackpot = Math.random() < 0.001;
      if (hitJackpot) {
        const winnings = betAmount * 10;
        user.tokens += winnings;
        await user.save();
        const embedJackpot = new EmbedBuilder()
          .setTitle(`🎉 MEGA JACKPOT! 10X! 🎉`)
          .setDescription(`💎 UNBELIEVABLE! You hit the 0.1% jackpot! You risked **${betAmount.toLocaleString()} Tokens** and won **${winnings.toLocaleString()} Tokens**!\n\n💰 New Balance: **${user.tokens.toLocaleString()} Tokens**`)
          .setColor(0xFFD700);
        return message.channel.send({ embeds: [embedJackpot] });
      }

      const win = Math.random() < 0.5;
      if (win) {
        const winnings = betAmount;
        user.tokens += winnings;
        await user.save();
        const embedWin = new EmbedBuilder()
          .setTitle(`🎲 Casino Royale - WIN!`)
          .setDescription(`🎉 Luck was on your side! You risked **${betAmount.toLocaleString()} Tokens** and won **${winnings.toLocaleString()} Tokens**!\n\n💰 New Balance: **${user.tokens.toLocaleString()} Tokens**`)
          .setColor(0x00FF66);
        return message.channel.send({ embeds: [embedWin] });
      } else {
        user.tokens -= betAmount;
        await user.save();
        const embedLose = new EmbedBuilder()
          .setTitle(`🎲 Casino Royale - LOSE!`)
          .setDescription(`💸 Oof! The house always wins. You lost your bet of **${betAmount.toLocaleString()} Tokens**.\n\n💰 New Balance: **${user.tokens.toLocaleString()} Tokens**`)
          .setColor(0xFF0000);
        return message.channel.send({ embeds: [embedLose] });
      }
    }

    // --- COMANDO: !leader ---
    if (command === '!leader') {
      const allUsers = await UserEconomy.find().sort({ tokens: -1 });
      if (allUsers.length === 0) {
        return message.reply("❌ No one has earned any tokens yet! Use `!work` to start.");
      }

      const userIndex = allUsers.findIndex(u => u.userId === message.author.id);
      const userRank = userIndex !== -1 ? `${userIndex + 1}º` : 'Unranked';

      const top10 = allUsers.slice(0, 10);
      let description = '';

      for (let i = 0; i < top10.length; i++) {
        const data = top10[i];
        let username = `User_${data.userId.slice(-4)}`;
        try {
          const user = await client.users.fetch(data.userId);
          username = user.username;
        } catch (e) {}

        description += `**${i + 1}.** \`${username}\` • 🪙 **${data.tokens.toLocaleString()}**\n`;
      }

      const embedLeader = new EmbedBuilder()
        .setAuthor({ name: 'Leaderboard', iconURL: client.user.displayAvatarURL() })
        .setDescription(description)
        .setColor(0x0099FF)
        .setFooter({ text: `Your leaderboard rank: ${userRank}` });

      return message.channel.send({ embeds: [embedLeader] });
    }

    // --- COMANDO: !value ---
    if (contentLower.startsWith('!value')) {
      const mentionedUser = message.mentions.users.first();

      if (mentionedUser) {
        const categories = ['Certified Clown 🤡', 'Professional Beggar', 'Lowballer Final Boss', 'Midwit NPC'];
        const statuses = ['Will Scam You ⚠️', 'Broke AF 💸', 'Zero Braincells 🧠'];
        const descriptions = ['You are like a broken pencil—totally pointless.', 'Bro thinks he is the main character 💀'];

        const fakePrice = (Math.random() * 50000).toFixed(0);
        const valueM = (Math.random() * 100).toFixed(1);
        
        const embedValorar = new EmbedBuilder()
          .setTitle(`📊 Market Appraisal: ${mentionedUser.username}`)
          .setDescription(`*${descriptions[Math.floor(Math.random() * descriptions.length)]}*`)
          .setColor(0xFF0055)
          .setThumbnail(mentionedUser.displayAvatarURL({ dynamic: true, size: 256 }))
          .addFields(
            { name: '💰 Estimated Value', value: `**${fakePrice} Tokens** (${valueM}m)`, inline: true },
            { name: '🏷️ Category', value: categories[Math.floor(Math.random() * categories.length)], inline: true },
            { name: '📊 Status', value: statuses[Math.floor(Math.random() * statuses.length)], inline: true }
          );

        return message.channel.send({ embeds: [embedValorar] });
      }

      const query = contentLower.slice(6).trim();
      if (!query) return message.reply("❌ Please provide an item name or mention a user!");

      const res = await fetch(SCRIPT_URL);
      const text = await res.text();

      const match = text.match(/const items = (\[[\s\S]*?\]);/);
      if (!match) return message.reply("Could not parse the database array.");

      const context = {};
      vm.createContext(context);
      vm.runInContext(`items = ${match[1]}`, context);
      const items = context.items;

      const foundItem = items.find(i => i.name && i.name.toLowerCase().includes(query));
      if (!foundItem) {
        return message.reply(`❌ Could not find any item matching "${query}".`);
      }

      const embed = new EmbedBuilder()
        .setTitle(`💎 ${foundItem.name}`)
        .setColor(0x00FF66)
        .addFields(
          { name: '💰 Price / Value', value: `**${foundItem.price ?? 'N/A'}** (${foundItem.value ?? 'N/Map'}m)`, inline: true },
          { name: '🏷️ Category', value: foundItem.category ?? 'N/A', inline: true },
          { name: '📊 Status', value: foundItem.status ?? 'N/A', inline: true }
        );

      if (foundItem.image) {
        const imageUrl = foundItem.image.startsWith('http') 
          ? foundItem.image 
          : `https://bh2-values.github.io/TheHub/${foundItem.image}`;
        embed.setThumbnail(imageUrl);
      }

      embed.setFooter({ text: 'BH2 Value List & Calculator', iconURL: 'https://bh2-values.github.io/TheHub/images/favicon.png' });
      return message.channel.send({ embeds: [embed] });
    }

  } catch (err) {
    console.error("Error ejecutando comando:", err);
    return message.reply("❌ Hubo un error interno al ejecutar este comando.").catch(() => {});
  }
});

client.login(BOT_TOKEN);
