import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text, Textfield, Button, Stack, Heading } from '@forge/react';
import { invoke } from '@forge/bridge';

const App = () => {
    const [url, setUrl] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        invoke('get-config').then((data) => {
            if (data) {
                setUrl(data.url || '');
                setApiKey(data.apiKey || '');
            }
        }).catch(e => {
            console.error(e);
            setError('설정을 불러오는데 실패했습니다.');
        });
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setSaved(false);
        setError(null);
        
        try {
            await invoke('save-config', { url, apiKey });
            setSaved(true);
        } catch (e) {
            console.error(e);
            setError('설정 저장 중 오류가 발생했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Stack space="space.200">
            <Heading size="medium">Testcasecraft 서버 설정</Heading>
            
            {error && (
                <Text color="color.text.danger">{error}</Text>
            )}
            
            {saved && (
                <Text color="color.text.success">설정이 성공적으로 저장되었습니다!</Text>
            )}

            <Textfield 
                label="Testcasecraft 서버 URL" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                placeholder="http://tc.skaiworldwide.co.kr:8080"
            />
            
            <Textfield 
                label="서비스 API Key" 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)} 
                type="password"
                placeholder="백엔드에서 발급받은 키를 입력하세요"
            />
            
            <Button 
                appearance="primary" 
                onClick={handleSave}
                isLoading={isSaving}
            >
                설정 저장하기
            </Button>
            
            <Text size="small" color="color.text.subtle">
                URL은 마지막 슬래시(/) 없이 입력해 주세요. 발급받은 API 키는 암호화되어 안전하게 저장됩니다.
            </Text>
        </Stack>
    );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
