import React from 'react';
import ForgeReconciler, { Text, Heading, Stack } from '@forge/react';

const App = () => {
  return (
    <Stack>
      <Heading size="medium">testcasecraft Jira 연동 확인</Heading>
      <Text>UI Kit 2로 업그레이드하여 렌더링 중입니다.</Text>
      <Text>testcasecraft와 연동 준비가 되었습니다.</Text>
    </Stack>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
