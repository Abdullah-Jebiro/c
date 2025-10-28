const express = require('express');
const axios = require('axios');

const PORT = process.env.PORT || 3000;
const app = express();

// Serve static frontend
app.use(express.static('public'));

// Lightweight CORS for API routes to avoid browser CORS issues when called cross-origin
app.use((req, res, next) => {
  if (req.path && req.path.startsWith('/api/')) {
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
  }
  next();
});

// Helper: sanitize and map response fields
function mapResponse(raw) {
  if (!raw || typeof raw !== 'object') return { success: false, error: 'Invalid response' };
  const {
    success,
    phone,
    f_name,
    l_name,
    online,
    exp,
    usage,
    pkg,
    serv,
    limitcomb,
    limitexpiration,
    last_inovice // note the original key spelling
  } = raw;
  return {
    success: !!success,
    phone: phone || null,
    firstName: f_name || null,
    lastName: l_name || null,
    online: online === 'y' ? true : online === 'n' ? false : online,
    expiration: exp || null,
    usage: usage || null,
    package: pkg || null,
    service: serv || null,
    limitCombined: limitcomb || null,
    limitExpiration: limitexpiration || null,
    lastInvoice: last_inovice || null,
    _raw: raw
  };
}

// Mock sample for offline/dev
const SAMPLE = {
  "success": true,
  "phone": "261496@idleb.com",
  "f_name": "\u0637\u0647",
  "l_name": "\u062c\u0628\u064a\u0631\u0648",
  "online": "y",
  "exp": "2028-10-20",
  "usage": "36.16 GB",
  "pkg": "4,379.33 GB",
  "serv": "1000 GB",
  "limitcomb": "1",
  "limitexpiration": "0",
  "last_inovice": "2025-08-06"
};

// Proxy endpoint: /api/info?user=<email>&pass=<password>
app.get('/api/info', async (req, res) => {
  try {
    const user = (req.query.user || '').toString();
    const pass = (req.query.pass || '').toString();

    if (!user || !pass) {
      return res.status(400).json({ success: false, error: 'Missing query params: user, pass' });
    }

    // Mock mode for development/testing without external calls
    if (process.env.MOCK === '1') {
      return res.json(mapResponse(SAMPLE));
    }

    const url = 'https://user.telecomsy.com/users/gso.php';
    const params = { userfrom_ui: user, passfrom_ui: pass };

    const response = await axios.get(url, { params, timeout: 10000 });
    // Some endpoints return string JSON, normalize
    const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

    return res.json(mapResponse(data));
  } catch (err) {
    const status = err.response?.status || 500;
    const payload = err.response?.data;
    let message = 'Upstream request failed';
    try {
      if (typeof payload === 'string') {
        message = `${message}: ${payload.substring(0, 200)}`;
      } else if (payload && typeof payload === 'object') {
        message = `${message}: ${JSON.stringify(payload).substring(0, 200)}`;
      }
    } catch (_) {}
    return res.status(status).json({ success: false, error: message });
  }
});

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Only start the server if run directly
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}

module.exports = { app, mapResponse };
