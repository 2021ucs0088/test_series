import axios from 'axios';

const API_URL = 'https://api.testseries.com/auth'; // Replace with your actual API URL

export const login = async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
};

export const signup = async (name: string, email: string, password: string) => {
    const response = await axios.post(`${API_URL}/signup`, { name, email, password });
    return response.data;
};