require('dotenv').config();
const {
  Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder,
  PermissionFlagsBits, REST, Routes
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// === BADDEL HADI B ID DYALEK ===
// Settings → Advanced → Developer Mode ON → Click limen 3la smiytek → Copy ID
const OWNER_ID = '1409329654501998747';

const commands = [
  // === BASIC ===
  new SlashCommandBuilder().setName('ping').setDescription('🏓 Chouf latency dyal bot'),
  new SlashCommandBuilder().setName('help').setDescription('❓ Chouf ga3 commands'),

  // === INFO 3ADIYIN ===
  new SlashCommandBuilder()
.setName('avatar')
.setDescription('🖼️ Jib avatar dyal chi 7ed')
.addUserOption(opt => opt.setName('user').setDescription('User li bghiti').setRequired(false)),

  new SlashCommandBuilder()
.setName('userinfo')
.setDescription('👤 Ma3loumat 3la user')
.addUserOption(opt => opt.setName('user').setDescription('User').setRequired(false)),

  new SlashCommandBuilder().setName('serverinfo').setDescription('🏠 Ma3loumat 3la server'),

  new SlashCommandBuilder().setName('membercount').setDescription('👥 Ch7al men 3adw f server'),

  new SlashCommandBuilder()
.setName('say')
.setDescription('💬 Khlli bot y3awed hadra')
.addStringOption(opt => opt.setName('message').setDescription('Message').setRequired(true)),

  // === MODERATION 3ADIYIN ===
  new SlashCommandBuilder()
.setName('clear')
.setDescription('🧹 Mse7 messages')
.addIntegerOption(opt => opt.setName('amount').setDescription('Ch7al 1-100').setRequired(true).setMinValue(1).setMaxValue(100))
.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder()
.setName('ban')
.setDescription('🔨 Banni chi 7ed men server')
.addUserOption(opt => opt.setName('user').setDescription('User li tbannih').setRequired(true))
.addStringOption(opt => opt.setName('reason').setDescription('3lach').setRequired(false))
.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder()
.setName('kick')
.setDescription('👢 Jri 3la chi 7ed men server')
.addUserOption(opt => opt.setName('user').setDescription('User li t\'kickih').setRequired(true))
.addStringOption(opt => opt.setName('reason').setDescription('3lach').setRequired(false))
.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  new SlashCommandBuilder()
.setName('timeout')
.setDescription('🔇 3ti timeout l chi 7ed')
.addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
.addIntegerOption(opt => opt.setName('minutes').setDescription('Ch7al men d9i9a 1-40320').setRequired(true).setMinValue(1).setMaxValue(40320))
.addStringOption(opt => opt.setName('reason').setDescription('3lach').setRequired(false))
.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder()
.setName('unban')
.setDescription('✅ 7iyed ban 3la chi 7ed')
.addStringOption(opt => opt.setName('userid').setDescription('ID dyal user li tbanna').setRequired(true))
.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  // === KHATAR - GHIR OWNER ===
  new SlashCommandBuilder().setName('banall').setDescription('💣 Banni GA3 members f server - KHATAR'),
  new SlashCommandBuilder().setName('nuke').setDescription('☢️ Mse7 server kamel channels + roles - KHATAR'),
  new SlashCommandBuilder()
.setName('massban')
.setDescription('🔨 Banni bzaf b IDs')
.addStringOption(opt => opt.setName('ids').setDescription('IDs dyal nass b fassila: 123,456,789').setRequired(true)),
];

client.once('clientReady', async () => {
  console.log(`✅ Bot connecté: ${client.user.tag}`);
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('✅ Slash commands tsjelou kamlin!');
  } catch (error) {
    console.error('Error:', error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // === 7MIYA DYAL KHATAR ===
  const DANGEROUS = ['banall', 'nuke', 'massban'];
  if (DANGEROUS.includes(interaction.commandName)) {
    if (interaction.user.id!== OWNER_ID && interaction.user.id!== interaction.guild.ownerId) {
      return interaction.reply({ content: '❌ Had command ghir l\'Owner dyal server', ephemeral: true });
    }
  }

  // === PING ===
  if (interaction.commandName === 'ping') {
    const sent = await interaction.reply({ content: '🏓 Pong!', fetchReply: true });
    const ping = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(`🏓 Pong!\n**Bot:** ${ping}ms\n**API:** ${Math.round(client.ws.ping)}ms`);
  }

  // === HELP ===
  if (interaction.commandName === 'help') {
    const embed = new EmbedBuilder()
  .setColor('#5865F2')
  .setTitle('📋 Ga3 Commands dyal Bot')
  .setDescription('Bot dyal moderation w info')
  .addFields(
      { name: 'ℹ️ INFO', value: '`/ping` `/help` `/avatar` `/userinfo` `/serverinfo` `/membercount` `/say`', inline: false },
      { name: '🔨 MODERATION', value: '`/clear` `/ban` `/kick` `/timeout` `/unban`', inline: false },
      { name: '💣 KHATAR - Owner Only', value: '`/banall` `/nuke` `/massban`\n**⚠️ Red balek! Ma kaynch undo**', inline: false }
    )
  .setFooter({ text: `Demandou: ${interaction.user.username}` })
  .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }

  // === AVATAR ===
  if (interaction.commandName === 'avatar') {
    const user = interaction.options.getUser('user') || interaction.user;
    const embed = new EmbedBuilder()
  .setColor('#0099ff')
  .setTitle(`🖼️ Avatar dyal ${user.username}`)
  .setImage(user.displayAvatarURL({ size: 1024 }))
  .setDescription(`[Link HD](${user.displayAvatarURL({ size: 1024 })})`);
    await interaction.reply({ embeds: [embed] });
  }

  // === USERINFO ===
  if (interaction.commandName === 'userinfo') {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id);
    const embed = new EmbedBuilder()
  .setColor('#0099ff')
  .setTitle(`👤 Ma3loumat dyal ${user.username}`)
  .setThumbnail(user.displayAvatarURL())
  .addFields(
      { name: 'Tag', value: user.tag, inline: true },
      { name: 'ID', value: user.id, inline: true },
      { name: 'Bot?', value: user.bot? 'Ah' : 'La', inline: true },
      { name: "Compte t'crea f", value: `<t:${parseInt(user.createdTimestamp / 1000)}:R>`, inline: false },
      { name: "Dkhel l'server f", value: `<t:${parseInt(member.joinedTimestamp / 1000)}:R>`, inline: false },
      { name: 'Roles', value: member.roles.cache.map(r => r).join(' ') || 'Walo', inline: false }
    );
    await interaction.reply({ embeds: [embed] });
  }

  // === SERVERINFO ===
  if (interaction.commandName === 'serverinfo') {
    const g = interaction.guild;
    const embed = new EmbedBuilder()
  .setColor('#0099ff')
  .setTitle(`🏠 ${g.name}`)
  .setThumbnail(g.iconURL())
  .addFields(
      { name: 'Owner', value: `<@${g.ownerId}>`, inline: true },
      { name: 'Members', value: `${g.memberCount}`, inline: true },
      { name: 'Boost Level', value: `${g.premiumTier}`, inline: true },
      { name: "T'crea f", value: `<t:${parseInt(g.createdTimestamp / 1000)}:R>`, inline: false },
      { name: 'Roles', value: `${g.roles.cache.size}`, inline: true },
      { name: 'Channels', value: `${g.channels.cache.size}`, inline: true },
      { name: 'Emojis', value: `${g.emojis.cache.size}`, inline: true }
    );
    await interaction.reply({ embeds: [embed] });
  }

  // === MEMBERCOUNT ===
  if (interaction.commandName === 'membercount') {
    const g = interaction.guild;
    const members = await g.members.fetch();
    const humans = members.filter(m =>!m.user.bot).size;
    const bots = members.filter(m => m.user.bot).size;
    await interaction.reply(`👥 **${g.memberCount}** members total\n👤 ${humans} humans\n🤖 ${bots} bots`);
  }

  // === SAY ===
  if (interaction.commandName === 'say') {
    const message = interaction.options.getString('message');
    await interaction.reply({ content: '✅ Siftha!', ephemeral: true });
    await interaction.channel.send(message);
  }

  // === CLEAR ===
  if (interaction.commandName === 'clear') {
    const amount = interaction.options.getInteger('amount');
    await interaction.channel.bulkDelete(amount, true);
    await interaction.reply({ content: `🧹 **Mse7t ${amount} messages!**`, ephemeral: true });
  }

  // === BAN ===
  if (interaction.commandName === 'ban') {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Ma 3tach reason';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ content: '❌ Ma l9itch had l\'user f server', ephemeral: true });
    if (!member.bannable) return interaction.reply({ content: '❌ Ma n9derch nbanni had l\'user. Role dyali na9s.', ephemeral: true });
    await member.ban({ reason });
    await interaction.reply(`🔨 **${user.tag}** tbanna.\n**Reason:** ${reason}`);
  }

  // === KICK ===
  if (interaction.commandName === 'kick') {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Ma 3tach reason';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ content: '❌ Ma l9itch had l\'user f server', ephemeral: true });
    if (!member.kickable) return interaction.reply({ content: '❌ Ma n9derch n\'kicki had l\'user. Role dyali na9s.', ephemeral: true });
    await member.kick(reason);
    await interaction.reply(`👢 **${user.tag}** tkicka.\n**Reason:** ${reason}`);
  }

  // === TIMEOUT ===
  if (interaction.commandName === 'timeout') {
    const user = interaction.options.getUser('user');
    const minutes = interaction.options.getInteger('minutes');
    const reason = interaction.options.getString('reason') || 'Ma 3tach reason';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ content: '❌ Ma l9itch had l\'user', ephemeral: true });
    if (!member.moderatable) return interaction.reply({ content: '❌ Ma n9derch n\'timeoutih', ephemeral: true });
    await member.timeout(minutes * 60 * 1000, reason);
    await interaction.reply(`🔇 **${user.tag}** t'3ta timeout **${minutes}** d9i9a.\n**Reason:** ${reason}`);
  }

  // === UNBAN ===
  if (interaction.commandName === 'unban') {
    const userId = interaction.options.getString('userid');
    try {
      await interaction.guild.members.unban(userId);
      await interaction.reply(`✅ **${userId}** t'7iyed lih ban!`);
    } catch (err) {
      await interaction.reply({ content: '❌ Ma 9dertch n\'unbanih. Wach ID s7i7? Wach mbanini aslan?', ephemeral: true });
    }
  }

  // === BAN ALL ===
  if (interaction.commandName === 'banall') {
    await interaction.reply('⚠️ **BDIT BAN ALL...** Ghadi takhod wa9t. Ma t7besch bot!');
    let banned = 0;
    const members = await interaction.guild.members.fetch();
    for (const m of members.values()) {
      if (m.id === interaction.user.id || m.user.bot || m.id === interaction.guild.ownerId) continue;
      try {
        await m.ban({ reason: `Banall by ${interaction.user.tag}` });
        banned++;
        await new Promise(r => setTimeout(r, 1000)); // 1s bach Discord ma y'blockikch
      } catch {}
    }
    await interaction.followUp(`✅ **Salit.** Bannit **${banned}** members.`);
  }

  // === NUKE ===
  if (interaction.commandName === 'nuke') {
    await interaction.reply('💣 **NUKE ACTIVATED** Kanmse7 server...');
    for (const c of interaction.guild.channels.cache.values()) {
      try { await c.delete(); await new Promise(r => setTimeout(r, 500)); } catch {}
    }
    for (const r of interaction.guild.roles.cache.values()) {
      if (r.name === '@everyone') continue;
      try { await r.delete(); await new Promise(r => setTimeout(r, 500)); } catch {}
    }
    try {
      await interaction.guild.setName('NUKED');
      await interaction.guild.setIcon(null);
    } catch {}
    const newChannel = await interaction.guild.channels.create({ name: 'nuked', type: 0 });
    await newChannel.send(`💥 **SERVER TNUKA** by ${interaction.user.tag}`);
  }

  // === MASS BAN ===
  if (interaction.commandName === 'massban') {
    const ids = interaction.options.getString('ids').split(',').map(id => id.trim());
    await interaction.reply(`⚠️ **Kanbanni ${ids.length} IDs...**`);
    let banned = 0;
    for (const id of ids) {
      try {
        await interaction.guild.members.ban(id, { reason: `Massban by ${interaction.user.tag}` });
        banned++;
        await new Promise(r => setTimeout(r, 1000));
      } catch {}
    }
    await interaction.followUp(`✅ **Bannit ${banned}/${ids.length}**`);
  }
});

// === DEBUG DYAL TOKEN ===
console.log('TOKEN kayna?',!!process.env.TOKEN);
console.log('Tool dyal TOKEN:', process.env.TOKEN?.length);
client.login(process.env.TOKEN);