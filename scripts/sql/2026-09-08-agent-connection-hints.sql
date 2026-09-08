-- 에이전트 연동 안내 문구 갱신 (2026-09-08)
--
-- 번역 시드는 **이미 있는 값을 덮지 않는다** — 사용자가 번역 관리 화면에서
-- 고친 문구를 기동할 때마다 지우지 않으려는 설계다. 그래서 새 설치에는 새
-- 문구가 들어가지만 이미 돌던 곳에는 옛 문구가 남는다.
--
-- 이 파일은 그 곳들을 한 번 맞추는 용도다. Flyway 가 꺼져 있어 자동으로
-- 돌지 않으므로 손으로 실행한다.
--
--   docker exec -i <postgres> psql -U <user> -d <db> < scripts/sql/2026-09-08-agent-connection-hints.sql
--
-- 번역을 직접 고쳐 쓰고 있었다면 이 파일을 돌리지 않는다 — 그 수정이 사라진다.

UPDATE translations t SET translation_value = v.val, updated_at = now(), updated_by = 'system'
FROM translation_keys tk, languages l, (VALUES
 ('agentConnection.field.serverUrlHint','ko','제품 서버가 에이전트로 나갈 때 쓰는 주소입니다. 둘 다 도커로 띄웠다면 http://host.docker.internal:8090 을 넣습니다 — 제품도 컨테이너라 localhost 는 자기 자신을 가리킵니다. 제품을 도커 밖에서 돌리면 http://localhost:8090 입니다.'),
 ('agentConnection.field.serverUrlHint','en','The address the product server uses to reach the agent. With both in Docker, use http://host.docker.internal:8090 — the product is a container too, so localhost points at itself. Running the product outside Docker, use http://localhost:8090.'),
 ('agentConnection.field.browserUrlHint','ko','실행 버튼이 여는 주소입니다. 위에 host.docker.internal 을 넣었다면 여기에 http://localhost:8090 을 넣습니다 — 그 이름은 컨테이너 안에서만 풀리고 사람의 브라우저는 알지 못합니다. 두 주소가 같으면 비워 둡니다.'),
 ('agentConnection.field.browserUrlHint','en','The address the run button opens. If you put host.docker.internal above, use http://localhost:8090 here — that name resolves only inside containers and a person''s browser does not know it. Leave empty when both addresses match.'),
 ('agentConnection.field.tokenHint','ko','에이전트 쪽 .env 의 AGENT_API_TOKEN 과 같은 값을 넣습니다. 비워 두면 기존 값을 그대로 쓰고, 저장된 토큰은 화면에 보이지 않습니다.'),
 ('agentConnection.field.tokenHint','en','Use the same value as AGENT_API_TOKEN in the agent''s .env. Leave empty to keep the stored token; it is never shown here.'),
 ('agentConnection.field.defaultProfileHint','ko','에이전트 앱에 등록한 프로필 식별자입니다. 정책과 컨텍스트가 그 안에 있고, 처음 설치하면 local 하나가 들어 있습니다.'),
 ('agentConnection.field.defaultProfileHint','en','The profile identifier registered in the agent app. Its policy and context live there, and a fresh install ships one named local.')
) AS v(key, lang, val)
WHERE t.translation_key_id = tk.id AND t.language_id = l.id
  AND tk.key_name = v.key AND l.code = v.lang;
