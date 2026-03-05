import Resolver from '@forge/resolver';
import { kvs } from '@forge/kvs';
import { fetch } from '@forge/api';

const resolver = new Resolver();

resolver.define('save-config', async (req) => {
  const { url, apiKey } = req.payload;
  await kvs.set('server-url', url);
  await kvs.setSecret('api-key', apiKey);
  return true;
});

resolver.define('get-config', async () => {
  const url = await kvs.get('server-url');
  const apiKey = await kvs.getSecret('api-key');
  return { url, apiKey };
});

/**
 * Forge 서버사이드에서 X-API-KEY 헤더로 백엔드에 인증하여 임시 리다이렉트 토큰을 발급받습니다.
 * API 키는 Forge KVS Secret에만 보관되며 클라이언트(브라우저)에 노출되지 않습니다.
 */
resolver.define('request-redirect-token', async () => {
  const serverUrl = await kvs.get('server-url');
  const apiKey = await kvs.getSecret('api-key');

  if (!serverUrl || !apiKey) {
    throw new Error('서버 URL 또는 API 키가 설정되지 않았습니다.');
  }

  const baseUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;

  const response = await fetch(`${baseUrl}/api/service-api-keys/redirect-token`, {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`임시 토큰 발급 실패: ${response.status}`);
  }

  const data = await response.json();
  return { token: data.token, serverUrl: baseUrl };
});

export const handler = resolver.getDefinitions();
