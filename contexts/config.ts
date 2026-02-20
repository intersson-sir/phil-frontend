// API configuration for Phil CRM

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false'; // Default to true for development
