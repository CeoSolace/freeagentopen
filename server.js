// server.js
require('dotenv').config();
const express = require('express');
const next = require('next');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Security & Perf
  server.use(helmet());
  server.use(compression());
  server.use(cookieParser(process.env.COOKIE_NAME));
  server.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

  // Discord Bot Setup
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  });

  client.once('ready', () => {
    console.log(`Discord Bot ready as ${client.user.tag}`);
    // Example: Send welcome to app channel
    const appChannel = client.channels.cache.get(process.env.DISCORD_APP_CHANNEL_ID);
    if (appChannel) appChannel.send('Bot online!');
  });

  client.on('guildMemberAdd', async (member) => {
    if (member.guild.id === process.env.DISCORD_GUILD_ID) {
      await member.roles.add(process.env.DISCORD_MEMBER_ROLE_ID);
      // Lock role if needed: await member.roles.add(process.env.DISCORD_LOCK_ROLE_ID);
    }
  });

  client.on('error', (error) => {
    console.error('Discord Error:', error);
    const errorChannel = client.channels.cache.get(process.env.ERROR_ALERT_FIX_CHANNEL_ID);
    if (errorChannel) errorChannel.send(`<@${process.env.ERROR_PING_ID}> Error: ${error.message}`);
  });

  client.on('messageCreate', async (message) => {
    if (message.channel.id === process.env.ISSUE_CHANNEL_ID && message.content.startsWith('!issue')) {
      // Handle issues, e.g., email owner
      console.log(`Issue reported: ${message.content}`);
      // Pseudo: sendEmail(process.env.OWNER_EMAIL, message.content);
    }
  });

  client.login(process.env.DISCORD_BOT_TOKEN);

  // Ads Toggle (example middleware)
  if (process.env.ADS_ENABLED === 'true') {
    server.use((req, res, next) => {
      // Inject ads logic if needed
      next();
    });
  }

  // CSRF Protection (basic example)
  server.use((req, res, next) => {
    if (req.method === 'POST') {
      // Validate CSRF token using process.env.CSRF_SECRET
    }
    next();
  });

  // Next.js Handler
  server.all('*', (req, res) => handle(req, res));

  server.listen(process.env.PORT || 3000, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${process.env.PORT || 3000}`);
  });
});
