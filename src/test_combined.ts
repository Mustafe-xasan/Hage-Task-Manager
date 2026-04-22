import app from './App';
import http from 'http';

const PORT = Number(process.env.TEST_PORT ?? 4000);

function sendRequest(path: string): Promise<{ status: number; body: string; headers: http.IncomingHttpHeaders }>{
  return new Promise((resolve) => {
    const options: http.RequestOptions = {
      hostname: 'localhost',
      port: PORT,
      path,
      method: 'GET',
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode ?? 0, body: data, headers: res.headers }));
    });
    req.on('error', (e) => resolve({ status: 0, body: e.message, headers: {} }));
    req.end();
  });
}

async function runTests() {
  const COUNT = 20;
  for (let i = 0; i < COUNT; i++) {
    const a = await sendRequest('/api/auth');
    console.log(`/api/auth -> ${a.status} | ${a.headers['retry-after'] || ''} | ${a.body.slice(0,100)}`);
    const b = await sendRequest('/api');
    console.log(`/api -> ${b.status} | ${b.headers['retry-after'] || ''} | ${b.body.slice(0,100)}`);
  }
}

const server = app.listen(PORT, async () => {
  console.log(`Test server listening at http://localhost:${PORT}`);
  try {
    await runTests();
  } catch (e) {
    console.error('Error running tests', e);
  } finally {
    server.close(() => console.log('Test server closed'));
    process.exit(0);
  }
});
