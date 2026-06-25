require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');

const commands = [
    // ghir example, 7et lcommands dyalk hna bhal l9dam
    {
        name: 'ban',
        description: 'Banni chi wahed',
        options: [
            { name: 'user', description: 'User', type: 6, required: true },
            { name: 'reason', description: '3lach', type: 3, required: false }
        ],
        default_member_permissions: '4' // BanMembers
    },
    {
        name: 'kick', 
        description: 'Kick chi wahed',
        options: [
            { name: 'user', description: 'User', type: 6, required: true },
            { name: 'reason', description: '3lach', type: 3, required: false }
        ],
        default_member_permissions: '2' // KickMembers
    }
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Kan deployiw lcommands...');
        
        // 1. Mse7 Global Commands l9dam
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });
        console.log('✅ Global commands tmse7o');

        // 2. Deploy l Guild dyalk - hadchi instant
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, 'ID_DYAL_SERVER_DYALK_HNA'),
            { body: commands }
        );
        console.log('✅ Guild commands tsjlo db!');
        
    } catch (error) {
        console.error(error);
    }
})();