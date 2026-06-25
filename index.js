require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
    ]
});

client.once('clientReady', () => {
    console.log(`✅ Bot khdam: ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    // /ban
    if (commandName === 'ban') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({ content: '❌ Ma3endkch salahiya!', ephemeral: true });
        }
        
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'Bla sabab';
        
        try {
            await interaction.guild.members.ban(user, { reason });
            await interaction.reply(`✅ ${user.tag} t'banna\nSabab: ${reason}`);
        } catch (err) {
            await interaction.reply({ content: '❌ Error: ' + err.message, ephemeral: true });
        }
    }

    // /unban
    if (commandName === 'unban') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({ content: '❌ Ma3endkch salahiya!', ephemeral: true });
        }
        
        const userId = interaction.options.getString('userid');
        
        try {
            await interaction.guild.members.unban(userId);
            await interaction.reply(`✅ Unban t9ada l: ${userId}`);
        } catch (err) {
            await interaction.reply({ content: '❌ Error: ' + err.message, ephemeral: true });
        }
    }

    // /kick
    if (commandName === 'kick') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.reply({ content: '❌ Ma3endkch salahiya!', ephemeral: true });
        }
        
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'Bla sabab';
        
        try {
            await interaction.guild.members.kick(user, reason);
            await interaction.reply(`✅ ${user.tag} t'kickaa\nSabab: ${reason}`);
        } catch (err) {
            await interaction.reply({ content: '❌ Error: ' + err.message, ephemeral: true });
        }
    }

    // /timeout
    if (commandName === 'timeout') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ content: '❌ Ma3endkch salahiya!', ephemeral: true });
        }
        
        const user = interaction.options.getUser('user');
        const minutes = interaction.options.getInteger('minutes');
        const reason = interaction.options.getString('reason') || 'Bla sabab';
        const member = await interaction.guild.members.fetch(user.id);
        
        try {
            await member.timeout(minutes * 60 * 1000, reason);
            await interaction.reply(`✅ ${user.tag} timeout ${minutes} d9i9a\nSabab: ${reason}`);
        } catch (err) {
            await interaction.reply({ content: '❌ Error: ' + err.message, ephemeral: true });
        }
    }

    // /untimeout
    if (commandName === 'untimeout') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ content: '❌ Ma3endkch salahiya!', ephemeral: true });
        }
        
        const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id);
        
        try {
            await member.timeout(null);
            await interaction.reply(`✅ Timeout t7yed l ${user.tag}`);
        } catch (err) {
            await interaction.reply({ content: '❌ Error: ' + err.message, ephemeral: true });
        }
    }

    // /ticket-setup
    if (commandName === 'ticket-setup') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '❌ Khassk tkoun Admin!', ephemeral: true });
        }
        
        const embed = new EmbedBuilder()
           .setTitle('🎫 Ticket System')
           .setDescription('Click 3la lbutton bach t7el ticket')
           .setColor('#00ff00');
            
        await interaction.reply({ embeds: [embed] });
    }

    // /embed
    if (commandName === 'embed') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: '❌ Ma3endkch salahiya!', ephemeral: true });
        }
        
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const color = interaction.options.getString('color') || '#0099ff';
        
        const embed = new EmbedBuilder()
           .setTitle(title)
           .setDescription(description)
           .setColor(color)
           .setTimestamp();
            
        await interaction.channel.send({ embeds: [embed] });
        await interaction.reply({ content: '✅ Embed tsift!', ephemeral: true });
    }
});

client.login(process.env.TOKEN);
