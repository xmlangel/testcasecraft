import React from 'react';
import ForgeReconciler, { Text, Heading, Stack, Link } from '@forge/react';

const App = () => {
  return (
    <Stack>
      <Heading size="medium">testcasecraft Jira 연동 확인</Heading>
      <Text>UI Kit 2로 업그레이드하여 렌더링 중입니다.</Text>
      <Text>testcasecraft와 연동 준비가 되었습니다.</Text>
      <Link href="http://tc.skaiworldwide.co.kr:8080/projects/9c1ae80f-b3ca-4546-afca-b8d895ae2908/executions/627d28e6-31cb-4be5-9496-7aa4575b1071">
        testcasecraft 실행 결과 확인
      </Link>
    </Stack>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
