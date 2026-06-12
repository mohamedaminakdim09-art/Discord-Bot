const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const cors = require('cors');
const app = express();

// ⚠️ BDL HADI B LINK DIAL NETLIFY DIALK
app.use(cors({
  origin: [
    'https://oaminnox-dev.netlify.app', // Hna dir link dialk
    'http://localhost:5500', 
    'http://127.0.0.1:5500'
  ]
}));
app.use(express.json());

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
  ] 
});

let codes = [];

// Route bach Railway y3rf app khdama
app.get('/', (req, res) => {
  res.json({ status: 'Bot oaminnox khdam ✅', codes_active: codes.length });
});

app.post('/verify', (req, res) => {
  const { code } = req.body;
  if (!code) return res.json({ valid: false });
  
  const index = codes.indexOf(code.toUpperCase());
  if(index !== -1) {
    codes.splice(index, 1);
    console.log(`Code ${code} tverifica w t7yd`);
    res.json({ valid: true });
  } else {
    console.log(`Code ghalat: ${code}`);
    res.json({ valid: false });
  }
});

client.on('ready', () => {
  console.log(`✅ Bot mkhdom: ${client.user.tag}`);
});

client.on('messageCreate', message => {
  if (message.author.bot) return;
  
  if (message.content === '!getcode') {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    codes.push(code);
    
    message.author.send(`**🔑 Code dialk:** \`${code}\`\n**Sali7 l:** 10 min\n\nSir l site w dkhl bih`).catch(() => {
      message.reply('❌ 7l DM dialk a bro bach nsift lik');
    });
    
    message.reply('✅ Sifft lik code f DM');
    console.log(`Code jdid: ${code} l ${message.author.tag}`);
    
    setTimeout(() => {
      codes = codes.filter(c => c !== code);
      console.log(`Code ${code} mcha 3lih l7al`);
    }, 10 * 60 * 1000);
  }
});

// HADI HYA LI SL7AT MOOSHKIL "NOT FOUND"
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API khdama 3la port ${PORT}`);
});

client.login(process.env.DISCORD_TOKEN);