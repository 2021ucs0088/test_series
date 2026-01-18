export interface User {
    id: string;
    username: string;
    email: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupCredentials {
    username: string;
    email: string;
    password: string;
}