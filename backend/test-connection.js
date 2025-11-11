const net = require('net');

const host = 'podcaststack.duckdns.org';
const port = 5432;

console.log(`Testing connection to ${host}:${port}...\n`);

const socket = net.createConnection(port, host, () => {
  console.log('✅ Connection successful!');
  console.log(`Connected to ${host}:${port}`);
  socket.destroy();
  process.exit(0);
});

socket.on('error', (err) => {
  console.error('❌ Connection failed!');
  console.error(`Error: ${err.message}`);
  console.error(`Code: ${err.code}`);
  process.exit(1);
});

socket.setTimeout(5000, () => {
  console.error('❌ Connection timeout!');
  socket.destroy();
  process.exit(1);
});
