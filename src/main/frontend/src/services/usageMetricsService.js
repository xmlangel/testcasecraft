// src/services/usageMetricsService.js

import { getDynamicApiUrl } from '../utils/apiConstants.js';

const VISITOR_STORAGE_KEY = 'tcm-visitor-id';
let API_BASE_URL = null;
let baseUrlPromise = null;

const resolveBaseUrl = async () => {
  if (!baseUrlPromise) {
    baseUrlPromise = getDynamicApiUrl()
      .then((url) => `${url || window.location.origin}/api/monitoring`)
      .catch((error) => {
        console.warn('[usageMetricsService] Falling back to origin for API URL:', error);
        return `${window.location.origin}/api/monitoring`;
      });
  }

  if (!API_BASE_URL) {
    API_BASE_URL = await baseUrlPromise;
  }

  return API_BASE_URL;
};

const buildHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const getOrCreateVisitorId = () => {
  try {
    let visitorId = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (!visitorId) {
      if (window.crypto && window.crypto.randomUUID) {
        visitorId = window.crypto.randomUUID();
      } else {
        visitorId = `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      }
      localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
    }
    return visitorId;
  } catch (error) {
    console.warn('[usageMetricsService] Failed to access localStorage for visitor id:', error);
    return 'anonymous';
  }
};

export const recordPageVisit = async ({ pagePath, pageTitle, visitorId }) => {
  try {
    const baseUrl = await resolveBaseUrl();
    await fetch(`${baseUrl}/usage/page-visits`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({
        pagePath,
        pageTitle,
        visitorId
      })
    });
  } catch (error) {
    console.debug('[usageMetricsService] Unable to record page visit:', error);
  }
};

export const fetchUsageMetrics = async () => {
  const baseUrl = await resolveBaseUrl();
  const response = await fetch(`${baseUrl}/usage/page-visits`, {
    method: 'GET',
    headers: buildHeaders()
  });

  if (!response.ok) {
    throw new Error(`Failed to load usage metrics: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return await response.json();
};

export default {
  recordPageVisit,
  fetchUsageMetrics,
  getOrCreateVisitorId
};
