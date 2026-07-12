import { useState } from 'react';

// Using fetch API for simplicity in hackathon, assuming backend runs on localhost:8000
const API_BASE = 'http://localhost:8000/api/governance';

export const useGovernanceApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIssues = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/issues`);
      if (!res.ok) throw new Error('Failed to fetch issues');
      return await res.json();
    } catch (err) {
      setError(err.message); return [];
    } finally {
      setLoading(false);
    }
  };

  const getScore = async (department_id) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/score?department_id=${department_id}`);
      if (!res.ok) throw new Error('Failed to fetch score');
      return await res.json();
    } catch (err) {
      setError(err.message); return null;
    } finally {
      setLoading(false);
    }
  };
  
  const summarizePolicy = async (file) => {
    setLoading(true); setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/ai/summarize-policy`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to summarize policy');
      return await res.json();
    } catch (err) {
      setError(err.message); return null;
    } finally {
      setLoading(false);
    }
  };
  
  const draftEmail = async (issueId) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/ai/compliance-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue_id: issueId }),
      });
      if (!res.ok) throw new Error('Failed to draft email');
      return await res.json();
    } catch (err) {
      setError(err.message); return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, fetchIssues, getScore, summarizePolicy, draftEmail };
};
