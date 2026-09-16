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
    GatewayIntentBits.MessageContent
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

// Función auxiliar para obtener o crear el usuario en la BD
async function getUserBalance(userId) {
  let user = await UserEconomy.findOne({ userId });
  if (!user) {
    user = new UserEconomy({ userId, tokens: 0 });
    await user.save();
  }
  return user;
}

// Mapas para controlar los cooldowns
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

  const contentLower = message.content.toLowerCase();
  const args = message.content.trim().split(/ +/);
  const command = args[0].toLowerCase();

  // --- COMANDO: !give (Solo Admins) ---
  if (command === '!give') {
    if (!ADMIN_IDS.includes(message.author.id)) {
      return message.reply("❌ No tienes permisos para usar este comando.");
    }

    // Obtener usuario por mención directa o por ID pura en el argumento 1
    let targetUser = message.mentions.users.first();
    if (!targetUser && args[1]) {
      const cleanId = args[1].replace(/[^0-9]/g, '');
      try {
        targetUser = await client.users.fetch(cleanId);
      } catch (e) {
        targetUser = null;
      }
    }

    // La cantidad siempre será el último argumento convertido a número
    const amount = parseInt(args[args.length - 1]);

    if (!targetUser || isNaN(amount) || amount <= 0) {
      return message.reply("❌ Uso correcto: `!give @usuario 500` o `!give <ID> 500`");
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

    let targetUser = message.mentions.users.first();
    if (!targetUser && args[1]) {
      const cleanId = args[1].replace(/[^0-9]/g, '');
      try {
        targetUser = await client.users.fetch(cleanId);
      } catch (e) {
        targetUser = null;
      }
    }

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

  // --- COMANDO: !work (3 min cooldown) ---
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

  // --- COMANDO: !crime (3 min cooldown) ---
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

  // --- COMANDO: !blackjack o !bj ---
  if (command === '!blackjack' || command === '!bj') {
    const userId = message.author.id;
    let user = await getUserBalance(userId);

    if (user.tokens <= 0) {
      return message.reply("❌ You are broke! You need tokens to play Blackjack. Use `!work` first.");
    }

    const userTokens = user.tokens;
    const betArg = args[1];

    if (!betArg) {
      return message.reply("❌ Please specify your bet! Example: `!bj 100` or `!bj all`");
    }

    let betAmount = 0;
    if (betArg.toLowerCase() === 'all') {
      betAmount = userTokens;
    } else {
      betAmount = parseInt(betArg);
      if (isNaN(betAmount) || betAmount <= 0) {
        return message.reply("❌ Please enter a valid number of tokens.");
      }
    }

    if (betAmount > userTokens) {
      return message.reply(`❌ You don't have enough tokens! Your balance is **${userTokens.toLocaleString()} Tokens**.`);
    }

    const suits = ['♠️', '♥️', '♦️', '♣️'];
    const values = [
      { name: '2', val: 2 }, { name: '3', val: 3 }, { name: '4', val: 4 }, 
      { name: '5', val: 5 }, { name: '6', val: 6 }, { name: '7', val: 7 }, 
      { name: '8', val: 8 }, { name: '9', val: 9 }, { name: '10', val: 10 }, 
      { name: 'J', val: 10 }, { name: 'Q', val: 10 }, { name: 'K', val: 10 }, 
      { name: 'A', val: 11 }
    ];

    function drawCard() {
      const s = suits[Math.floor(Math.random() * suits.length)];
      const v = values[Math.floor(Math.random() * values.length)];
      return { display: `${v.name}${s}`, val: v.val };
    }

    function calculateHand(hand) {
      let score = 0;
      let aces = 0;
      for (let card of hand) {
        score += card.val;
        if (card.val === 11) aces++;
      }
      while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
      }
      return score;
    }

    let playerHand = [drawCard(), drawCard()];
    let dealerHand = [drawCard(), drawCard()];

    const initialPlayerScore = calculateHand(playerHand);
    const initialDealerScore = calculateHand(dealerHand);

    if (initialPlayerScore === 21) {
      const winnings = Math.floor(betAmount * 1.5);
      user.tokens += winnings;
      await user.save();

      const embedBJ = new EmbedBuilder()
        .setTitle(`🃏 Blackjack!`)
        .setDescription(`🎉 **Natural Blackjack!** You won **${winnings.toLocaleString()} Tokens**!\n\n**Your Hand:** ${playerHand.map(c => c.display).join(' ')} (21)\n**Dealer Hand:** ${dealerHand.map(c => c.display).join(' ')} (${initialDealerScore})\n\n💰 Balance: **${user.tokens.toLocaleString()} Tokens**`)
        .setColor(0xFFD700);
      return message.channel.send({ embeds: [embedBJ] });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('bj_hit').setLabel('Hit').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('bj_stand').setLabel('Stand').setStyle(ButtonStyle.Success)
    );

    const embedGame = new EmbedBuilder()
      .setTitle(`🃏 Blackjack Table - ${message.author.username}`)
      .addFields(
        { name: 'Your Hand', value: `${playerHand.map(c => c.display).join(' ')} \n(Score: ${initialPlayerScore})`, inline: true },
        { name: 'Dealer Hand', value: `${dealerHand[0].display} ❓ \n(Score: ?)`, inline: true }
      )
      .setColor(0x0099FF)
      .setFooter({ text: `Bet: ${betAmount.toLocaleString()} Tokens` });

    const gameMessage = await message.channel.send({ embeds: [embedGame], components: [row] });

    const collector = gameMessage.createMessageComponentCollector({
      filter: i => i.user.id === message.author.id,
      time: 60000
    });

    collector.on('collect', async i => {
      let currentUser = await getUserBalance(userId);

      if (i.customId === 'bj_hit') {
        playerHand.push(drawCard());
        const playerScore = calculateHand(playerHand);

        if (playerScore > 21) {
          currentUser.tokens -= betAmount;
          await currentUser.save();
          collector.stop('bust');

          const embedBust = new EmbedBuilder()
            .setTitle(`🃏 Blackjack - BUST!`)
            .setDescription(`💥 You went over 21 and busted! You lost **${betAmount.toLocaleString()} Tokens**.\n\n**Your Hand:** ${playerHand.map(c => c.display).join(' ')} (${playerScore})\n\n💰 Balance: **${currentUser.tokens.toLocaleString()} Tokens**`)
            .setColor(0xFF0000);
          return i.update({ embeds: [embedBust], components: [] });
        }

        const updatedEmbed = new EmbedBuilder()
          .setTitle(`🃏 Blackjack Table - ${message.author.username}`)
          .addFields(
            { name: 'Your Hand', value: `${playerHand.map(c => c.display).join(' ')} \n(Score: ${playerScore})`, inline: true },
            { name: 'Dealer Hand', value: `${dealerHand[0].display} ❓ \n(Score: ?)`, inline: true }
          )
          .setColor(0x0099FF)
          .setFooter({ text: `Bet: ${betAmount.toLocaleString()} Tokens` });

        return i.update({ embeds: [updatedEmbed], components: [row] });
      }

      if (i.customId === 'bj_stand') {
        collector.stop('stand');
        let playerScore = calculateHand(playerHand);
        let dealerScore = calculateHand(dealerHand);

        while (dealerScore < 17) {
          dealerHand.push(drawCard());
          dealerScore = calculateHand(dealerHand);
        }

        let resultText = '';
        let color = 0x00FF66;

        if (dealerScore > 21 || playerScore > dealerScore) {
          currentUser.tokens += betAmount;
          resultText = `🎉 You won **${betAmount.toLocaleString()} Tokens**!`;
          color = 0x00FF66;
        } else if (playerScore < dealerScore) {
          currentUser.tokens -= betAmount;
          resultText = `💸 Dealer wins! You lost **${betAmount.toLocaleString()} Tokens**`;
          color = 0xFF0000;
        } else {
          resultText = `🤝 Push! It's a tie, your money is back.`;
          color = 0xFFD700;
        }

        await currentUser.save();

        const embedEnd = new EmbedBuilder()
          .setTitle(`🃏 Blackjack - Result`)
          .setDescription(`${resultText}\n\n**Your Hand:** ${playerHand.map(c => c.display).join(' ')} (${playerScore})\n**Dealer Hand:** ${dealerHand.map(c => c.display).join(' ')} (${dealerScore})\n\n💰 Balance: **${currentUser.tokens.toLocaleString()} Tokens**`)
          .setColor(color);

        return i.update({ embeds: [embedEnd], components: [] });
      }
    });

    collector.on('end', async (collected, reason) => {
      if (reason === 'time') {
        let currentUser = await getUserBalance(userId);
        currentUser.tokens -= betAmount;
        await currentUser.save();

        const embedTimeout = new EmbedBuilder()
          .setTitle(`🃏 Blackjack - Timeout`)
          .setDescription(`⏳ You took too long to play! Hand forfeited, lost **${betAmount.toLocaleString()} Tokens**.`)
          .setColor(0xFF0000);
        gameMessage.edit({ embeds: [embedTimeout], components: [] }).catch(() => {});
      }
    });
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
      const categories = [
        'Certified Clown 🤡', 'Professional Beggar', 'Lowballer Final Boss', 
        'Midwit NPC', 'Discord Mod in Training', 'E-Date Addict', 'Absolute Bot'
      ];
      const statuses = ['Will Scam You ⚠️', 'Broke AF 💸', 'Zero Braincells 🧠', 'Glazing Hard 🧽', 'AFK & Useless 💤', 'Wanted by FBI 🚨'];
      const descriptions = [
        'You bring everyone so much joy, especially when you leave a room.',
        'You are like a broken pencil—totally pointless.',
        'You are as useful as a screen door on a submarine.',
        'I look at you and think, “Two billion years of evolution, for this?”',
        'You have a face that would make onions cry.',
        'Bro is worth less than a broken toothpick.',
        'Zero bitches detected, absolute negative value.',
        'Certified clown moment, do not trade.'
      ];

      const fakePrice = (Math.random() * 50000).toFixed(0);
      const valueM = (Math.random() * 100).toFixed(1);
      
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];

      const embedValorar = new EmbedBuilder()
        .setTitle(`📊 Market Appraisal: ${mentionedUser.username}`)
        .setDescription(`*${randomDescription}*`)
        .setColor(0xFF0055)
        .setThumbnail(mentionedUser.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
          { name: '💰 Estimated Value', value: `**${fakePrice} Tokens** (${valueM}m)`, inline: true },
          { name: '🏷️ Category', value: randomCategory, inline: true },
          { name: '📊 Current Status', value: randomStatus, inline: true }
        )
        .setFooter({ text: `Appraised on request of ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

      return message.channel.send({ embeds: [embedValorar] });
    }

    const query = contentLower.slice(6).trim();
    if (!query) return message.reply("❌ Please provide an item name or mention a user!");

    try {
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

      message.channel.send({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      message.reply("An error occurred while checking the value.");
    }
  }

  // --- COMANDO EXTRA: !valorar ---
  if (contentLower.startsWith('!valorar')) {
    const mentionedUser = message.mentions.users.first();
    if (!mentionedUser) {
      return message.reply("❌ You must mention someone! Example: `!valorar @user`");
    }

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
        { name: '📊 Current Status', value: statuses[Math.floor(Math.random() * statuses.length)], inline: true }
      );

    return message.channel.send({ embeds: [embedValorar] });
  }
});

client.login(BOT_TOKEN);
