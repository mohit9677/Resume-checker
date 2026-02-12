import axios from 'axios'

// Use environment variable for production, fallback to proxy for development
const baseURL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
    : '/api'

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
})

// API endpoints
export const candidateAPI = {
    checkDuplicate: (email) => api.post('/candidates/check-duplicate', { email }),
}

export const otpAPI = {
    send: (email) => api.post('/otp/send', { email }),
    verify: (email, otp) => api.post('/otp/verify', { email, otp }),
}

export const applicationAPI = {
    submit: (formData) => {
        return axios.post(`${baseURL}/applications/submit`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    }
}

export default api
