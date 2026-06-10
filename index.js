require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, REST, Routes } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const commands = [
  new SlashCommandBuilder()
.setName('ping')
.setDescription('Test l\'bot wach khdam'),

  new SlashCommandBuilder()
.setName('help')
.setDescription('Chouf les commandes kamlin'),

  new SlashCommandBuilder()
.setName('avatar')
.setDescription('Chouf l\'avatar dyal chi 7ed')
.addUserOption(option =>
      option.setName('user')
.setDescription('Chouf l\'avatar dyal had l\'user')
.setRequired(false)
    ),

  new SlashCommandBuilder()
.setName('userinfo')
.setDescription('Ma3loumat 3la chi user')
.addUserOption(option =>
      option.setName('user')
.setDescription('L\'user li bghiti')
.setRequired(false)
    ),

  new SlashCommandBuilder()
.setName('serverinfo')
.setDescription('Ma3loumat 3la had server'),

  new SlashCommandBuilder()
.setName('say')
.setDescription('Khlli l\'bot y3awed hadra')
.addStringOption(option =>
      option.setName('message')
.setDescription('L\'message li bghiti l\'bot y9oulou')
.setRequired(true)
    ),

  new SlashCommandBuilder()
.setName('ban')
.setDescription('Banni chi 7ed men server')
.addUserOption(option =>
      option.setName('user')
.setDescription('L\'user li bghiti tbannih')
.setRequired(true)
    )
.addStringOption(option =>
      option.setName('reason')
.setDescription('3lach bannitih')
.setRequired(false)
    )
.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder()
.setName('kick')
.setDescription('Jri 3la chi 7ed men server')
.addUserOption(option =>
      option.setName('user')
.setDescription('L\'user li bghiti t\'kickih')
.setRequired(true)
    )
.addStringOption(option =>
      option.setName('reason')
.setDescription('3lach kickitih')
.setRequired(false)
    )
.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  new SlashCommandBuilder()
.setName('clear')
.setDescription('Mse7 chi 3adad dyal messages')
.addIntegerOption(option =>
      option.setName('amount')
.setDescription('Ch7al men message bghiti tmse7 - max 100')
.setRequired(true)
.setMinValue(1)
.setMaxValue(100)
    )
.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder()
.setName('meme')
.setDescription('Jib meme random')
];

client.once('clientReady', async () => {
  console.log(`Bot connecté: ${client.user.tag}`);
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('Slash commands tsjelou!');
  } catch (error) {
    console.error(error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    const sent = await interaction.reply({ content: '🏓 Pong!', fetchReply: true });
    const ping = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(`🏓 Pong! \nBot Latency: ${ping}ms \nAPI Latency: ${Math.round(client.ws.ping)}ms`);
  }

  if (interaction.commandName === 'help') {
    const embed = new EmbedBuilder()
.setColor('#0099ff')
.setTitle('📋 Commandes disponibles')
.addFields(
        { name: '🏓 /ping', value: 'Test l\'bot w chouf latency' },
        { name: '❓ /help', value: 'Had l\'liste' },
        { name: '🖼️ /avatar', value: 'Chouf l\'avatar dyal user' },
        { name: '👤 /userinfo', value: 'Ma3loumat 3la user' },
        { name: '🏠 /serverinfo', value: 'Ma3loumat 3la server' },
        { name: '💬 /say', value: 'Khlli l\'bot y3awed hadra' },
        { name: '🔨 /ban', value: 'Banni chi 7ed - admin only' },
        { name: '👢 /kick', value: 'Jri 3la chi 7ed - admin only' },
        { name: '🧹 /clear', value: 'Mse7 messages - admin only' },
        { name: '😂 /meme', value: 'Jib meme random' }
      );
    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'avatar') {
    const user = interaction.options.getUser('user') || interaction.user;
    const embed = new EmbedBuilder()
.setColor('#0099ff')
.setTitle(`Avatar dyal ${user.username}`)
.setImage(user.displayAvatarURL({ size: 1024 }));
    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'userinfo') {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id);
    const embed = new EmbedBuilder()
.setColor('#0099ff')
.setTitle(`Ma3loumat dyal ${user.username}`)
.setThumbnail(user.displayAvatarURL())
.addFields(
        { name: 'Tag', value: user.tag, inline: true },
        { name: 'ID', value: user.id, inline: true },
        { name: "Compte t'crea f", value: `<t:${parseInt(user.createdTimestamp / 1000)}:R>`, inline: false },
        { name: "Dkhel l'server f", value: `<t:${parseInt(member.joinedTimestamp / 1000)}:R>`, inline: false },
        { name: 'Roles', value: member.roles.cache.map(r => r).join(' ') || 'Walo' }
      );
    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'serverinfo') {
    const guild = interaction.guild;
    const embed = new EmbedBuilder()
.setColor('#0099ff')
.setTitle(`Ma3loumat dyal ${guild.name}`)
.setThumbnail(guild.iconURL())
.addFields(
        { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'Members', value: `${guild.memberCount}`, inline: true },
        { name: "T'crea f", value: `<t:${parseInt(guild.createdTimestamp / 1000)}:R>`, inline: false },
        { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
        { name: 'Boost Level', value: `${guild.premiumTier}`, inline: true }
      );
    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'say') {
    const message = interaction.options.getString('message');
    await interaction.reply({ content: 'Safi!', ephemeral: true });
    await interaction.channel.send(message);
  }

  if (interaction.commandName === 'ban') {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Ma 3tach reason';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) return interaction.reply({ content: 'Ma l9itch had l\'user f server', ephemeral: true });
    if (!member.bannable) return interaction.reply({ content: 'Ma n9derch nbanni had l\'user', ephemeral: true });

    await member.ban({ reason });
    await interaction.reply(`🔨 ${user.tag} tbanna. Reason: ${reason}`);
  }

  if (interaction.commandName === 'kick') {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Ma 3tach reason';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) return interaction.reply({ content: 'Ma l9itch had l\'user f server', ephemeral: true });
    if (!member.kickable) return interaction.reply({ content: 'Ma n9derch n\'kicki had l\'user', ephemeral: true });

    await member.kick(reason);
    await interaction.reply(`👢 ${user.tag} tkicka. Reason: ${reason}`);
  }

  if (interaction.commandName === 'clear') {
    const amount = interaction.options.getInteger('amount');
    await interaction.channel.bulkDelete(amount, true);
    await interaction.reply({ content: `🧹 Mse7t ${amount} messages!`, ephemeral: true });
  }

  if (interaction.commandName === 'meme') {
    await interaction.deferReply();
    const res = await fetch('https://meme-api.com/gimme');
    const data = await res.json();
    const embed = new EmbedBuilder()
.setColor('#0099ff')
.setTitle(data.title)
.setImage(data.url)
.setFooter({ text: `r/${data.subreddit}` });
    await interaction.editReply({ embeds: [embed] });
  }
});

client.login('hot token dyalk awldi ');