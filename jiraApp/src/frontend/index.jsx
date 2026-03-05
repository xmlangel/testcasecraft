import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text, Heading, Stack, Link, useProductContext } from '@forge/react';
import { invoke } from '@forge/bridge';

const App = () => {
  const context = useProductContext();
  const issueKey = context?.extension?.issue?.key;
  
  const [serverUrl, setServerUrl] = useState(null);
  const [apiKey, setApiKey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoke('get-config').then((data) => {
      if (data) {
        setServerUrl(data.url);
        setApiKey(data.apiKey);
      }
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  if (!issueKey || loading) {
    return (
      <Stack>
        <Text>이슈 정보 및 설정을 불러오는 중입니다...</Text>
      </Stack>
    );
  }

  if (!serverUrl || !apiKey) {
    return (
      <Stack>
        <Text>앱 설정이 완료되지 않았습니다. 관리자에게 문의하여 Testcasecraft 앱 설정을 진행해주세요.</Text>
      </Stack>
    );
  }
  
  // URL 조립 (맨 마지막 슬래시 제거 후 붙임)
  const baseUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
  const redirectUrl = `${baseUrl}/jira-redirect/${issueKey}?apiKey=${apiKey}`;

  return (
    <Stack space="space.100">
      <Heading as="h3">테스트 관리</Heading>
      <Text>현재 이슈({issueKey})와 연결된 테스트 케이스를 확인하거나 결과를 입력할 수 있습니다.</Text>
      <Link 
        href={redirectUrl}
        openNewTab={true}
      >
        테스트 결과 확인 및 입력 (바로가기)
      </Link>
      <Text size="small" color="color.text.subtle">이동 시 서비스 API 키를 통해 자동 인증됩니다.</Text>
    </Stack>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
