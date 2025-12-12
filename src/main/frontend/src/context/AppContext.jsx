// src/context/AppContext.jsx
import React, { createContext, useContext } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { ProjectProvider, useProject } from './ProjectContext';
import { TestProvider, useTest } from './TestContext';
import { JiraProvider, useJira } from './JiraContext';
import { InputModeProvider, useInputMode } from './InputModeContext';

// --- Backward Compatibility Types ---
export const ActionTypes = {
  // Keeping these for backward compatibility if imported elsewhere
  SET_PROJECTS: 'SET_PROJECTS',
  SET_PROJECTS_LOADING: 'SET_PROJECTS_LOADING',
  SET_ACTIVE_PROJECT: 'SET_ACTIVE_PROJECT',
  ADD_PROJECT: 'ADD_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
  ADD_TESTCASE: 'ADD_TESTCASE',
  UPDATE_TESTCASE: 'UPDATE_TESTCASE',
  DELETE_TESTCASE: 'DELETE_TESTCASE',
  SET_ACTIVE_TESTCASE: 'SET_ACTIVE_TESTCASE',
  ADD_TESTPLAN: 'ADD_TESTPLAN',
  UPDATE_TESTPLAN: 'UPDATE_TESTPLAN',
  DELETE_TESTPLAN: 'DELETE_TESTPLAN',
  SET_ACTIVE_TESTPLAN: 'SET_ACTIVE_TESTPLAN',
  ADD_TESTEXECUTION: 'ADD_TESTEXECUTION',
  UPDATE_TESTEXECUTION: 'UPDATE_TESTEXECUTION',
  DELETE_TESTEXECUTION: 'DELETE_TESTEXECUTION',
  SET_ACTIVE_TESTEXECUTION: 'SET_ACTIVE_TESTEXECUTION',
  START_TESTEXECUTION: 'START_TESTEXECUTION',
  COMPLETE_TESTEXECUTION: 'COMPLETE_TESTEXECUTION',
  UPDATE_TESTRESULT: 'UPDATE_TESTRESULT',
  SET_TESTCASES: 'SET_TESTCASES',
  SET_TEST_PLANS: 'SET_TEST_PLANS',
  SET_TESTPLANS_LOADING: 'SET_TESTPLANS_LOADING',
  SET_TEST_EXECUTIONS: 'SET_TEST_EXECUTIONS',
  SET_JIRA_SERVER_URL: 'SET_JIRA_SERVER_URL',
  SET_TESTCASES_LOADING: 'SET_TESTCASES_LOADING',
};

const AppContext = createContext();

const AppConsumerProvider = ({ children }) => {
  const auth = useAuth();
  const project = useProject();
  const test = useTest();
  const jira = useJira();
  const inputModeContext = useInputMode();

  const value = {
    ...auth,
    ...project,
    ...test,
    ...jira,
    ...inputModeContext,
    // Dispatch shim for backward compatibility
    dispatch: (action) => {
      console.warn('[AppContext] dispatch is deprecated. Use specific context actions instead.', action);
    }
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

import { SchedulerProvider } from './SchedulerContext';
import { LlmConfigProvider } from './LlmConfigContext';
import { RAGProvider } from './RAGContext';

// ...

export const AppProvider = ({ children }) => {
  return (
    <AuthProvider>
      <ProjectProvider>
        <TestProvider>
          <JiraProvider>
            <InputModeProvider>
              <AppConsumerProvider>
                <SchedulerProvider>
                  <LlmConfigProvider>
                    <RAGProvider>
                      {children}
                    </RAGProvider>
                  </LlmConfigProvider>
                </SchedulerProvider>
              </AppConsumerProvider>
            </InputModeProvider>
          </JiraProvider>
        </TestProvider>
      </ProjectProvider>
    </AuthProvider>
  );
};

export const useAppContext = () => useContext(AppContext);
export default AppContext;
