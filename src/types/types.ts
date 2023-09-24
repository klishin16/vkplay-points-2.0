import { DataSource } from "typeorm";
import { AuthModel } from "../models";
import { IWSEngine } from "./ws.types";

export interface ICredentials {
    email: string;
    password: string;
}

export interface IPointsTarget {
    points: number;
    gold: number;
}

export interface IStream {
    name: string;
    url: string;
    blogUrl: string;
    wsChannelPrivate: string | null;
    streamStatus: EStreamStatus;
    targets: IPointsTarget[]
}

export enum EStreamStatus {
    ONLINE = 'online',
    OFFLINE = 'offline'
}

export enum EPageStatus {
    OPENED = 'opened',
    CLOSED = 'closed'
}

export interface UpdateStreamsInfo {
    addedStreams: IStream[];
    removedStreams: IStream[];
}

export interface IAuthToken {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
}

export interface IWSAuthToken {
    token: string;
    clientId: string
}

export interface IBot {
    database: DataSource;
    auth: AuthModel;
    streams_map: Map<string, IStream>;
    ws_engine: IWSEngine;
}
