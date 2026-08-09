import api from '../api/axios';

// Uses the shared `api` axios instance (withCredentials: true) so the
// httpOnly session cookie authenticates these requests automatically.
export const labProgressService = {
    /**
     * Get progress for all labs for the current user
     */
    getAll: async () => {
        try {
            const response = await api.get('/lab-progress');
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
            const response = await api.get(`/lab-progress/${labId}`);
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
            const response = await api.post('/lab-progress', {
                lab_id: labId,
                phase,
                score
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating progress for lab ${labId}:`, error);
            throw error;
        }
    }
};
