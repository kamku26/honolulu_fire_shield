export interface SystemDefenseProps {
    title: string;
    description: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
}

export type DefenseStatus = 'active' | 'inactive' | 'pending';