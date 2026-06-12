const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
  ] 
});

let codes = [];

app.get('/', (req, res) => {
  res.json({ status: 'Bot khdam ✅', codes_active: codes.length });
});

app.post('/verify', (req, res) => {
  const { code } = req.body;
  if (!code) return res.json({ valid: false });
  
  const index = codes.indexOf(code.toUpperCase());
  if(index !== -1) {
    codes.splice(index, 1);
    res.json({ valid: true });
  } else {
    res.json({ valid: false });
  }
});

client.on('ready', () => {
  console.log(`✅ Bot: ${client.user.tag}`);
});

client.on('messageCreate', message => {
  if (message.author.bot) return;
  
  if (message.content === '!getcode') {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    codes.push(code);
    message.author.send(`**Code dialk:** \`${code}\`\nSali7 l 10 min`).catch(() => {
      message.reply('❌ 7l DM dialk');
    });
    message.reply('✅ Sifft lik code f DM');
    
    setTimeout(() => {
      codes = codes.filter(c => c !== code);
    }, 10 * 60 * 1000);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API 3la port ${PORT}`);
});

client.login(process.env.DISCORD_TOKEN);