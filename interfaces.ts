export interface Player {
    user: string;
    captain?: boolean;
    priority?: number;
}

export interface User {
    name: string;
    lvl: number;
}

export interface Map {
    name: string;
    count: string;
}

export interface Team {
    name: string;
    tier: number;
}