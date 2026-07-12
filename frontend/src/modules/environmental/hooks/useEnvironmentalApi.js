import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/environment';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const useEnvironmentalApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getDashboardData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiClient.get('/dashboard');
      return res.data;
    } catch (err) {
      setError('Failed to load dashboard data');
      return { total_emissions: 0, monthly_emissions: 0, department_score: 0, goals_achieved: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  const getTransactions = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiClient.get('/transactions');
      return res.data;
    } catch (err) {
      setError('Failed to load transactions');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const importInvoice = useCallback(async (file) => {
    setLoading(true); setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    } catch (err) {
      setError('Failed to import invoice via AI');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, getDashboardData, getTransactions, importInvoice };
};
