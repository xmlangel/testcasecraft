const testMultipart = async () => {
  const formData = new FormData();
  formData.append("file", new Blob(["test content"], { type: "text/plain" }), "test.txt");
  formData.append("description", "테스트 파일");

  const response = await fetch("http://localhost:8080/api/attachments/upload/test-result-id", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + "YOUR_TOKEN_HERE"
    },
    body: formData
  });

  console.log("Status:", response.status);
  console.log("Response:", await response.json());
};

console.log("fetch multipart 테스트");
