

import { QueryClient } from 'react-query';
import axios from 'axios';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: Infinity,
        },
    }
});

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000', // Replace with your API base URL

    withCredentials: true // Ensure cookies are sent with requests
    // Add any other axios configurations here
});

export { queryClient, axiosInstance };