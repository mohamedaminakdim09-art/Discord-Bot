require('dotenv').config();
const { REST, Routes } = require('discord.js');

console.log('TOKEN:', !!process.env.TOKEN);
console.log('CLIENT_ID:', !!process.env.CLIENT_ID);

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Kanmse7o Global Commands l9dam...');
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });
        console.log('✅ Global Commands tmse7o kamlin!');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
})();
