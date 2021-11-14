export interface Player {
    name: string;
    guild: string;
    attack: number;
    block: number;
    reaction: number;
    dodge: number;
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