const http = require('http');
const axios = require('axios');

const { app } = require('../server');

(async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  const base = `http://127.0.0.1:${port}`;
  let failed = false;

  try {
    // OPTIONS preflight
    const optRes = await axios.options(`${base}/api/info`, {
      headers: { Origin: 'http://example.com' }, validateStatus: () => true
    });
    if (optRes.status !== 204) {
      throw new Error(`Expected 204 for OPTIONS, got ${optRes.status}`);
    }
    const aco = optRes.headers['access-control-allow-origin'];
    if (!aco || aco !== 'http://example.com') {
      throw new Error(`Expected ACAO to echo origin, got ${aco}`);
    }

    // GET with Origin header; expect headers present
    const getRes = await axios.get(`${base}/api/info`, {
      params: { user: 'u', pass: 'p' },
      headers: { Origin: 'http://example.com' },
      validateStatus: () => true
    });
    const aco2 = getRes.headers['access-control-allow-origin'];
    if (!aco2 || aco2 !== 'http://example.com') {
      throw new Error(`Expected ACAO on GET to echo origin, got ${aco2}`);
    }
    console.log('PASS CORS test: ACAO header present for OPTIONS and GET');
  } catch (err) {
    console.error('FAIL CORS test:', err.message);
    failed = true;
  } finally {
    server.close();
    if (failed) process.exitCode = 1;
  }
})();
