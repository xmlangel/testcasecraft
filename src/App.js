// // src/App.js

// import React, { useState, useEffect } from 'react';
// import {
//   Container,
//   Grid,
//   Paper,
//   Typography,
//   CssBaseline,
//   AppBar,
//   Toolbar,
//   Box,
//   Button,
//   Alert
// } from '@mui/material';

// import { AppProvider, useAppContext } from './context/AppContext';
// import ProjectManager from './components/ProjectManager';
// import ProjectHeader from './components/ProjectHeader';
// import TestCaseTree from './components/TestCaseTree';
// import TestCaseForm from './components/TestCaseForm';
// import TestPlanList from './components/TestPlanList';
// import TestPlanForm from './components/TestPlanForm';
// import TestExecutionList from './components/TestExecutionList';
// import TestExecutionForm from './components/TestExecutionForm';

// const STORAGE_KEY = 'testcase-manager-ui-state';

// function saveUIState(state) {
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
// }

// function loadUIState() {
//   try {
//     const raw = localStorage.getItem(STORAGE_KEY);
//     if (!raw) return {};
//     return JSON.parse(raw);
//   } catch {
//     return {};
//   }
// }

// const AppContent = () => {
//   const { 
//     activeProject, 
//     setActiveProject, 
//     projects 
//   } = useAppContext();

//   // UI 상태를 localStorage에서 복원
//   const uiState = loadUIState();

//   const [tabIndex, setTabIndex] = useState(uiState.tabIndex ?? 0);
//   const [activeTestCaseId, setActiveTestCaseId] = useState(uiState.activeTestCaseId ?? null);
//   const [showTestPlanForm, setShowTestPlanForm] = useState(false);
//   const [editingTestPlanId, setEditingTestPlanId] = useState(null);
//   const [showTestExecutionForm, setShowTestExecutionForm] = useState(false);
//   const [editingTestExecutionId, setEditingTestExecutionId] = useState(null);
//   const [projectSelectionOpen, setProjectSelectionOpen] = useState(
//     !uiState.activeProjectId
//   );
//   const [initialLoad, setInitialLoad] = useState(false);

//   // 프로젝트 목록이 로드되면 localStorage에서 복원된 프로젝트로 이동
//   useEffect(() => {
//     if (projects.length > 0 && !initialLoad) {
//       const { activeProjectId } = uiState;
//       if (activeProjectId) {
//         const project = projects.find((p) => p.id === activeProjectId);
//         if (project) setActiveProject(project.id);
//       }
//       setInitialLoad(true);
//     }
//     // eslint-disable-next-line
//   }, [projects, initialLoad, setActiveProject]);

//   // UI 상태를 localStorage에 저장
//   useEffect(() => {
//     saveUIState({
//       activeProjectId: activeProject ? activeProject.id : null,
//       tabIndex,
//       activeTestCaseId,
//     });
//   }, [activeProject, tabIndex, activeTestCaseId]);

//   // 프로젝트 변경 시 상태 리셋
//   useEffect(() => {
//     if (activeProject) {
//       setTabIndex(0);
//       setActiveTestCaseId(null);
//       setShowTestPlanForm(false);
//       setEditingTestPlanId(null);
//       setShowTestExecutionForm(false);
//       setEditingTestExecutionId(null);
//       setProjectSelectionOpen(false);
//     } else {
//       setProjectSelectionOpen(true);
//     }
//   }, [activeProject]);

//   const handleProjectSelect = (projectId) => {
//     setActiveProject(projectId);
//   };

//   const handleTabChange = (event, newValue) => {
//     setTabIndex(newValue);
//     setActiveTestCaseId(null); // 탭 이동 시 상세화면 초기화
//   };

//   const handleSelectTestCase = (testCase) => {
//     if (testCase) {
//       setActiveTestCaseId(testCase.id);
//     } else {
//       setActiveTestCaseId(null);
//     }
//   };

//   const handleNewTestPlan = () => {
//     setEditingTestPlanId(null);
//     setShowTestPlanForm(true);
//   };

//   const handleEditTestPlan = (testPlanId) => {
//     setEditingTestPlanId(testPlanId);
//     setShowTestPlanForm(true);
//   };

//   const handleCloseTestPlanForm = () => {
//     setShowTestPlanForm(false);
//     setEditingTestPlanId(null);
//   };

//   const handleNewTestExecution = () => {
//     setEditingTestExecutionId(null);
//     setShowTestExecutionForm(true);
//   };

//   const handleViewTestExecution = (testExecutionId) => {
//     setEditingTestExecutionId(testExecutionId);
//     setShowTestExecutionForm(true);
//   };

//   const handleStartExecutionFromPlan = (testPlanId) => {
//     setTabIndex(2); // 실행 탭으로 이동
//     setEditingTestExecutionId(null);
//     setShowTestExecutionForm(true);
//     // TestExecutionForm에서 testPlanId를 처리
//   };

//   const handleCloseTestExecutionForm = () => {
//     setShowTestExecutionForm(false);
//     setEditingTestExecutionId(null);
//   };

//   return (
//     <>
//       <CssBaseline />
//       <AppBar position="static">
//         <Toolbar>
//           <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
//             테스트 관리 시스템
//           </Typography>
//           {activeProject && (
//             <Button 
//               color="inherit" 
//               onClick={() => setProjectSelectionOpen(true)}
//             >
//               프로젝트 변경
//             </Button>
//           )}
//         </Toolbar>
//       </AppBar>

//       <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
//         {projectSelectionOpen ? (
//           <Box sx={{ mt: 3, mb: 3 }}>
//             <Typography variant="h5" gutterBottom>
//               프로젝트 선택
//             </Typography>
//             <ProjectManager onSelectProject={handleProjectSelect} />
//           </Box>
//         ) : (
//           activeProject ? (
//             <>
//               <ProjectHeader 
//                 tabIndex={tabIndex} 
//                 onTabChange={handleTabChange} 
//               />
              
//               {tabIndex === 0 && (
//                 <Grid container spacing={3}>
//                   <Grid item xs={12} md={4}>
//                     <Paper sx={{ p: 2, height: 'calc(100vh - 180px)' }}>
//                       <TestCaseTree 
//                         projectId={activeProject.id}
//                         onSelectTestCase={handleSelectTestCase} 
//                       />
//                     </Paper>
//                   </Grid>
//                   <Grid item xs={12} md={8}>
//                     <TestCaseForm 
//                       projectId={activeProject.id}
//                       testCaseId={activeTestCaseId} 
//                     />
//                   </Grid>
//                 </Grid>
//               )}

//               {tabIndex === 1 && (
//                 <Paper sx={{ p: 2, minHeight: 'calc(100vh - 180px)' }}>
//                   {showTestPlanForm ? (
//                     <TestPlanForm
//                       testPlanId={editingTestPlanId}
//                       onCancel={handleCloseTestPlanForm}
//                       onSave={handleCloseTestPlanForm}
//                     />
//                   ) : (
//                     <TestPlanList
//                       onNewTestPlan={handleNewTestPlan}
//                       onEditTestPlan={handleEditTestPlan}
//                       onStartExecution={handleStartExecutionFromPlan}
//                     />
//                   )}
//                 </Paper>
//               )}

//               {tabIndex === 2 && (
//                 <Paper sx={{ p: 2, minHeight: 'calc(100vh - 180px)' }}>
//                   {showTestExecutionForm ? (
//                     <TestExecutionForm
//                       executionId={editingTestExecutionId}
//                       onCancel={handleCloseTestExecutionForm}
//                       onSave={handleCloseTestExecutionForm}
//                     />
//                   ) : (
//                     <TestExecutionList
//                       onNewExecution={handleNewTestExecution}
//                       onEditExecution={handleViewTestExecution}
//                       onViewExecution={handleViewTestExecution}
//                     />
//                   )}
//                 </Paper>
//               )}
//             </>
//           ) : (
//             <Box sx={{ mt: 3 }}>
//               <Alert severity="info">
//                 프로젝트를 선택하거나 생성해주세요.
//               </Alert>
//             </Box>
//           )
//         )}
//       </Container>
//     </>
//   );
// };

// const App = () => {
//   return (
//     <AppProvider>
//       <AppContent />
//     </AppProvider>
//   );
// };

// export default App;

// src/App.js

import React, { useState } from "react";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { AppProvider } from "./context/AppContext";
import ProjectManager from "./components/ProjectManager";
import Login from "./components/Login";

/**
 * App: 로그인 후 프로젝트 선택화면으로 이동, 실패시 로그인화면 유지
 */
const App = () => {
  const [user, setUser] = useState(null);

  // 로그인 성공시 프로젝트 선택화면으로 이동
  if (!user) {
    return (
      <React.Fragment>
        <CssBaseline />
        <Login onLoginSuccess={setUser} />
      </React.Fragment>
    );
  }

  // 로그인 후: 프로젝트 선택화면
  return (
    <AppProvider>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mt: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {user.username}님, 프로젝트를 선택하세요.
          </Typography>
          <ProjectManager onSelectProject={(projectId) => {
            // 프로젝트 선택시 이후 로직 연결
            // 예: setActiveProject(projectId)
          }} />
        </Box>
      </Container>
    </AppProvider>
  );
};

export default App;

