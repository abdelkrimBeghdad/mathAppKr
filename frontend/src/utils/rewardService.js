import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const rewardService = {
    /**
     * Claim reward for completing a lab
     * @param {string} labId - The identifier for the lab (e.g., 'expansion-simple')
     * @returns {Promise} - The API response
     */
    claimLabReward: async (labId, verification = null) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/rewards/lab/claim`, 
                { lab_id: labId, verification },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error claiming lab reward:', error);
            throw error;
        }
    }
};
