import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const labProgressService = {
    /**
     * Get progress for all labs for the current user
     */
    getAll: async () => {
        try {
            const response = await axios.get(`${API_URL}/lab-progress`, getHeaders());
            return response.data;
        } catch (error) {
            console.error('Error fetching lab progress:', error);
            throw error;
        }
    },

    /**
     * Get progress for a specific lab
     */
    getOne: async (labId) => {
        try {
            const response = await axios.get(`${API_URL}/lab-progress/${labId}`, getHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error fetching progress for lab ${labId}:`, error);
            throw error;
        }
    },

    /**
     * Update progress for a lab
     * @param {string} labId 
     * @param {string} phase - intro | learn | practice | completed
     * @param {number} score - optional score to update best_score
     */
    update: async (labId, phase, score = null) => {
        try {
            const response = await axios.post(`${API_URL}/lab-progress`, {
                lab_id: labId,
                phase,
                score
            }, getHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error updating progress for lab ${labId}:`, error);
            throw error;
        }
    }
};
