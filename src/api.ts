import axios, { AxiosError } from "axios"
import { delay } from "./helpers"
import {
    IAPIBonus,
    IFetchPendingBonusesResponse, IFetchPendingDropsResponse,
    IFetchStream,
    IFetchStreamsResponse,
    IStream,
    IWSAuthToken
} from "./types"
import { GET_WS_TOKEN_URL } from "./constants";
import { logger } from "./logger";

export const fetchStreamers = async (token: string, retry: number = 0, maxRetries: number = 3): Promise<IFetchStream[] | void> => {
    return axios.get<IFetchStreamsResponse>('https://api.vkplay.live/v1/user/public_video_stream/subscriptions', {
        headers: {
            "Content-type": "application/json; charset=utf-8",
            'Authorization': `Bearer ${token}`
        },
    })
        .then(response => response.data.data.streamBlogs)
        .catch((e: AxiosError) => {
            if (retry < maxRetries) {
                console.log('Failed load streamers list from API:', e.message, 'retry...')
                return delay((retry + 1) * 1000).then(() => fetchStreamers(token, retry + 1, maxRetries))
            }
        })
}

export const sendViewerAlive = async (token: string, stream: IStream) => {
    return axios.put(`https://api.vkplay.live/v1/blog/${stream.blogUrl}/public_video_stream/heartbeat/viewer`,
        {
            "nextRequestInterval": 60
        }, {
            headers: {
                "Content-type": "application/json; charset=utf-8",
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.data)
        .catch((e: AxiosError) => {
            logger.error(e.status + e.message)
            logger.error(`https://api.vkplay.live/v1/blog/${stream.blogUrl}/public_video_stream/heartbeat/viewer`)
        })
}

export const getWSToken = async (token: string, clientId: string): Promise<IWSAuthToken | null> => {
    return axios.get(GET_WS_TOKEN_URL, {
        headers: {
            "Content-type": "application/json; charset=utf-8",
            "Authorization": `Bearer ${token}`,
            "X-From-Id": clientId,
            "Origin": "https://vkplay.live",
            "Referer": "https://vkplay.live/"
        },
    })
        .then(({data}) =>
            ({
                token: data.token,
                clientId
            } as IWSAuthToken))
        .catch((e: AxiosError) => {
            logger.error(e.message);
            return Promise.resolve(null);
        })
}

export const gatherBonusBox = async (stream: IStream, token: string, bonusBoxId: string) => {
    logger.log('gatherBonusBox', stream.blogUrl)
    await delay(1000); // На всякий случай
    return axios.put(`https://api.vkplay.live/v1/channel/${stream.blogUrl}/point/pending_bonus/${bonusBoxId}/gather`,
        {
            "nextRequestInterval": 60
        }, {
            headers: {
                "Content-type": "application/json; charset=utf-8",
                "Authorization": `Bearer ${token}`,
                "Origin": "https://vkplay.live",
                "Referer": `https://vkplay.live/${stream.blogUrl}`
            }
        })
        .then(response => response.data)
        .catch((e: AxiosError) => {
            logger.error(e.status + e.message)
            logger.error(`https://api.vkplay.live/v1/channel/${stream.blogUrl}/point/pending_bonus/${bonusBoxId}/gather`)
        })
}

export const fetchPendingBonuses = async (stream: IStream, token: string): Promise<IAPIBonus[] | void> => {
    return axios.get<IFetchPendingBonusesResponse>(`https://api.vkplay.live/v1/channel/${stream.blogUrl}/point/pending_bonus/`, {
        headers: {
            "Content-type": "application/json; charset=utf-8",
            "Authorization": `Bearer ${token}`,
            "Referer": `https://vkplay.live/${stream.blogUrl}`
        }
    })
        .then(response => response.data.data.bonuses)
        .catch((e: AxiosError) => {
            logger.error(e.status + e.message)
            logger.error(`https://api.vkplay.live/v1/channel/${stream.blogUrl}/point/pending_bonus/`)
        })
}

export const fetchPendingDropBoxes = async (stream: IStream, token: string): Promise<IFetchPendingDropsResponse> => {
    logger.log('fetchPendingDropBoxes', stream.blogUrl)
    await delay(1000); // На всякий случай
    return axios.get(`https://api.vkplay.live/v1/channel/${stream.blogUrl}/drop_campaign/progress/`,
         {
            headers: {
                "Content-type": "application/json; charset=utf-8",
                "Authorization": `Bearer ${token}`,
                "Origin": "https://vkplay.live",
                "Referer": `https://vkplay.live/app/box/campaigns`
            }
        })
        .then(response => response.data)
        .catch((e: AxiosError) => {
            logger.error(e.status + e.message)
            logger.error(`https://api.vkplay.live/v1/channel/${stream.blogUrl}/drop_campaign/progress/`)
        })
}

export const gatherDropBox = async (stream: IStream, token: string, dropBoxId: number) => {
    logger.log('gatherDropBox', stream.blogUrl)
    await delay(1000); // На всякий случай
    return axios.put(`https://api.vkplay.live/v1/drop_campaign/${dropBoxId}/products_request`,
        {
            "nextRequestInterval": 60
        }, {
            headers: {
                "Content-type": "application/json; charset=utf-8",
                "Authorization": `Bearer ${token}`,
                "Origin": "https://vkplay.live",
                "Referer": `https://vkplay.live/app/box/campaigns`
            }
        })
        .then(response => response.data)
        .catch((e: AxiosError) => {
            logger.error(e.status + e.message)
            logger.error(`https://api.vkplay.live/v1/drop_campaign/${dropBoxId}/products_request`)
        })
}
