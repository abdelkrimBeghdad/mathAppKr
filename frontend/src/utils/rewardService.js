import api from '../api/axios';

// Uses the shared `api` axios instance (withCredentials: true) so the
// httpOnly session cookie authenticates this request automatically — no
// manual Authorization header / localStorage token needed.
export const rewardService = {
    /**
     * Claim reward for completing a lab
     * @param {string} labId - The identifier for the lab (e.g., 'expansion-simple')
     * @returns {Promise} - The API response
     */
    claimLabReward: async (labId, verification = null) => {
        try {
            const response = await api.post('/rewards/lab/claim', { lab_id: labId, verification });
            return response.data;
        } catch (error) {
            console.error('Error claiming lab reward:', error);
            throw error;
        }
    }
};
