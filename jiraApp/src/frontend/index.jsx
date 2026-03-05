import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text, Heading, Stack, Button, useProductContext } from '@forge/react';
import { invoke } from '@forge/bridge';

const App = () => {
  const context = useProductContext();
  const issueKey = context?.extension?.issue?.key;

  const [serverUrl, setServerUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 서버 URL만 가져옵니다. API 키는 서버사이드(index.js)에서만 처리됩니다.
    invoke('get-config').then((data) => {
      if (data && data.url) {
        setServerUrl(data.url);
      }
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  const handleOpenTestResult = async () => {
    if (!issueKey || !serverUrl) return;

    setRedirecting(true);
    setError(null);

    try {
      // Forge 서버사이드에서 X-API-KEY 헤더로 임시 토큰을 발급받습니다.
      // API 키는 브라우저에 절대 전달되지 않습니다.
      const result = await invoke('request-redirect-token');

      if (!result || !result.token) {
        throw new Error('임시 토큰을 받지 못했습니다.');
      }

      const baseUrl = result.serverUrl || (serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl);
      // 임시 토큰만 URL에 포함됩니다. API 키는 포함되지 않습니다.
      const redirectUrl = `${baseUrl}/jira-redirect/${issueKey}?token=${result.token}`;

      // Forge UI Kit에서 새 탭 열기
      window.open(redirectUrl, '_blank');
    } catch (e) {
      console.error('리다이렉트 토큰 발급 오류:', e);
      setError('테스트 결과 페이지를 열 수 없습니다. 관리자에게 문의하세요.');
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
