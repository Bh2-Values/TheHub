const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ActivityType } = require('discord.js');
const fetch = require('node-fetch');
const vm = require('vm');
const http = require('http');
const fs = require('fs');

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
const SCRIPT_URL = "https://raw.githubusercontent.com/BH2-Values/TheHub/main/script.js";

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

  // --- COMANDO: !bal o !balance ---
  if (command === '!bal' || command === '!balance') {
    let economy = {};
    if (fs.existsSync('economy.json')) {
      economy = JSON.parse(fs.readFileSync('economy.json', 'utf8'));
    }

    const targetUser = message.mentions.users.first() || message.author;
    const userId = targetUser.id;
    const userTokens = economy[userId] ? economy[userId].tokens : 0;

    const embedBal = new EmbedBuilder()
      .setTitle(`💰 Balance of ${targetUser.username}`)
      .setDescription(`They currently have **${userTokens} Tokens** in their wallet.`)
      .setColor(0xFFD700)
      .setThumbnail(targetUser.displayAvatarURL());

    if (targetUser.id === message.author.id) {
      embedBal.setDescription(`You currently have **${userTokens} Tokens** in their wallet.`.replace('their', 'your'));
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

    let economy = {};
    if (fs.existsSync('economy.json')) {
      economy = JSON.parse(fs.readFileSync('economy.json', 'utf8'));
    }
    
    if (!economy[userId]) {
      economy[userId] = { tokens: 0 };
    }

    const jobs = [
      { name: 'Discord Janitor', earned: Math.floor(Math.random() * 300) + 100 },
      { name: 'Roblox Bug Tester', earned: Math.floor(Math.random() * 600) + 200 },
      { name: 'Professional Glazer', earned: Math.floor(Math.random() * 500) + 150 },
      { name: 'Lowball Trader', earned: Math.floor(Math.random() * 800) + 50 }
    ];

    const randomJob = jobs[Math.floor(Math.random() * jobs.length)];
    economy[userId].tokens += randomJob.earned;
    fs.writeFileSync('economy.json', JSON.stringify(economy, null, 2));

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

    let economy = {};
    if (fs.existsSync('economy.json')) {
      economy = JSON.parse(fs.readFileSync('economy.json', 'utf8'));
    }
    
    if (!economy[userId]) {
      economy[userId] = { tokens: 0 };
    }

    const crimes = [
      { success: true, text: 'You hacked a Roblox trading site and stole', amount: Math.floor(Math.random() * 1000) + 300 },
      { success: true, text: 'You pickpocketed a random lowballer and got', amount: Math.floor(Math.random() * 600) + 200 },
      { success: false, text: 'You got caught trying to steal limited items and had to pay a fine of', amount: Math.floor(Math.random() * 400) + 100 },
      { success: false, text: 'The police busted your illegal trading ring. You lost', amount: Math.floor(Math.random() * 500) + 150 }
    ];

    const randomCrime = crimes[Math.floor(Math.random() * crimes.length)];

    if (randomCrime.success) {
      economy[userId].tokens += randomCrime.amount;
      fs.writeFileSync('economy.json', JSON.stringify(economy, null, 2));

      const embedCrime = new EmbedBuilder()
        .setTitle(`🦹 Crime Successful!`)
        .setDescription(`${randomCrime.text} **${randomCrime.amount} Tokens**!`)
        .setColor(0x00FF66);
      return message.channel.send({ embeds: [embedCrime] });
    } else {
      economy[userId].tokens = Math.max(0, economy[userId].tokens - randomCrime.amount);
      fs.writeFileSync('economy.json', JSON.stringify(economy, null, 2));

      const embedCrimeFail = new EmbedBuilder()
        .setTitle(`🚔 Busted!`)
        .setDescription(`${randomCrime.text} **${randomCrime.amount} Tokens**!`)
        .setColor(0xFF0000);
      return message.channel.send({ embeds: [embedCrimeFail] });
    }
  }

  // --- COMANDO: !gamble (5s cooldown, 50/50 y Jackpot 0.1% de 10x) ---
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

    let economy = {};
    if (fs.existsSync('economy.json')) {
      economy = JSON.parse(fs.readFileSync('economy.json', 'utf8'));
    }

    if (!economy[userId] || economy[userId].tokens <= 0) {
      return message.reply("❌ You are completely broke! You need tokens to gamble. Use `!work` first.");
    }

    const userTokens = economy[userId].tokens;
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
      return message.reply(`❌ You don't have that many tokens! Your current balance is **${userTokens} Tokens**.`);
    }

    gambleCooldowns.set(userId, now);

    const hitJackpot = Math.random() < 0.001;

    if (hitJackpot) {
      const winnings = betAmount * 10;
      economy[userId].tokens += winnings;
      fs.writeFileSync('economy.json', JSON.stringify(economy, null, 2));

      const embedJackpot = new EmbedBuilder()
        .setTitle(`🎉 MEGA JACKPOT! 10X! 🎉`)
        .setDescription(`💎 UNBELIEVABLE! You hit the 0.1% jackpot! You risked **${betAmount} Tokens** and won **${winnings} Tokens**!\n\n💰 New Balance: **${economy[userId].tokens} Tokens**`)
        .setColor(0xFFD700);
      return message.channel.send({ embeds: [embedJackpot] });
    }

    const win = Math.random() < 0.5;

    if (win) {
      const winnings = betAmount;
      economy[userId].tokens += winnings;
      fs.writeFileSync('economy.json', JSON.stringify(economy, null, 2));

      const embedWin = new EmbedBuilder()
        .setTitle(`🎲 Casino Royale - WIN!`)
        .setDescription(`🎉 Luck was on your side! You risked **${betAmount} Tokens** and won **${winnings} Tokens**!\n\n💰 New Balance: **${economy[userId].tokens} Tokens**`)
        .setColor(0x00FF66);
      return message.channel.send({ embeds: [embedWin] });
    } else {
      economy[userId].tokens -= betAmount;
      fs.writeFileSync('economy.json', JSON.stringify(economy, null, 2));

      const embedLose = new EmbedBuilder()
        .setTitle(`🎲 Casino Royale - LOSE!`)
        .setDescription(`💸 Oof! The house always wins. You lost your bet of **${betAmount} Tokens**.\n\n💰 New Balance: **${economy[userId].tokens} Tokens**`)
        .setColor(0xFF0000);
      return message.channel.send({ embeds: [embedLose] });
    }
  }

  // --- COMANDO: !blackjack o !bj (Juego interactivo con botones) ---
  if (command === '!blackjack' || command === '!bj') {
    const userId = message.author.id;
    let economy = {};
    if (fs.existsSync('economy.json')) {
      economy = JSON.parse(fs.readFileSync('economy.json', 'utf8'));
    }

    if (!economy[userId] || economy[userId].tokens <= 0) {
      return message.reply("❌ You are broke! You need tokens to play Blackjack. Use `!work` first.");
    }

    const userTokens = economy[userId].tokens;
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
      return message.reply(`❌ You don't have enough tokens! Your balance is **${userTokens} Tokens**.`);
    }

    // Baraja y lógica de cartas
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

    // Comprobación de Blackjack natural instantáneo
    if (initialPlayerScore === 21) {
      const winnings = Math.floor(betAmount * 1.5);
      economy[userId].tokens += winnings;
      fs.writeFileSync('economy.json', JSON.stringify(economy, null, 2));

      const embedBJ = new EmbedBuilder()
        .setTitle(`🃏 Blackjack!`)
        .setDescription(`🎉 **Natural Blackjack!** You won **${winnings} Tokens**!\n\n**Your Hand:** ${playerHand.map(c => c.display).join(' ')} (21)\n**Dealer Hand:** ${dealerHand.map(c => c.display).join(' ')} (${initialDealerScore})\n\n💰 Balance: **${economy[userId].tokens} Tokens**`)
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
      .setFooter({ text: `Bet: ${betAmount} Tokens` });

    const gameMessage = await message.channel.send({ embeds: [embedGame], components: [row] });

    const collector = gameMessage.createMessageComponentCollector({
      filter: i => i.user.id === message.author.id,
      time: 60000
    });

    collector.on('collect', async i => {
      if (i.customId === 'bj_hit') {
        playerHand.push(drawCard());
        const playerScore = calculateHand(playerHand);

        if (playerScore > 21) {
          economy[userId].tokens -= betAmount;
          fs.writeFileSync('economy.json', JSON.stringify(economy, null, 2));
          collector.stop('bust');

          const embedBust = new EmbedBuilder()
            .setTitle(`🃏 Blackjack - BUST!`)
            .setDescription(`💥 You went over 21 and busted! You lost **${betAmount} Tokens**.\n\n**Your Hand:** ${playerHand.map(c => c.display).join(' ')} (${playerScore})\n\n💰 Balance: **${economy[userId].tokens} Tokens**`)
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
          .setFooter({ text: `Bet: ${betAmount} Tokens` });

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
          economy[userId].tokens += betAmount;
          resultText = `🎉 You won **${betAmount} Tokens**!`;
          color = 0x00FF66;
        } else if (playerScore < dealerScore) {
          economy[userId].tokens -= betAmount;
          resultText = `💸 Dealer wins! You lost **${betAmount} Tokens**`;
          color = 0xFF0000;
        } else {
          resultText = `🤝 Push! It's a tie, your money is back.`;
          color = 0xFFD700;
        }

        fs.writeFileSync('economy.json', JSON.stringify(economy, null, 2));

        const embedEnd = new EmbedBuilder()
          .setTitle(`🃏 Blackjack - Result`)
          .setDescription(`${resultText}\n\n**Your Hand:** ${playerHand.map(c => c.display).join(' ')} (${playerScore})\n**Dealer Hand:** ${dealerHand.map(c => c.display).join(' ')} (${dealerScore})\n\n💰 Balance: **${economy[userId].tokens} Tokens**`)
          .setColor(color);

        return i.update({ embeds: [embedEnd], components: [] });
      }
    });

    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        economy[userId].tokens -= betAmount;
        fs.writeFileSync('economy.json', JSON.stringify(economy, null, 2));
        const embedTimeout = new EmbedBuilder()
          .setTitle(`🃏 Blackjack - Timeout`)
          .setDescription(`⏳ You took too long to play! Hand forfeited, lost **${betAmount} Tokens**.`)
          .setColor(0xFF0000);
        gameMessage.edit({ embeds: [embedTimeout], components: [] }).catch(() => {});
      }
    });
  }

  // --- COMANDO: !leader ---
  if (command === '!leader') {
    let economy = {};
    if (fs.existsSync('economy.json')) {
      economy = JSON.parse(fs.readFileSync('economy.json', 'utf8'));
    }

    const sortedUsers = Object.entries(economy)
      .sort((a, b) => b[1].tokens - a[1].tokens)
      .slice(0, 10);

    if (sortedUsers.length === 0) {
      return message.reply("❌ No one has earned any tokens yet! Use `!work` to start.");
    }

    let description = '';
    for (let i = 0; i < sortedUsers.length; i++) {
      const [id, data] = sortedUsers[i];
      let username = `User ID: ${id}`;
      try {
        const user = await client.users.fetch(id);
        username = user.username;
      } catch (e) {}

      const medals = ['🥇', '🥈', '🥉'];
      const rankBadge = medals[i] || `\`#${i + 1}\``;
      description += `${rankBadge} **${username}** — **${data.tokens} Tokens**\n`;
    }

    const embedLeader = new EmbedBuilder()
      .setTitle(`🏆 Server Wealth Leaderboard`)
      .setDescription(description)
      .setColor(0xFFD700)
      .setFooter({ text: 'Top richest traders in the server' });

    return message.channel.send({ embeds: [embedLeader] });
  }

  // --- COMANDO: !value ---
  if (contentLower.startsWith('!value')) {
    const mentionedUser = message.mentions.users.first();

    if (mentionedUser) {
      const categories = [
        'Certified Clown 🤡', 
        'Professional Beggar', 
        'Lowballer Final Boss', 
        'Midwit NPC', 
        'Discord Mod in Training', 
        'E-Date Addict', 
        'Absolute Bot'
      ];
      
      const statuses = [
        'Will Scam You ⚠️', 
        'Broke AF 💸', 
        'Zero Braincells 🧠', 
        'Glazing Hard 🧽', 
        'AFK & Useless 💤', 
        'Wanted by FBI 🚨'
      ];

      const descriptions = [
        'You bring everyone so much joy, especially when you leave a room.',
        'You are like a broken pencil—totally pointless.',
        'You are as useful as a screen door on a submarine.',
        'I look at you and think, “Two billion years of evolution, for this?”',
        'You have a face that would make onions cry.',
        'You are the human version of cramps.',
        'Let’s play horse. I’ll be the front, and you can be yourself.',
        'You just might be why the middle finger was invented in the first place.',
        'The people who tolerate you daily are the real heroes.',
        'You have your entire life to be an idiot. Why not take today off?',
        'Why are you rolling your eyes? Looking for your brain?',
        'Bro is worth less than a broken toothpick.',
        'Zero bitches detected, absolute negative value.',
        'Certified clown moment, do not trade.',
        'Absolute carry in games, total liability in real life.',
        'Pure waste of server bandwidth.',
        'Bro thinks he is the main character 💀',
        'Selling this guy for 2 robux, any offers?'
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
          { name: '💰 Price / Value', value: `**${foundItem.price ?? 'N/A'}** (${foundItem.value ?? 'N/A'}m)`, inline: true },
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

    const categories = [
      'Certified Clown 🤡', 
      'Professional Beggar', 
      'Lowballer Final Boss', 
      'Midwit NPC', 
      'Discord Mod in Training', 
      'E-Date Addict', 
      'Absolute Bot'
    ];
    
    const statuses = [
      'Will Scam You ⚠️', 
      'Broke AF 💸', 
      'Zero Braincells 🧠', 
      'Glazing Hard 🧽', 
      'AFK & Useless 💤', 
      'Wanted by FBI 🚨'
    ];

    const descriptions = [
      'You bring everyone so much joy, especially when you leave a room.',
      'You are like a broken pencil—totally pointless.',
      'You are as useful as a screen door on a submarine.',
      'I look at you and think, “Two billion years of evolution, for this?”',
      'You have a face that would make onions cry.',
      'You are the human version of cramps.',
      'Let’s play horse. I’ll be the front, and you can be yourself.',
      'You just might be why the middle finger was invented in the first place.',
      'The people who tolerate you daily are the real heroes.',
      'You have your entire life to be an idiot. Why not take today off?',
      'Why are you rolling your eyes? Looking for your brain?',
      'Bro is worth less than a broken toothpick.',
      'Zero bitches detected, absolute negative value.',
      'Certified clown moment, do not trade.',
      'Absolute carry in games, total liability in real life.',
      'Pure waste of server bandwidth.',
      'Bro thinks he is the main character 💀',
      'Selling this guy for 2 robux, any offers?'
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
});

client.login(BOT_TOKEN);
