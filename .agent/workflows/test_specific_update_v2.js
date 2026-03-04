const http = require('http');

const loginData = JSON.stringify({
  username: "admin",
  password: "admin123"
});

const loginOptions = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const req = http.request(loginOptions, (res) => {
  let tokenData = '';
  res.on('data', (chunk) => { tokenData += chunk; });
  res.on('end', () => {
    try {
      const token = JSON.parse(tokenData).token;
      
      const tcData = JSON.stringify({
        id: "a88bcabb-0c36-4b30-94d2-dd597bece785",
        name: "Test Case Update Test",
        projectId: "1",
        parentId: "orphaned-items-folder",
        type: "testcase"
      });

      const options = {
        hostname: 'localhost',
        port: 8080,
        path: '/api/testcases/a88bcabb-0c36-4b30-94d2-dd597bece785',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': tcData.length,
          'Authorization': `Bearer ${token}`
        }
      };

      const putReq = http.request(options, (putRes) => {
        console.log(`STATUS: ${putRes.statusCode}`);
        putRes.on('data', (d) => process.stdout.write(d));
      });

      putReq.on('error', (e) => console.error(e));
      putReq.write(tcData);
      putReq.end();
      
    } catch (e) {
      console.error("Login failed or missing token:", e, tokenData);
    }
  });
});
req.write(loginData);
req.end();
