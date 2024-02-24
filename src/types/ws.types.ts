import { IAPIBonus, IAPIDrop } from "./api.types.js";
import {IStream} from "./types.js";
import websocket from "websocket";

interface IWSChannelConnect {
    id: number,
    result: {
        client: string;
        version: string;
        expires: boolean;
        ttl: number;
    } | NonNullable<unknown>
}

interface IWSStreamView {
    result: {
        channel: string;
        data: {
            data: IWSBalanceChange | IWSBonusPending | IWSDropProgress;
            offset: number;
        }
    }
}

interface IWSBonusPending {
    type: 'cp_bonus_pending';
    data: IAPIBonus;
}

interface IWSBalanceChange {
    type: 'cp_balance_change';
    data: {
        reason: {
            type: string;
            bonus: never;
        };
        delta: number;
        balance: number;
    }
}

interface IWSDropProgress {
    type: 'drop_campaign_progress';
    data: {
        dropProgresses: IAPIDrop[]
    };
}


export type IWSMessage = IWSChannelConnect | IWSStreamView

export const isWSChannelConnect = (p: IWSMessage): p is IWSChannelConnect => !!(p as IWSChannelConnect).id;

export const isWSStreamView = (p: IWSMessage): p is IWSStreamView => !!(p as IWSStreamView).result.data;

export interface IWSEngine {
    connectToPrivateChannel: (stream: IStream) => void;
    disconnectFromPrivateChannel: (stream: IStream) => void;
    connection: websocket.connection;
}
