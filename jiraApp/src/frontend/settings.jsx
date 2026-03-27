import React, { useEffect, useState } from "react";
import ForgeReconciler, {
  Text,
  Textfield,
  Button,
  Stack,
  Heading,
} from "@forge/react";
import { invoke } from "@forge/bridge";
import { t } from "./i18n";

const App = () => {
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    invoke("get-config")
      .then((data) => {
        if (data) {
          setUrl(data.url || "");
          setApiKey(data.apiKey || "");
        }
      })
      .catch((e) => {
        console.error(e);
        setError(t("settings.error.load"));
      });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    setError(null);

    try {
      await invoke("save-config", { url, apiKey });
      setSaved(true);
    } catch (e) {
      console.error(e);
      setError(t("settings.error.save"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Stack space="space.200">
      <Heading size="medium">{t("settings.title")}</Heading>

      {error && <Text color="color.text.danger">{error}</Text>}

      {saved && (
        <Text color="color.text.success">{t("settings.success.save")}</Text>
      )}

      <Textfield
        label={t("settings.label.url")}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder={t("settings.placeholder.url")}
      />

      <Textfield
        label={t("settings.label.apiKey")}
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        type="password"
        placeholder={t("settings.placeholder.apiKey")}
      />

      <Button appearance="primary" onClick={handleSave} isLoading={isSaving}>
        {t("settings.button.save")}
      </Button>

      <Text size="small" color="color.text.subtle">
        {t("settings.help.url")}
        {t("settings.help.policy")}
        {t("settings.help.howToGet")}
      </Text>
    </Stack>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
