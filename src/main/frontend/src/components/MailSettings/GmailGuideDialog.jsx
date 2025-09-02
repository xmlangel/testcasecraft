// src/components/MailSettings/GmailGuideDialog.jsx
import React, { useState } from 'react';
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
    const [activeStep, setActiveStep] = useState(0);

    const setupSteps = [
        {
            label: 'Gmail 계정 로그인',
            description: 'Gmail 계정에 로그인합니다',
            content: (
                <Box>
                    <Typography variant="body2" paragraph>
                        1. 웹 브라우저에서 Gmail(<Link href="https://mail.google.com" target="_blank" rel="noopener">mail.google.com</Link>)에 접속합니다.
                    </Typography>
                    <Typography variant="body2" paragraph>
                        2. 메일 설정에 사용할 Gmail 계정으로 로그인합니다.
                    </Typography>
                    <Alert severity="info" sx={{ mt: 1 }}>
                        <Typography variant="body2">
                            <strong>주의:</strong> 개인 Gmail 계정만 지원됩니다. G Suite/Google Workspace 계정은 추가 설정이 필요할 수 있습니다.
                        </Typography>
                    </Alert>
                </Box>
            )
        },
        {
            label: 'Google 계정 관리로 이동',
            description: '보안 설정을 위해 Google 계정 관리 페이지로 이동합니다',
            content: (
                <Box>
                    <Typography variant="body2" paragraph>
                        1. Gmail 우상단의 프로필 아이콘을 클릭합니다.
                    </Typography>
                    <Typography variant="body2" paragraph>
                        2. "Google 계정 관리" 버튼을 클릭합니다.
                    </Typography>
                    <Typography variant="body2" paragraph>
                        또는 직접 
                        <Link href="https://myaccount.google.com" target="_blank" rel="noopener" sx={{ mx: 0.5 }}>
                            myaccount.google.com
                            <LaunchIcon sx={{ fontSize: 14, ml: 0.5 }} />
                        </Link>
                        에 접속하세요.
                    </Typography>
                </Box>
            )
        },
        {
            label: '2단계 인증 활성화',
            description: '앱 비밀번호 생성을 위해 2단계 인증을 활성화합니다',
            content: (
                <Box>
                    <Typography variant="body2" paragraph>
                        1. 왼쪽 메뉴에서 <strong>"보안"</strong>을 클릭합니다.
                    </Typography>
                    <Typography variant="body2" paragraph>
                        2. "2단계 인증" 섹션을 찾아 <strong>"시작하기"</strong>를 클릭합니다.
                    </Typography>
                    <Typography variant="body2" paragraph>
                        3. 안내에 따라 휴대폰 번호를 등록하고 인증을 완료합니다.
                    </Typography>
                    <Alert severity="warning" sx={{ mt: 1 }}>
                        <Typography variant="body2">
                            <strong>필수 단계:</strong> 2단계 인증이 활성화되어야 앱 비밀번호를 생성할 수 있습니다.
                        </Typography>
                    </Alert>
                </Box>
            )
        },
        {
            label: '앱 비밀번호 생성',
            description: 'TestCase Manager용 앱 비밀번호를 생성합니다',
            content: (
                <Box>
                    <Typography variant="body2" paragraph>
                        1. "보안" 페이지에서 <strong>"앱 비밀번호"</strong>를 클릭합니다.
                    </Typography>
                    <Typography variant="body2" paragraph>
                        2. "앱 선택" 드롭다운에서 <strong>"메일"</strong>을 선택합니다.
                    </Typography>
                    <Typography variant="body2" paragraph>
                        3. "기기 선택" 드롭다운에서 <strong>"기타(맞춤 이름)"</strong>을 선택합니다.
                    </Typography>
                    <Typography variant="body2" paragraph>
                        4. "TestCase Manager" 라고 입력하고 <strong>"생성"</strong>을 클릭합니다.
                    </Typography>
                    <Typography variant="body2" paragraph>
                        5. 생성된 16자리 비밀번호를 복사합니다.
                    </Typography>
                    <Alert severity="success" sx={{ mt: 1 }}>
                        <Typography variant="body2">
                            <strong>중요:</strong> 생성된 앱 비밀번호는 한 번만 표시됩니다. 안전한 곳에 보관하세요.
                        </Typography>
                    </Alert>
                </Box>
            )
        },
        {
            label: 'TestCase Manager에 설정',
            description: '생성한 정보를 TestCase Manager에 입력합니다',
            content: (
                <Box>
                    <Typography variant="body2" paragraph>
                        1. 메일 설정 다이얼로그에서 다음 정보를 입력합니다:
                    </Typography>
                    <List dense>
                        <ListItem>
                            <ListItemIcon>
                                <MailIcon sx={{ fontSize: 16, color: blue[600] }} />
                            </ListItemIcon>
                            <ListItemText 
                                primary="Gmail 주소: your-email@gmail.com"
                                primaryTypographyProps={{ variant: 'body2' }}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <KeyIcon sx={{ fontSize: 16, color: orange[600] }} />
                            </ListItemIcon>
                            <ListItemText 
                                primary="앱 비밀번호: 16자리 생성된 비밀번호"
                                primaryTypographyProps={{ variant: 'body2' }}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <SettingsIcon sx={{ fontSize: 16, color: green[600] }} />
                            </ListItemIcon>
                            <ListItemText 
                                primary="발신자 이름: TestCase Manager (또는 원하는 이름)"
                                primaryTypographyProps={{ variant: 'body2' }}
                            />
                        </ListItem>
                    </List>
                    <Typography variant="body2" paragraph sx={{ mt: 2 }}>
                        2. "저장" 버튼을 클릭하여 설정을 완료합니다.
                    </Typography>
                    <Typography variant="body2" paragraph>
                        3. "테스트 발송" 버튼으로 설정이 올바른지 확인합니다.
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
        { text: 'Gmail 계정 (@gmail.com)', icon: <GoogleIcon />, color: red[500] },
        { text: '2단계 인증 활성화', icon: <SecurityIcon />, color: orange[600] },
        { text: '앱 비밀번호 생성', icon: <KeyIcon />, color: green[600] },
        { text: 'HTTPS 연결', icon: <SecurityIcon />, color: blue[600] }
    ];

    const troubleshootingItems = [
        {
            question: '앱 비밀번호를 생성할 수 없어요',
            answer: '2단계 인증이 활성화되어 있는지 확인하세요. 2단계 인증 없이는 앱 비밀번호를 생성할 수 없습니다.'
        },
        {
            question: '메일 발송이 실패해요',
            answer: '앱 비밀번호를 정확히 입력했는지 확인하세요. 공백 없이 16자리를 모두 입력해야 합니다.'
        },
        {
            question: '일반 비밀번호로 안 되나요?',
            answer: '보안상의 이유로 Gmail 계정의 일반 비밀번호는 사용할 수 없습니다. 반드시 앱 비밀번호를 사용해야 합니다.'
        },
        {
            question: 'G Suite 계정도 사용할 수 있나요?',
            answer: 'G Suite/Google Workspace 계정은 관리자 설정에 따라 다를 수 있습니다. 관리자에게 SMTP 사용 권한을 확인하세요.'
        }
    ];

    const securityWarnings = [
        '앱 비밀번호는 Gmail 계정 비밀번호와 동일한 권한을 가집니다.',
        '앱 비밀번호를 다른 사람과 공유하지 마세요.',
        '필요하지 않은 앱 비밀번호는 정기적으로 삭제하세요.',
        '의심스러운 활동이 감지되면 즉시 앱 비밀번호를 삭제하세요.',
        '정기적으로 Google 계정의 보안 활동을 검토하세요.'
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
                Gmail 앱 비밀번호 설정 가이드
            </DialogTitle>
            
            <DialogContent dividers>
                {/* 요구사항 */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        📋 필수 요구사항
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
                        🔧 단계별 설정 방법
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
                                            {index === setupSteps.length - 1 ? '완료' : '다음'}
                                        </Button>
                                        <Button
                                            disabled={index === 0}
                                            onClick={handleBack}
                                            sx={{ mr: 1 }}
                                            size="small"
                                        >
                                            이전
                                        </Button>
                                    </Box>
                                </StepContent>
                            </Step>
                        ))}
                    </Stepper>

                    {activeStep === setupSteps.length && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                모든 설정이 완료되었습니다! 이제 TestCase Manager에서 메일 기능을 사용할 수 있습니다.
                            </Typography>
                            <Button size="small" onClick={handleReset} sx={{ mt: 1 }}>
                                다시 보기
                            </Button>
                        </Alert>
                    )}
                </Box>

                {/* 문제 해결 */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        🔍 문제 해결
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
                        🔒 보안 주의사항
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
                    닫기
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default GmailGuideDialog;