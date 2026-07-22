// 백엔드 불필요 스모크 테스트.
// dist/index.js 를 stdio 로 띄워 tools/list 를 검증한다. 서버는 부팅 시점에
// assertWiring(allTools ⊆ allHandlers + 도구명 유일성)을 실행하므로, 배선이
// 깨졌으면 여기서 프로세스가 비정상 종료해 이 테스트가 실패한다.
//
// 실행: npm test  (사전에 npm run build 또는 prepare 훅으로 dist 생성 필요)
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, "..", "dist", "index.js");
const EXPECTED_MIN_TOOLS = 59;

function fail(msg) {
  console.error(`❌ SMOKE FAIL: ${msg}`);
  process.exit(1);
}

const child = spawn("node", [serverPath], {
  env: { ...process.env, TESTCASECRAFT_BASE_URL: "https://example.invalid" },
  stdio: ["pipe", "pipe", "pipe"],
});

let stdout = "";
let stderr = "";
child.stdout.on("data", (d) => (stdout += d.toString()));
child.stderr.on("data", (d) => (stderr += d.toString()));

child.on("error", (e) => fail(`서버 spawn 실패: ${e.message}`));
child.on("exit", (code) => {
  if (code && code !== 0) {
    fail(`서버가 코드 ${code} 로 조기 종료 (배선 assert 위반 의심)\n${stderr}`);
  }
});

const send = (obj) => child.stdin.write(JSON.stringify(obj) + "\n");
send({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "smoke", version: "0" },
  },
});
send({ jsonrpc: "2.0", method: "notifications/initialized" });
send({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });

// 응답 대기 후 검증
setTimeout(() => {
  const lines = stdout.split("\n").filter(Boolean);
  let listResult = null;
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      if (obj.id === 2 && obj.result) listResult = obj.result;
    } catch {
      /* 부분 라인 무시 */
    }
  }
  child.kill();

  if (!listResult) fail(`tools/list 응답 없음.\nstderr: ${stderr}`);
  const tools = listResult.tools ?? [];
  if (tools.length < EXPECTED_MIN_TOOLS)
    fail(`도구 수 ${tools.length} < 기대 ${EXPECTED_MIN_TOOLS}`);

  const names = tools.map((t) => t.name);
  const dupes = names.filter((n, i) => names.indexOf(n) !== i);
  if (dupes.length) fail(`중복 도구명: ${[...new Set(dupes)].join(", ")}`);

  const noSchema = tools.filter((t) => !t.inputSchema).map((t) => t.name);
  if (noSchema.length) fail(`inputSchema 누락: ${noSchema.join(", ")}`);

  console.log(
    `✅ SMOKE PASS: ${tools.length} tools, 이름 유일, 스키마 완비, 배선 assert 통과`,
  );
  process.exit(0);
}, 2500);
