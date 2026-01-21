// server.js - Cleaned, security enhanced, bot separated
require('dotenv').config();
const express = require('express');
const next = require('next');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.use(helmet({ contentSecurityPolicy: { useDefaults: true, directives: { 'script-src': ["'self'", "'unsafe-eval'"], 'img-src': ["'self'", 'data:'] } } }));
  server.use(compression());
  server.use(cookieParser(process.env.COOKIE_SECRET || 'secret'));
  server.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false }));

  const csrfProtection = csurf({ cookie: { httpOnly: true, secure: !dev } });
  server.use(csrfProtection);

  server.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      csrfProtection(req, res, next);
    } else {
      next();
    }
  });

  server.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
  });

  if (process.env.ADS_ENABLED === 'true') {
    // Ads middleware stub
  }

  server.all('*', (req, res) => handle(req, res));

  server.listen(process.env.PORT || 3000, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${process.env.PORT || 3000}`);
  });
});
