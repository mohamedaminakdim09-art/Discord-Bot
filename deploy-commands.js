require('dotenv').config();
const { REST, Routes } = require('discord.js');

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Kanmse7o Global Commands l9dam...');
        
        // Hadi katmse7 ga3 lcommands lglobal men Discord kamel
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });
        console.log('✅ Global Commands tmse7o kamlin!');
        
        console.log('Ma3endnach Guild Commands daba, safi bot n9i');
        
    } catch (error) {
        console.error(error);
    }
})();
