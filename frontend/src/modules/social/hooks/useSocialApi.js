import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/social';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const useSocialApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getChallenges = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiClient.get('/challenges');
      return res.data;
    } catch (err) {
      setError('Failed to load challenges');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getLeaderboard = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiClient.get('/leaderboard');
      return res.data;
    } catch (err) {
      setError('Failed to load leaderboard');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadCSRProof = useCallback(async (employeeId, activityId, file) => {
    setLoading(true); setError(null);
    try {
      const formData = new FormData();
      formData.append('employee_id', employeeId);
      formData.append('activity_id', activityId);
      formData.append('file', file);
      const res = await apiClient.post('/proof', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    } catch (err) {
      setError('Failed to verify image via AI');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, getChallenges, getLeaderboard, uploadCSRProof };
};
