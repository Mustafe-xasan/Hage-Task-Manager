const http = require('http');

function sendRequests(path, count, delay = 200) {
  let completed = 0;
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const options = {
        hostname: 'localhost',
        port: 4000,
        path,
        method: 'GET',
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          console.log(`${path} -> ${res.statusCode} | ${res.headers['retry-after'] || ''} | ${data.slice(0, 100)}`);
          completed++;
          if (completed === count * 2) process.exit(0);
        });
      });

      req.on('error', (e) => {
        console.error(`${path} request error:`, e.message);
        completed++;
        if (completed === count * 2) process.exit(0);
      });

      req.end();
    }, i * delay);
  }
}

const COUNT = 20;
sendRequests('/api/auth', COUNT);
sendRequests('/api', COUNT);
