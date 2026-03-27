import React, { useEffect, useState } from "react";
import ForgeReconciler, {
  Text,
  Heading,
  Stack,
  Button,
  useProductContext,
} from "@forge/react";
import { invoke, router } from "@forge/bridge";
import { t } from "./i18n";

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
    invoke("get-config")
      .then((data) => {
        if (data && data.url) {
          setServerUrl(data.url);
          setApiKey(data.apiKey);
        }
        setLoading(false);
      })
      .catch((e) => {
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
      const baseUrl = serverUrl.endsWith("/")
        ? serverUrl.slice(0, -1)
        : serverUrl;

      const response = await fetch(
        `${baseUrl}/api/service-api-keys/redirect-token`,
        {
          method: "POST",
          headers: {
            "X-API-KEY": apiKey,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`임시 토큰 발급 실패: ${response.status}`);
      }

      const result = await response.json();

      if (!result || !result.token) {
        throw new Error("임시 토큰을 받지 못했습니다.");
      }

      // 임시 토큰만 URL에 포함됩니다. API 키는 포함되지 않습니다.
      const redirectUrl = `${baseUrl}/jira-redirect/${issueKey}?token=${result.token}`;

      // Forge UI Kit에서 새 탭 열기 (router 사용)
      router.open(redirectUrl);
    } catch (e) {
      console.error("리다이렉트 토큰 발급 오류:", e);
      setError(t("index.error.redirect"));
    } finally {
      setRedirecting(false);
    }
  };

  if (!issueKey || loading) {
    return (
      <Stack>
        <Text>{t("index.loading")}</Text>
      </Stack>
    );
  }

  if (!serverUrl) {
    return (
      <Stack>
        <Text>{t("index.error.notConfigured")}</Text>
      </Stack>
    );
  }

  return (
    <Stack space="space.100">
      <Heading as="h3">{t("index.title")}</Heading>
      <Text>{t("index.description", { issueKey })}</Text>
      {error && <Text color="color.text.danger">{error}</Text>}
      <Button onClick={handleOpenTestResult} isDisabled={redirecting}>
        {redirecting ? t("index.button.connecting") : t("index.button.open")}
      </Button>
      <Text size="small" color="color.text.subtle">
        {t("index.footer.hint")}
      </Text>
    </Stack>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
