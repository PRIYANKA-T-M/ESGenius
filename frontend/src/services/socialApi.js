/**
 * Client service layer managing HTTP API communications with the FastAPI backend.
 * Integrates error handling by checking HTTP response statuses and reading detailed error payloads.
 */
export const socialApi = {
  /**
   * Retrieves list of active challenges.
   */
  async getChallenges() {
    try {
      const res = await fetch('/social/challenges');
      if (!res.ok) throw new Error(`HTTP Error ${res.status}: Failed to retrieve challenges`);
      return await res.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  /**
   * Retrieves top XP rankings.
   */
  async getLeaderboard() {
    try {
      const res = await fetch('/social/leaderboard');
      if (!res.ok) throw new Error(`HTTP Error ${res.status}: Failed to retrieve leaderboard`);
      return await res.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  /**
   * Retrieves all preconfigured system badges.
   */
  async getBadges() {
    try {
      const res = await fetch('/social/badges');
      if (!res.ok) throw new Error(`HTTP Error ${res.status}: Failed to retrieve badges`);
      return await res.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  /**
   * Retrieves full profile metrics, logs, and badge levels for the active employee.
   */
  async getMyProfile(employeeId) {
    try {
      const headers = employeeId ? { 'X-Employee-ID': String(employeeId) } : {};
      const res = await fetch('/social/my-profile', { headers });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}: Failed to retrieve user profile`);
      return await res.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  /**
   * Registers user enrollment in a challenge.
   */
  async joinChallenge(challengeId, employeeId) {
    try {
      const headers = employeeId ? { 'X-Employee-ID': String(employeeId) } : {};
      const formData = new FormData();
      formData.append('challenge_id', challengeId);

      const res = await fetch('/social/join-challenge', {
        method: 'POST',
        headers,
        body: formData
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP Error ${res.status}: Failed to join challenge`);
      }
      return await res.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  /**
   * Uploads multipart image proof file locally.
   */
  async uploadProof(csrActivityId, file, employeeId) {
    try {
      const headers = employeeId ? { 'X-Employee-ID': String(employeeId) } : {};
      const formData = new FormData();
      formData.append('csr_activity_id', csrActivityId);
      formData.append('file', file);

      const res = await fetch('/social/upload-proof', {
        method: 'POST',
        headers,
        body: formData
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP Error ${res.status}: Failed to upload proof image`);
      }
      return await res.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  /**
   * Commands backend to run Gemini Vision audit verification on uploaded proof image.
   */
  async verifyImage(participationId) {
    try {
      const formData = new FormData();
      formData.append('participation_id', participationId);

      const res = await fetch('/social/verify-image', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP Error ${res.status}: Verification failed`);
      }
      return await res.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
};
