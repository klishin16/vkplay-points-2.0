export interface IAPIBonus {
    bonus: {
        type: string;
        name: string;
        channelPointAmount: number;
        description: string;
    },
    id: string;
}

export interface IFetchPendingBonusesResponse {
    data: {
        bonuses: IAPIBonus[]
    }
}

export interface IFetchStreamsResponse {
    data: {
        streamBlogs: IFetchStream[];
    }
}

export interface IFetchStream {
    blog: {
        blogUrl: string;
        owner: {
            displayName: string;
            avatarUrl: string;
            nick: string;
            id: number;
            name: string;
        };
        coverUrl: string;
        hasAdultContent: boolean;
        title: string;
    };
    stream: {
        title: string;
        wsStreamChannelPrivate: string;
        isOnline: boolean;
    };
}
