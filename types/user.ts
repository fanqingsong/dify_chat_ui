import { Session } from 'next-auth';

// 扩展 Next Auth 的 Session 类型
declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            isAdmin: boolean;
            roles?: UserRole[] | null;
        };
    }

    interface User {
        isAdmin: boolean;
        roles?: UserRole[] | null;
    }
}

// 用户登录请求
export interface LoginRequest {
    email: string;
    password: string;
}

// 用户注册请求
export interface RegisterRequest {
    name?: string;
    email: string;
    password: string;
    username?: string;
}

// 认证响应
export interface AuthResponse {
    user: User;
    token: string;
}

// 认证状态
export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

// 用户角色关联
export interface UserRole {
    id: string;
    userId: string;
    roleId: string;
    role?: Role | null;
    createdAt?: Date;
}

// 用户模型
export interface User {
    id: string;
    username?: string | null;  // 兼容nextauth-adapter
    name?: string | null;
    email?: string | null;
    image?: string | null;
    avatar?: string | null;    // 兼容nextauth-adapter
    isAdmin: boolean;
    isActive?: boolean;
    roles?: UserRole[] | null;
    createdAt?: Date;
    updatedAt?: Date;
}

// 角色模型
export interface Role {
    id: string;
    name: string;
    description?: string | null;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// 用户管理请求
export interface UserManagementRequest {
    userId: string;
    roleIds?: string[];
    isActive?: boolean;
    password?: string;
}

// 角色管理请求
export interface RoleManagementRequest {
    id?: string;
    name: string;
    description?: string;
    isActive: boolean;
} 