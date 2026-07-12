import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/governance';

// Create a single reusable Axios instance
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const useGovernanceApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIssues = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const response = await apiClient.get('/issues');
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to load issues');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPolicies = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const response = await apiClient.get('/policies');
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to load policies');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getScore = useCallback(async (department_id) => {
    setLoading(true); setError(null);
    try {
      const response = await apiClient.get(`/score`, { params: { department_id } });
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to load governance score');
      return { governance_score: 0, breakdown: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  const summarizePolicy = useCallback(async (file) => {
    setLoading(true); setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/ai/summarize-policy', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to summarize policy');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const draftComplianceEmail = useCallback(async (issueId) => {
    setLoading(true); setError(null);
    try {
      const response = await apiClient.post('/ai/compliance-email', { issue_id: issueId });
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to generate email');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchIssues,
    fetchPolicies,
    getScore,
    summarizePolicy,
    draftComplianceEmail
  };
};
