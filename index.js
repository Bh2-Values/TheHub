const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');
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

// Mapa para controlar los cooldowns (guardará el timestamp de cuándo pueden volver a trabajar)
const workCooldowns = new Map();

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

  // --- COMANDO: !bal o !balance (Ver dinero) ---
  if (contentLower === '!bal' || contentLower === '!balance') {
    let economy = {};
    if (fs.existsSync('economy.json')) {
      economy = JSON.parse(fs.readFileSync('economy.json', 'utf8'));
    }

    const userId = message.author.id;
    const userTokens = economy[userId] ? economy[userId].tokens : 0;

    const embedBal = new EmbedBuilder()
      .setTitle(`💰 Balance of ${message.author.username}`)
      .setDescription(`You currently have **${userTokens} Tokens** in your wallet.`)
      .setColor(0xFFD700)
      .setThumbnail(message.author.displayAvatarURL());

    return message.channel.send({ embeds: [embedBal] });
  }

  // --- COMANDO: !work (Ganar tokens trabajando con 15 min de cooldown) ---
  if (contentLower === '!work') {
    const userId = message.author.id;
    const cooldownTime = 15 * 60 * 1000; // 15 minutos en milisegundos
    const now = Date.now();

    // Comprobar si el usuario está en cooldown
    if (workCooldowns.has(userId)) {
      const expirationTime = workCooldowns.get(userId) + cooldownTime;

      if (now < expirationTime) {
        const timeLeft = expirationTime - now;
        const minutesLeft = Math.floor(timeLeft / (1000 * 60));
        const secondsLeft = Math.floor((timeLeft % (1000 * 60)) / 1000);

        return message.reply(`⏳ Whoa there! You are too tired to work again. Please wait **${minutesLeft}m ${secondsLeft}s** before working again.`);
      }
    }

    // Si pasa el cooldown, guardamos el tiempo actual
    workCooldowns.set(userId, now);

    let economy = {};
    if (fs.existsSync('economy.json')) {
      economy = JSON.parse(fs.readFileSync('economy.json', 'utf8'));
    }
    
    // Inicializar al usuario si no existe
    if (!economy[userId]) {
      economy[userId] = { tokens: 0 };
    }

    // Trabajos graciosos aleatorios
    const jobs = [
      { name: 'Discord Janitor', earned: Math.floor(Math.random() * 300) + 100 },
      { name: 'Roblox Bug Tester', earned: Math.floor(Math.random() * 600) + 200 },
      { name: 'Professional Glazer', earned: Math.floor(Math.random() * 500) + 150 },
      { name: 'Lowball Trader', earned: Math.floor(Math.random() * 800) + 50 }
    ];

    const randomJob = jobs[Math.floor(Math.random() * jobs.length)];

    // Sumar los tokens
    economy[userId].tokens += randomJob.earned;

    // Guardar en el archivo economy.json
    fs.writeFileSync('economy.json', JSON.stringify(economy, null, 2));

    const embedWork = new EmbedBuilder()
      .setTitle(`🛠️ Work Shift Completed!`)
      .setDescription(`You worked as a **${randomJob.name}** and earned **${randomJob.earned} Tokens**!`)
      .setColor(0x00FF66)
      .setFooter({ text: `Cooldown: 15 minutes before next shift.` });

    return message.channel.send({ embeds: [embedWork] });
  }

  // --- COMANDO: !value (si menciona a alguien, tasa a la persona; si pone texto, busca el ítem) ---
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
