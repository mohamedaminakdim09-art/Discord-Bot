require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    Partials, 
    Collection, 
    EmbedBuilder, 
    PermissionsBitField, 
    ChannelType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.User]
});

// ===== SYSTEMS STORAGE =====
client.tickets = new Map(); // ticket system
client.nukers = new Map(); // anti-nuke
client.customRooms = new Map(); // custom rooms

client.once('ready', () => {
    console.log(`✅ Bot khdam: ${client.user.tag}`);
    client.user.setActivity('Protecting Server 🛡️', { type: 3 });
});

// ===== ANTI-NUKE SYSTEM =====
client.on('channelDelete', async channel => {
    const logs = await channel.guild.fetchAuditLogs({ type: 12, limit: 1 });
    const entry = logs.entries.first();
    if (!entry || entry.executor.bot) return;
    
    const id = entry.executor.id;
    const count = (client.nukers.get(id) || 0) + 1;
    client.nukers.set(id, count);
    
    if (count >= 3) {
        const member = await channel.guild.members.fetch(id).catch(() => null);
        if (member) await member.ban({ reason: 'Anti-Nuke: Mass channel delete' }).catch(() => {});
        client.nukers.delete(id);
        logAction(channel.guild, `🚨 **ANTI-NUKE**\n${entry.executor.tag} tbanna hit ms7 bzaf dyal channels`);
    }
    setTimeout(() => client.nukers.delete(id), 15000);
});

client.on('roleDelete', async role => {
    const logs = await role.guild.fetchAuditLogs({ type: 32, limit: 1 });
    const entry = logs.entries.first();
    if (!entry || entry.executor.bot) return;
    
    const id = entry.executor.id;
    const count = (client.nukers.get(id) || 0) + 1;
    client.nukers.set(id, count);
    
    if (count >= 3) {
        const member = await role.guild.members.fetch(id).catch(() => null);
        if (member) await member.ban({ reason: 'Anti-Nuke: Mass role delete' }).catch(() => {});
        client.nukers.delete(id);
        logAction(role.guild, `🚨 **ANTI-NUKE**\n${entry.executor.tag} tbanna hit ms7 bzaf dyal roles`);
    }
    setTimeout(() => client.nukers.delete(id), 15000);
});

// ===== WELCOME & GOODBYE =====
client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.cache.find(c => c.name === 'welcome');
    if (!channel) return;
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('Marhba bik!')
      .setDescription(`${member} dkhel l **${member.guild.name}** 🎉\nHna wselna l ${member.guild.memberCount} members`)
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp();
    channel.send({ embeds: [embed] });
    logAction(member.guild, `📥 **Member Join**\n${member.user.tag} dkhel l server`);
});

client.on('guildMemberRemove', member => {
    const channel = member.guild.channels.cache.find(c => c.name === 'goodbye');
    if (channel) channel.send(`👋 ${member.user.tag} khrej men server`);
    logAction(member.guild, `📤 **Member Leave**\n${member.user.tag} khrej men server`);
});

// ===== CUSTOM ROOM SYSTEM =====
client.on('voiceStateUpdate', async (oldState, newState) => {
    const joinChannelName = '🔊 Create Room';
    const categoryName = 'Custom Rooms';

    // Create room
    if (newState.channel && newState.channel.name === joinChannelName) {
        const category = newState.guild.channels.cache.find(c => c.name === categoryName && c.type === ChannelType.GuildCategory);
        const room = await newState.guild.channels.create({
            name: `Room ${newState.member.user.username}`,
            type: ChannelType.GuildVoice,
            parent: category?.id,
            permissionOverwrites: [
                { id: newState.guild.id, deny: [PermissionsBitField.Flags.Connect] },
                { id: newState.member.id, allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ManageChannels] }
            ]
        });
        await newState.member.voice.setChannel(room);
        client.customRooms.set(room.id, newState.member.id);
    }

    // Delete empty room
    if (oldState.channel && client.customRooms.has(oldState.channel.id) && oldState.channel.members.size === 0) {
        await oldState.channel.delete().catch(() => {});
        client.customRooms.delete(oldState.channel.id);
    }
});

// ===== LOGGING FUNCTION =====
function logAction(guild, message) {
    const logChannel = guild.channels.cache.find(c => c.name === 'mod-logs');
    if (logChannel) logChannel.send({ embeds: [new EmbedBuilder().setColor('#5865F2').setDescription(message).setTimestamp()] });
}

// ===== INTERACTION HANDLER =====
client.on('interactionCreate', async interaction => {
    // SLASH COMMANDS
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;

        // MODERATION
        if (commandName === 'ban') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return interaction.reply({ content: 'Ma3andekch l7a9!', ephemeral: true });
            const user = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason') || 'Hta sabab';
            await interaction.guild.members.ban(user, { reason });
            await interaction.reply(`✅ ${user.tag} tbanna | Reason: ${reason}`);
            logAction(interaction.guild, `🔨 **BAN**\n**User:** ${user.tag}\n**Staff:** ${interaction.user.tag}\n**Reason:** ${reason}`);
        }

        if (commandName === 'unban') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return interaction.reply({ content: 'Ma3andekch l7a9!', ephemeral: true });
            const userid = interaction.options.getString('userid');
            await interaction.guild.members.unban(userid);
            await interaction.reply(`✅ Unban t9ad l ${userid}`);
            logAction(interaction.guild, `🔓 **UNBAN**\n**User ID:** ${userid}\n**Staff:** ${interaction.user.tag}`);
        }

        if (commandName === 'kick') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return interaction.reply({ content: 'Ma3andekch l7a9!', ephemeral: true });
            const user = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason') || 'Hta sabab';
            await interaction.guild.members.kick(user, reason);
            await interaction.reply(`✅ ${user.tag} tkicka | Reason: ${reason}`);
            logAction(interaction.guild, `👢 **KICK**\n**User:** ${user.tag}\n**Staff:** ${interaction.user.tag}\n**Reason:** ${reason}`);
        }

        if (commandName === 'timeout') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return interaction.reply({ content: 'Ma3andekch l7a9!', ephemeral: true });
            const user = interaction.options.getUser('user');
            const minutes = interaction.options.getInteger('minutes');
            const reason = interaction.options.getString('reason') || 'Hta sabab';
            const member = await interaction.guild.members.fetch(user.id);
            await member.timeout(minutes * 60 * 1000, reason);
            await interaction.reply(`✅ ${user.tag} darna lih timeout ${minutes} min`);
            logAction(interaction.guild, `⏰ **TIMEOUT**\n**User:** ${user.tag}\n**Duration:** ${minutes}m\n**Staff:** ${interaction.user.tag}`);
        }

        if (commandName === 'untimeout') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return interaction.reply({ content: 'Ma3andekch l7a9!', ephemeral: true });
            const user = interaction.options.getUser('user');
            const member = await interaction.guild.members.fetch(user.id);
            await member.timeout(null);
            await interaction.reply(`✅ 7yedna timeout l ${user.tag}`);
            logAction(interaction.guild, `⏰ **UNTIMEOUT**\n**User:** ${user.tag}\n**Staff:** ${interaction.user.tag}`);
        }

        // TICKET SYSTEM
        if (commandName === 'ticket-setup') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'Ghir Admin!', ephemeral: true });
            const embed = new EmbedBuilder()
              .setColor('#5865F2')
              .setTitle('📩 Support Tickets')
              .setDescription('Klik 3la lbutton lte7t bach t7el ticket m3a staff');
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('create_ticket').setLabel('Create Ticket').setStyle(ButtonStyle.Primary).setEmoji('🎫')
            );
            await interaction.channel.send({ embeds: [embed], components: [row] });
            await interaction.reply({ content: 'Ticket panel t setupa!', ephemeral: true });
        }

        // CUSTOM MESSAGE
        if (commandName === 'embed') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return interaction.reply({ content: 'Ma3andekch l7a9!', ephemeral: true });
            const title = interaction.options.getString('title');
            const desc = interaction.options.getString('description');
            const color = interaction.options.getString('color') || '#5865F2';
            const embed = new EmbedBuilder().setTitle(title).setDescription(desc).setColor(color);
            await interaction.channel.send({ embeds: [embed] });
            await interaction.reply({ content: 'Embed tsift!', ephemeral: true });
        }
    }

    // BUTTONS - TICKET
    if (interaction.isButton() && interaction.customId === 'create_ticket') {
        const ticketChannel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
            ]
        });
        client.tickets.set(ticketChannel.id, interaction.user.id);
        const embed = new EmbedBuilder().setColor('#00FF00').setDescription(`Marhba ${interaction.user}, staff ghayjawbk 9rib.`);
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_ticket').setLabel('Close Ticket').setStyle(ButtonStyle.Danger)
        );
        await ticketChannel.send({ content: `${interaction.user}`, embeds: [embed], components: [row] });
        await interaction.reply({ content: `Ticket t7el: ${ticketChannel}`, ephemeral: true });
    }

    if (interaction.isButton() && interaction.customId === 'close_ticket') {
        await interaction.reply('Ticket ghaytsed f 5 sec...');
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
        logAction(interaction.guild, `🎫 **Ticket Closed**\n**Channel:** ${interaction.channel.name}\n**Closed by:** ${interaction.user.tag}`);
    }
});

client.login(process.env.TOKEN);