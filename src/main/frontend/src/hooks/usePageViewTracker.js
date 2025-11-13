// src/hooks/usePageViewTracker.js

import { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import usageMetricsService, {
  recordPageVisit,
  getOrCreateVisitorId
} from '../services/usageMetricsService.js';

const DEFAULT_EXCLUDED_PATHS = ['/login', '/logout', '/error'];

const matchesPattern = (path, pattern) => {
  if (pattern.endsWith('*')) {
    return path.startsWith(pattern.slice(0, -1));
  }
  return path === pattern;
};

const shouldExcludePath = (path, excludeList) => {
  return excludeList.some((pattern) => matchesPattern(path, pattern));
};

const isIncludedPath = (path, includeList) => {
  if (!includeList || includeList.length === 0) {
    return true;
  }
  return includeList.some((pattern) => matchesPattern(path, pattern));
};

/**
 * 라우트 변경을 감지하여 페이지 방문을 백엔드로 전송합니다.
 */
export const usePageViewTracker = ({ enabled = true, exclude = [], include = [] } = {}) => {
  const location = useLocation();
  const lastTrackedPathRef = useRef(null);
  const mergedExcludeList = useMemo(
    () => [...DEFAULT_EXCLUDED_PATHS, ...(Array.isArray(exclude) ? exclude : [])],
    [exclude]
  );
  const includeList = useMemo(
    () => (Array.isArray(include) ? include : []),
    [include]
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const currentPath = location.pathname || '/';
    if (lastTrackedPathRef.current === currentPath) {
      return;
    }

    if (shouldExcludePath(currentPath, mergedExcludeList) || !isIncludedPath(currentPath, includeList)) {
      lastTrackedPathRef.current = currentPath;
      return;
    }

    lastTrackedPathRef.current = currentPath;

    const visitorId = getOrCreateVisitorId();
    recordPageVisit({
      pagePath: currentPath,
      pageTitle: document?.title || null,
      visitorId
    });
  }, [location.pathname, enabled, mergedExcludeList, includeList]);

  return usageMetricsService;
};

export default usePageViewTracker;
