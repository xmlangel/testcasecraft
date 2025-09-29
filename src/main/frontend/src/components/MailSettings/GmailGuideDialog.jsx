// src/components/MailSettings/GmailGuideDialog.jsx
import React, { useState } from 'react';
import { useTranslation } from '../../context/I18nContext';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Alert,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    Link,
    IconButton
} from '@mui/material';
import {
    Google as GoogleIcon,
    Security as SecurityIcon,
    Mail as MailIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    ExpandMore as ExpandMoreIcon,
    Launch as LaunchIcon,
    Help as HelpIcon,
    VpnKey as KeyIcon,
    Settings as SettingsIcon
} from '@mui/icons-material';
import { red, green, orange, blue, grey } from '@mui/material/colors';

const GmailGuideDialog = ({ open, onClose }) => {
    const { t } = useTranslation();
    const [activeStep, setActiveStep] = useState(0);

    const setupSteps = [
        {
            label: t('mail.guide.step1.title', 'Gmail 계정 로그인'),
            description: t('mail.guide.step1.description', 'Gmail 계정에 로그인합니다'),
            content: (
                <Box>
                    <Typography variant="body2" paragraph>
                        {t('mail.guide.step1.instruction1', '1. 웹 브라우저에서 Gmail(')}
                        <Link href="https://mail.google.com" target="_blank" rel="noopener">mail.google.com</Link>
                        {t('mail.guide.step1.instruction1.suffix', ')에 접속합니다.')}
                    </Typography>
                    <Typography variant="body2" paragraph>
                        {t('mail.guide.step1.instruction2', '2. 메일 설정에 사용할 Gmail 계정으로 로그인합니다.')}
                    </Typography>
                    <Alert severity="info" sx={{ mt: 1 }}>
                        <Typography variant="body2">
                            <strong>{t('mail.guide.step1.alert.title', '주의:')}</strong> {t('mail.guide.step1.alert.message', '개인 Gmail 계정만 지원됩니다. G Suite/Google Workspace 계정은 추가 설정이 필요할 수 있습니다.')}
                        </Typography>
                    </Alert>
                </Box>
            )
        },
        {
            label: t('mail.guide.step2.title', 'Google 계정 관리로 이동'),
            description: t('mail.guide.step2.description', '보안 설정을 위해 Google 계정 관리 페이지로 이동합니다'),
            content: (
                <Box>
                    <Typography variant="body2" paragraph>
                        {t('mail.guide.step2.instruction1', '1. Gmail 우상단의 프로필 아이콘을 클릭합니다.')}
                    </Typography>
                    <Typography variant="body2" paragraph>
                        {t('mail.guide.step2.instruction2', '2. "Google 계정 관리" 버튼을 클릭합니다.')}
                    </Typography>
                    <Typography variant="body2" paragraph>
                        {t('mail.guide.step2.instruction3.prefix', '또는 직접 ')}
                        <Link href="https://myaccount.google.com" target="_blank" rel="noopener" sx={{ mx: 0.5 }}>
                            myaccount.google.com
                            <LaunchIcon sx={{ fontSize: 14, ml: 0.5 }} />
                        </Link>
                        {t('mail.guide.step2.instruction3.suffix', '에 접속하세요.')}
                    </Typography>
                </Box>
            )
        },
        {
            label: t('mail.guide.step3.title', '2단계 인증 활성화'),
            description: t('mail.guide.step3.description', '앱 비밀번호 생성을 위해 2단계 인증을 활성화합니다'),
            content: (
                <Box>
                    <Typography variant="body2" paragraph>
                        {t('mail.guide.step3.instruction1', '1. 왼쪽 메뉴에서 "보안"을 클릭합니다.')}
                    </Typography>
                    <Typography variant="body2" paragraph>
                        {t('mail.guide.step3.instruction2', '2. "2단계 인증" 섹션을 찾아 "시작하기"를 클릭합니다.')}
                    </Typography>
                    <Typography variant="body2" paragraph>
                        {t('mail.guide.step3.instruction3', '3. 안내에 따라 휴대폰 번호를 등록하고 인증을 완료합니다.')}
                    </Typography>
                    <Alert severity="warning" sx={{ mt: 1 }}>
                        <Typography variant="body2">
                            <strong>{t('mail.guide.step3.alert.title', '필수 단계:')}</strong> {t('mail.guide.step3.alert.message', '2단계 인증이 활성화되어야 앱 비밀번호를 생성할 수 있습니다.')}
                        </Typography>
                    </Alert>
                </Box>
            )
        },
        {
            label: t('mail.guide.step4.title', '앱 비밀번호 생성'),
            description: t('mail.guide.step4.description', 'TestCase Manager용 앱 비밀번호를 생성합니다'),
            content: (
                <Box>
                    <Typography variant="body2" paragraph>
                        {t('mail.guide.step4.instruction1', '1. "보안" 페이지에서 "앱 비밀번호"를 클릭합니다.')}
                    </Typography>
                    <Typography variant="body2" paragraph>
                        {t('mail.guide.step4.instruction2', '2. "앱 선택" 드롭다운에서 "메일"을 선택합니다.')}
                    </Typography>
                    <Typography variant="body2" paragraph>
                        {t('mail.guide.step4.instruction3', '3. "기기 선택" 드롭다운에서 "기타(맞춤 이름)"을 선택합니다.')}
                    </Typography>
                    <Typography variant="body2" paragraph>
                        {t('mail.guide.step4.instruction4', '4. "TestCase Manager" 라고 입력하고 "생성"을 클릭합니다.')}
                    </Typography>
                    <Typography variant="body2" paragraph>
                        {t('mail.guide.step4.instruction5', '5. 생성된 16자리 비밀번호를 복사합니다.')}
                    </Typography>
                    <Alert severity="success" sx={{ mt: 1 }}>
                        <Typography variant="body2">
                            <strong>{t('mail.guide.step4.alert.title', '중요:')}</strong> {t('mail.guide.step4.alert.message', '생성된 앱 비밀번호는 한 번만 표시됩니다. 안전한 곳에 보관하세요.')}
                        </Typography>
                    </Alert>
                </Box>
            )
        },
        {
            label: t('mail.guide.step5.title', 'TestCase Manager에 설정'),
            description: t('mail.guide.step5.description', '생성한 정보를 TestCase Manager에 입력합니다'),
            content: (
                <Box>
                    <Typography variant="body2" paragraph>
                        {t('mail.guide.step5.instruction1', '1. 메일 설정 다이얼로그에서 다음 정보를 입력합니다:')}
                    </Typography>
                    <List dense>
                        <ListItem>
                            <ListItemIcon>
                                <MailIcon sx={{ fontSize: 16, color: blue[600] }} />
                            </ListItemIcon>
                            <ListItemText
                                primary={t('mail.guide.step5.gmail.address', 'Gmail 주소: your-email@gmail.com')}
                                primaryTypographyProps={{ variant: 'body2' }}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <KeyIcon sx={{ fontSize: 16, color: orange[600] }} />
                            </ListItemIcon>
                            <ListItemText
                                primary={t('mail.guide.step5.app.password', '앱 비밀번호: 16자리 생성된 비밀번호')}
                                primaryTypographyProps={{ variant: 'body2' }}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <SettingsIcon sx={{ fontSize: 16, color: green[600] }} />
                            </ListItemIcon>
                            <ListItemText
                                primary={t('mail.guide.step5.sender.name', '발신자 이름: TestCase Manager (또는 원하는 이름)')}
                                primaryTypographyProps={{ variant: 'body2' }}
                            />
                        </ListItem>
                    </List>
                    <Typography variant="body2" paragraph sx={{ mt: 2 }}>
                        {t('mail.guide.step5.instruction2', '2. "저장" 버튼을 클릭하여 설정을 완료합니다.')}
                    </Typography>
                    <Typography variant="body2" paragraph>
                        {t('mail.guide.step5.instruction3', '3. "테스트 발송" 버튼으로 설정이 올바른지 확인합니다.')}
                    </Typography>
                </Box>
            )
        }
    ];

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    const requirements = [
        { text: t('mail.guide.requirements.gmail', 'Gmail 계정 (@gmail.com)'), icon: <GoogleIcon />, color: red[500] },
        { text: t('mail.guide.requirements.twoFactor', '2단계 인증 활성화'), icon: <SecurityIcon />, color: orange[600] },
        { text: t('mail.guide.requirements.appPassword', '앱 비밀번호 생성'), icon: <KeyIcon />, color: green[600] },
        { text: t('mail.guide.requirements.https', 'HTTPS 연결'), icon: <SecurityIcon />, color: blue[600] }
    ];

    const troubleshootingItems = [
        {
            question: t('mail.troubleshoot.q1', '앱 비밀번호를 생성할 수 없어요'),
            answer: t('mail.troubleshoot.a1', '2단계 인증이 활성화되어 있는지 확인하세요. 2단계 인증 없이는 앱 비밀번호를 생성할 수 없습니다.')
        },
        {
            question: t('mail.troubleshoot.q2', '메일 발송이 실패해요'),
            answer: t('mail.troubleshoot.a2', '앱 비밀번호를 정확히 입력했는지 확인하세요. 공백 없이 16자리를 모두 입력해야 합니다.')
        },
        {
            question: t('mail.troubleshoot.q3', '일반 비밀번호로 안 되나요?'),
            answer: t('mail.troubleshoot.a3', '보안상의 이유로 Gmail 계정의 일반 비밀번호는 사용할 수 없습니다. 반드시 앱 비밀번호를 사용해야 합니다.')
        },
        {
            question: t('mail.troubleshoot.q4', 'G Suite 계정도 사용할 수 있나요?'),
            answer: t('mail.troubleshoot.a4', 'G Suite/Google Workspace 계정은 관리자 설정에 따라 다를 수 있습니다. 관리자에게 SMTP 사용 권한을 확인하세요.')
        }
    ];

    const securityWarnings = [
        t('mail.security.warning1', '앱 비밀번호는 Gmail 계정 비밀번호와 동일한 권한을 가집니다.'),
        t('mail.security.warning2', '앱 비밀번호를 다른 사람과 공유하지 마세요.'),
        t('mail.security.warning3', '필요하지 않은 앱 비밀번호는 정기적으로 삭제하세요.'),
        t('mail.security.warning4', '의심스러운 활동이 감지되면 즉시 앱 비밀번호를 삭제하세요.'),
        t('mail.security.warning5', '정기적으로 Google 계정의 보안 활동을 검토하세요.')
    ];

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md" 
            fullWidth
            scroll="paper"
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
                <GoogleIcon sx={{ mr: 1, color: red[500] }} />
                {t('mail.guide.dialog.title', 'Gmail 앱 비밀번호 설정 가이드')}
            </DialogTitle>
            
            <DialogContent dividers>
                {/* 요구사항 */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        {t('mail.guide.requirements.header', '📋 필수 요구사항')}
                    </Typography>
                    <List dense>
                        {requirements.map((req, index) => (
                            <ListItem key={index}>
                                <ListItemIcon>
                                    <Box sx={{ color: req.color }}>
                                        {req.icon}
                                    </Box>
                                </ListItemIcon>
                                <ListItemText primary={req.text} />
                            </ListItem>
                        ))}
                    </List>
                </Box>

                {/* 단계별 설정 가이드 */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        {t('mail.guide.sections.stepGuide', '🔧 단계별 설정 방법')}
                    </Typography>
                    <Stepper activeStep={activeStep} orientation="vertical">
                        {setupSteps.map((step, index) => (
                            <Step key={step.label}>
                                <StepLabel>
                                    <Typography variant="subtitle1">
                                        {step.label}
                                    </Typography>
                                </StepLabel>
                                <StepContent>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {step.description}
                                    </Typography>
                                    {step.content}
                                    <Box sx={{ mt: 2 }}>
                                        <Button
                                            variant="contained"
                                            onClick={handleNext}
                                            sx={{ mr: 1 }}
                                            size="small"
                                            disabled={index === setupSteps.length - 1}
                                        >
                                            {index === setupSteps.length - 1 ? t('mail.guide.button.complete', '완료') : t('mail.guide.button.next', '다음')}
                                        </Button>
                                        <Button
                                            disabled={index === 0}
                                            onClick={handleBack}
                                            sx={{ mr: 1 }}
                                            size="small"
                                        >
                                            {t('mail.guide.button.previous', '이전')}
                                        </Button>
                                    </Box>
                                </StepContent>
                            </Step>
                        ))}
                    </Stepper>

                    {activeStep === setupSteps.length && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                {t('mail.message.setupComplete', '모든 설정이 완료되었습니다! 이제 TestCase Manager에서 메일 기능을 사용할 수 있습니다.')}
                            </Typography>
                            <Button size="small" onClick={handleReset} sx={{ mt: 1 }}>
                                {t('mail.guide.button.reset', '다시 보기')}
                            </Button>
                        </Alert>
                    )}
                </Box>

                {/* 문제 해결 */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        {t('mail.guide.sections.troubleshooting', '🔍 문제 해결')}
                    </Typography>
                    {troubleshootingItems.map((item, index) => (
                        <Accordion key={index}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="subtitle2">
                                    {item.question}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="body2" color="text.secondary">
                                    {item.answer}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>

                {/* 보안 주의사항 */}
                <Box>
                    <Typography variant="h6" gutterBottom>
                        {t('mail.guide.sections.security', '🔒 보안 주의사항')}
                    </Typography>
                    <Alert severity="warning">
                        <List dense>
                            {securityWarnings.map((warning, index) => (
                                <ListItem key={index} sx={{ pl: 0 }}>
                                    <ListItemIcon>
                                        <WarningIcon sx={{ fontSize: 16, color: orange[600] }} />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={warning}
                                        primaryTypographyProps={{ variant: 'body2' }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Alert>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} variant="contained">
                    {t('mail.guide.button.close', '닫기')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default GmailGuideDialog;