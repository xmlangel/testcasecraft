import React from 'react';
import ForgeReconciler, { Text, Heading, Stack, Link, useProductContext } from '@forge/react';

const App = () => {
  const context = useProductContext();
  const issueKey = context?.extension?.issue?.key;

  if (!issueKey) {
    return (
      <Stack>
        <Text>이슈 정보를 불러오는 중입니다...</Text>
      </Stack>
    );
  }

  return (
    <Stack space="space.100">
      <Heading as="h3">테스트 관리</Heading>
      <Text>현재 이슈({issueKey})와 연결된 테스트 케이스를 확인하거나 결과를 입력할 수 있습니다.</Text>
      <Link 
        href={`http://tc.skaiworldwide.co.kr:8080/jira-redirect/${issueKey}`}
        openNewTab={true}
      >
        테스트 결과 확인 및 입력 (바로가기)
      </Link>
      <Text size="small" color="color.text.subtle">계정: admin / admin123</Text>
    </Stack>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
