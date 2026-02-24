const http = require('http');

const data = JSON.stringify({
  name: "Orphan Test Case 1",
  projectId: "1",
  parentId: "non-existent-id-123456",
  type: "testcase"
});

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/testcases',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
