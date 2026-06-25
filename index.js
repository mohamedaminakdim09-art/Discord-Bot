require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration
    ]
});

client.once('ready', () => {
    console.log(`✅ Bot khdam: ${client.user.tag}`);
    client.user.setActivity('Server Protection 🛡️', { type: 3 });
});

// Anti-Nuke simple: Ila chi 7ed ms7 3 channels f 10 sec = kick
const nukers = new Map();
client.on('channelDelete', async channel => {
    const logs = await channel.guild.fetchAuditLogs({ type: 12, limit: 1 });
    const entry = logs.entries.first();
    if (!entry || entry.executor.bot) return;
    
    const id = entry.executor.id;
    const count = (nukers.get(id) || 0) + 1;
    nukers.set(id, count);
    
    if (count >= 3) {
        channel.guild.members.ban(id, { reason: 'Anti-Nuke: Mass channel delete' });
        nukers.delete(id);
    }
    setTimeout(() => nukers.delete(id), 10000);
});

// Welcome system
client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.cache.find(c => c.name === 'welcome');
    if (!channel) return;
    const embed = new EmbedBuilder()
       .setColor('#5865F2')
       .setTitle('Marhba bik!')
       .setDescription(`${member} dkhel l **${member.guild.name}** 🎉`)
       .setThumbnail(member.user.displayAvatarURL());
    channel.send({ embeds: [embed] });
});

client.login(process.env.TOKEN);