import axios from 'axios';


axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';
// Cookie-session auth (Sanctum SPA mode): no token is ever stored in JS or
// attached manually. withCredentials sends/receives the httpOnly session
// cookie automatically, and axios reads the XSRF-TOKEN cookie Laravel sets
// (via /sanctum/csrf-cookie) and attaches it as the X-XSRF-TOKEN header on
// its own — that's axios's built-in default behavior, no extra code needed.
const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

/**
 * Must be called once before login/register (and is safe to call again any
 * time) so Laravel can issue the XSRF-TOKEN cookie the CSRF-protected
 * POST /login, /register, /logout endpoints require.
 */
export const primeCsrfCookie = () => axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // GET /user is the routine "am I logged in?" check — it 401s for
        // every anonymous visitor by design (that's how initializeAuth
        // in useAuthStore knows there's no session yet). Redirecting on
        // THIS specific 401 caused an instant reload loop on every page
        // load: initializeAuth() → 401 → hard redirect to /login → the
        // login page (or app shell) re-runs initializeAuth() → 401 again.
        // Only force-navigate to /login for 401s on other, already-
        // authenticated requests (e.g. a session that expired mid-use).
        const isAuthCheck = error.config && error.config.url && error.config.url.endsWith('/user');
        if (error.response && error.response.status === 401 && !isAuthCheck) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
