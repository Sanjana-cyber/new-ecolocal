// Central API URL — reads from .env (VITE_API_URL)
// For local dev: set VITE_API_URL=http://localhost:5000 in client/.env
// For production: set VITE_API_URL=https://new-ecolocal-2.onrender.com
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_URL;
