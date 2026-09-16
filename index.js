const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');
const fetch = require('node-fetch');
const vm = require('vm');
const http = require('http');

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

  // --- COMANDO: !value (si menciona a alguien, tasa a la persona; si pone texto, busca el ítem) ---
  if (contentLower.startsWith('!value')) {
    const mentionedUser = message.mentions.users.first();

    // Si el usuario puso una mención al lado de !value, hacemos la tarjeta graciosa
    if (mentionedUser) {
      const categories = ['Server NPC', 'Whale', 'Professional Troll', 'Black Market Scam Artist', 'Tryhard', 'AFK Collector'];
      const statuses = ['Overvalued 📉', 'On Sale 🏷️', 'Priceless 💎', 'Bankrupt 💸', 'Duplicated ⚠️'];
      
      // Frases gamberras y divertidas para la descripción superior
      const descriptions = [
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

    // Si no menciona a nadie, funciona normal para buscar ítems
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

    const categories = ['Server NPC', 'Whale', 'Professional Troll', 'Black Market Scam Artist', 'Tryhard', 'AFK Collector'];
    const statuses = ['Overvalued 📉', 'On Sale 🏷️', 'Priceless 💎', 'Bankrupt 💸', 'Duplicated ⚠️'];
    const descriptions = [
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
