// server.js
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).catch(err => console.error('MongoDB connection error:', err));
const express = require('express');
const next = require('next');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const csurf = require('@dr.pogodin/csurf');
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.use(helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'script-src': ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'blob:'],
        'style-src': ["'self'", "'unsafe-inline'"]
      }
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  }));

  server.use(compression());
  server.use(cookieParser(process.env.COOKIE_SECRET || 'default_secret'));

  // Add body parsers before CSRF to parse form data and JSON bodies
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));

  server.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
  }));

  const csrfProtection = csurf({
    cookie: {
      httpOnly: true,
      secure: !dev,
      sameSite: 'strict'
    }
  });
  server.use(csrfProtection);

  server.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
  });

  if (process.env.ADS_ENABLED === 'true') {
    server.use((req, res, next) => {
      next();
    });
  }

  // Handle all routes with Next.js
  server.all('*', (req, res) => handle(req, res));

  // CSRF error handler (must be after routes)
  server.use((err, req, res, next) => {
    if (err.code !== 'EBADCSRFTOKEN') return next(err);
    console.error('CSRF Error:', err);
    res.status(403).send('Invalid CSRF token. Form has been tampered with.');
  });

  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Server ready on http://localhost:${port}`);
    require('./bot.js');
  });
});
