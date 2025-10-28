const http = require('http');
const axios = require('axios');

const { app } = require('../server');

(async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  try {
    const url = `http://127.0.0.1:${port}/health`;
    const res = await axios.get(url, { timeout: 5000 });
    if (res.status !== 200) throw new Error(`Unexpected status ${res.status}`);
    if (!res.data || res.data.ok !== true) throw new Error('Expected { ok: true }');
    console.log('PASS health test:', res.data);
  } catch (err) {
    console.error('FAIL health test:', err.message);
    process.exitCode = 1;
  } finally {
    server.close();
  }
})();
