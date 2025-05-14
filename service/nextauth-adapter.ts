import { signIn, signOut } from 'next-auth/react';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types/user';

// Adapter to convert NextAuth session to your User type
const convertSessionToUser = (session: any): User | null => {
    if (!session || !session.user) return null;

    return {
        id: session.user.id,
        username: session.user.name || '',
        email: session.user.email || '',
        avatar: session.user.image || '',
    };
};

// Login adapter
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    console.log("Login attempt for:", credentials.email);

    try {
        const response = await signIn('credentials', {
            redirect: false,
            email: credentials.email,
            password: credentials.password,
            callbackUrl: window.location.origin,
        });

        console.log("SignIn response:", response);

        if (response?.error) {
            console.error("Login error:", response.error);
            throw new Error(response.error);
        }

        // Get the session after sign-in
        const userSession = await fetch('/api/auth/session');
        const sessionData = await userSession.json();

        console.log("Session data:", sessionData);

        if (!sessionData?.user) {
            console.error("No user in session data");
            throw new Error('Failed to get user session');
        }

        const user = convertSessionToUser(sessionData);

        if (!user) {
            console.error("Failed to convert session to user");
            throw new Error('Failed to get user data');
        }

        console.log("Login successful for user:", user.email);

        // For compatibility with your existing code, we return a token
        // In NextAuth, the token is managed internally through cookies
        return {
            user,
            token: 'next-auth-token', // This is a placeholder, NextAuth manages tokens internally
        };
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
};

// Register adapter
export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
    console.log("Registration attempt for:", userData.email);

    try {
        // 调用注册 API
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: userData.username,
                email: userData.email,
                password: userData.password
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("Registration API error:", error);
            throw new Error(error.error || 'Registration failed');
        }

        console.log("Registration successful, attempting login");

        // 注册成功后自动登录
        return await login({
            email: userData.email,
            password: userData.password
        });
    } catch (error) {
        console.error("Registration failed:", error);
        throw error;
    }
};

// Logout adapter
export const logout = async (): Promise<void> => {
    try {
        console.log("Logout attempt");
        await signOut({ redirect: false });
        console.log("Logout successful");
    } catch (error) {
        console.error("Logout failed:", error);
        throw error;
    }
};

// Get current user adapter
export const getCurrentUser = async (): Promise<AuthResponse> => {
    try {
        console.log("Getting current user");
        const userSession = await fetch('/api/auth/session');
        const sessionData = await userSession.json();

        console.log("Current session data:", sessionData);

        if (!sessionData?.user) {
            console.log("No user in session");
            throw new Error('User not authenticated');
        }

        const user = convertSessionToUser(sessionData);

        if (!user) {
            console.error("Failed to convert session to user");
            throw new Error('Failed to get user data');
        }

        console.log("Current user:", user.email);

        return {
            user,
            token: 'next-auth-token', // This is a placeholder, NextAuth manages tokens internally
        };
    } catch (error) {
        console.error("Get current user failed:", error);
        throw error;
    }
}; 