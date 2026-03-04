import React from 'react';
import ForgeReconciler, { Text, Heading, Stack, Link } from '@forge/react';

const App = () => {
  return (
    <Stack>
      <Text>아이디 패스워드는 admin/admin123 입니다.</Text>
      <Link 
        href="http://tc.skaiworldwide.co.kr:8080"
        openNewTab={true}
      >
        testcasecraft 접속
      </Link>
    </Stack>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
