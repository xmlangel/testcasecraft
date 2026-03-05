import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text, Heading, Stack, Button, useProductContext } from '@forge/react';
import { invoke, router } from '@forge/bridge';

const App = () => {
  const context = useProductContext();
  const issueKey = context?.extension?.issue?.key;

  const [serverUrl, setServerUrl] = useState(null);
  const [apiKey, setApiKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 브라우저에서 서버 URL과 API 키를 가져옵니다. 
    // API 키는 URL에 넣지 않고 POST 요청의 헤더에만 사용합니다.
    invoke('get-config').then((data) => {
      if (data && data.url) {
        setServerUrl(data.url);
        setApiKey(data.apiKey);
      }
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  const handleOpenTestResult = async () => {
    if (!issueKey || !serverUrl || !apiKey) return;

    setRedirecting(true);
    setError(null);

    try {
      // Atlassian Forge 백엔드 서버에서 사용자 내부망/로컬 DNS(예: tc.skaiworldwide.co.kr)로
      // 접근 불가한 문제를 피하기 위해, 브라우저가 직접 API 통신을 수행합니다.
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

      const result = await response.json();

      if (!result || !result.token) {
        throw new Error('임시 토큰을 받지 못했습니다.');
      }

      // 임시 토큰만 URL에 포함됩니다. API 키는 포함되지 않습니다.
      const redirectUrl = `${baseUrl}/jira-redirect/${issueKey}?token=${result.token}`;

      // Forge UI Kit에서 새 탭 열기 (router 사용)
      router.open(redirectUrl);
    } catch (e) {
      console.error('리다이렉트 토큰 발급 오류:', e);
      setError('테스트 결과 페이지를 열 수 없습니다. 내부망 접근 문제일 수 있습니다.');
    } finally {
      setRedirecting(false);
    }
  };

  if (!issueKey || loading) {
    return (
      <Stack>
        <Text>이슈 정보 및 설정을 불러오는 중입니다...</Text>
      </Stack>
    );
  }

  if (!serverUrl) {
    return (
      <Stack>
        <Text>앱 설정이 완료되지 않았습니다. 관리자에게 문의하여 Testcasecraft 앱 설정을 진행해주세요.</Text>
      </Stack>
    );
  }

  return (
    <Stack space="space.100">
      <Heading as="h3">테스트 관리</Heading>
      <Text>현재 이슈({issueKey})와 연결된 테스트 케이스를 확인하거나 결과를 입력할 수 있습니다.</Text>
      {error && <Text color="color.text.danger">{error}</Text>}
      <Button
        onClick={handleOpenTestResult}
        isDisabled={redirecting}
      >
        {redirecting ? '연결 중...' : '테스트 결과 확인 및 입력 (바로가기)'}
      </Button>
      <Text size="small" color="color.text.subtle">이동 시 보안 임시 토큰을 통해 자동 인증됩니다.</Text>
    </Stack>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
