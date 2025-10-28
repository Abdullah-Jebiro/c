const http = require('http');
const axios = require('axios');

process.env.MOCK = '1';

const { app } = require('../server');

(async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  try {
    const url = `http://127.0.0.1:${port}/api/info?user=test@example.com&pass=secret`;
    const res = await axios.get(url, { timeout: 5000 });
    if (res.status !== 200) throw new Error(`Unexpected status ${res.status}`);
    const data = res.data;
    if (!data.success) throw new Error('Expected success=true');
    if (!data._raw) throw new Error('Expected _raw field');
    console.log('PASS mock test:', JSON.stringify({ phone: data.phone, name: data.firstName + ' ' + data.lastName }));
  } catch (err) {
    console.error('FAIL mock test:', err.message);
    process.exitCode = 1;
  } finally {
    server.close();
  }
})();
