require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, REST, Routes, AttachmentBuilder } = require('discord.js');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  getVoiceConnection,
  EndBehaviorType
} = require('@discordjs/voice');
const googleTTS = require('google-tts-api');
const prism = require('prism-media');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Test l\'bot'),
  new SlashCommandBuilder().setName('join').setDescription('Dkhel l\'voice channel'),
  new SlashCommandBuilder().setName('leave').setDescription('Khrej men l\'voice'),

  new SlashCommandBuilder()
  .setName('tts')
  .setDescription('Bot y9ra l\'hadra b sout f voice')
  .addStringOption(opt => opt.setName('text').setDescription('Chno bghiti y9ra').setRequired(true).setMaxLength(200))
  .addStringOption(opt => opt.setName('lang').setDescription('Lougha').addChoices(
      { name: 'Darija/Arabic', value: 'ar' },
      { name: 'English', value: 'en' },
      { name: 'French', value: 'fr' }
    )),

  new SlashCommandBuilder()
  .setName('record')
  .setDescription('Bda record f voice - 30s max')
  .addUserOption(opt => opt.setName('user').setDescription('Recordi had l\'user').setRequired(false)),
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

// === WELCOME VOICE - MELLI TDKHEL VOICE ===
client.on('voiceStateUpdate', async (oldState, newState) => {
  // Ila chi 7ed dkhel l'voice w bot tamma
  if (!oldState.channelId && newState.channelId) {
    const connection = getVoiceConnection(newState.guild.id);
    if (!connection || connection.joinConfig.channelId!== newState.channelId) return;

    // Ma t'welcomech l'bot rasso
    if (newState.member.user.bot) return;

    const text = `Mre7ba bik a ${newState.member.user.username} f voice`;
    const url = googleTTS.getAudioUrl(text, { lang: 'ar', slow: false });

    const player = createAudioPlayer();
    const resource = createAudioResource(url);
    connection.subscribe(player);
    player.play(resource);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply(`🏓 Pong! ${Math.round(client.ws.ping)}ms`);
  }

  if (interaction.commandName === 'join') {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) return interaction.reply({ content: '❌ Khassk tkon f voice a sat!', ephemeral: true });

    joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
      selfDeaf: false,
    });
    await interaction.reply(`✅ Dkhelt l ${voiceChannel.name}`);
  }

  if (interaction.commandName === 'leave') {
    const connection = getVoiceConnection(interaction.guild.id);
    if (!connection) return interaction.reply({ content: '❌ Ma kntch f voice', ephemeral: true });
    connection.destroy();
    await interaction.reply('👋 Khrejt');
  }

  // === TTS FREE 100% ===
  if (interaction.commandName === 'tts') {
    const text = interaction.options.getString('text');
    const lang = interaction.options.getString('lang') || 'ar';
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) return interaction.reply({ content: '❌ Khassk tkon f voice!', ephemeral: true });
    await interaction.reply(`🔊 Kan9ra: "${text}"`);

    try {
      let connection = getVoiceConnection(interaction.guild.id);
      if (!connection) {
        connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: interaction.guild.id,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });
      }

      const url = googleTTS.getAudioUrl(text, { lang: lang, slow: false });
      const player = createAudioPlayer();
      const resource = createAudioResource(url);
      connection.subscribe(player);
      player.play(resource);

    } catch (error) {
      console.error(error);
      await interaction.followUp({ content: '❌ Mochkil f TTS', ephemeral: true });
    }
  }

  // === RECORD VOICE FREE ===
  if (interaction.commandName === 'record') {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) return interaction.reply({ content: '❌ Khassk tkon f voice!', ephemeral: true });

    const targetUser = interaction.options.getUser('user') || interaction.user;
    await interaction.reply(`🎙️ Kan'recordi ${targetUser.username}... 30s max! Ghadi nsiftha lik f DM.`);

    const connection = getVoiceConnection(interaction.guild.id) || joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
      selfDeaf: false,
    });

    const receiver = connection.receiver;
    const audioStream = receiver.subscribe(targetUser.id, {
      end: { behavior: EndBehaviorType.AfterSilence, duration: 1000 }
    });

    const filename = `record-${Date.now()}.pcm`;
    const writeStream = fs.createWriteStream(filename);
    const opusDecoder = new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 });

    audioStream.pipe(opusDecoder).pipe(writeStream);

    // 7bes record men be3d 30s
    setTimeout(() => {
      audioStream.destroy();
      writeStream.end();

      // Convert PCM l MP3 b ffmpeg - khassha install
      const { exec } = require('child_process');
      const mp3File = filename.replace('.pcm', '.mp3');
      exec(`ffmpeg -f s16le -ar 48000 -ac 2 -i ${filename} ${mp3File}`, async (err) => {
        if (err) {
          await interaction.user.send('❌ Ma 9derch nconverti l\'audio');
          return;
        }
        const file = new AttachmentBuilder(mp3File);
        await interaction.user.send({ content: `🎙️ Record dyal ${targetUser.username}:`, files: [file] });

        // Mse7 files
        fs.unlinkSync(filename);
        fs.unlinkSync(mp3File);
      });

    }, 30000); // 30 seconds
  }
});

// === DEBUG DYAL TOKEN ===
console.log('TOKEN kayna?',!!process.env.TOKEN);
console.log('Tool dyal TOKEN:', process.env.TOKEN?.length);
client.login(process.env.TOKEN);