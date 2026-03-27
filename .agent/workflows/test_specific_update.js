const http = require("http");

// First login to get a token
const loginData = JSON.stringify({
  username: "admin",
  password: "password123!",
});

const loginOptions = {
  hostname: "localhost",
  port: 8080,
  path: "/api/auth/login",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": loginData.length,
  },
};

const loginReq = http.request(loginOptions, (res) => {
  let tokenData = "";
  res.on("data", (chunk) => {
    tokenData += chunk;
  });

  res.on("end", () => {
    try {
      const token = JSON.parse(tokenData).token;

      const tcData = JSON.stringify({
        name: "Test Case Update Test",
        projectId: "1",
        parentId: "orphaned-items-folder",
        type: "testcase",
      });

      const options = {
        hostname: "localhost",
        port: 8080,
        path: "/api/testcases/a88bcabb-0c36-4b30-94d2-dd597bece785",
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": tcData.length,
          Authorization: `Bearer ${token}`,
        },
      };

      const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        res.on("data", (d) => {
          process.stdout.write(d);
        });
      });

      req.on("error", (error) => {
        console.error(error);
      });

      req.write(tcData);
      req.end();
    } catch (e) {
      console.error("Login failed:", e, tokenData);
    }
  });
});

loginReq.write(loginData);
loginReq.end();
