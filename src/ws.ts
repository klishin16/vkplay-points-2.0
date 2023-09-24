import websocket from 'websocket'
import { logger } from "./logger";
import { IStream, isWSChannelConnect, isWSStreamView, IWSEngine, IWSMessage } from "./types";
import { WS_URL } from "./constants";
import { gatherBonusBox } from "./api";
import { AuthModel } from "./models";
import { DataSource } from "typeorm";
import { StreamModel } from "./models/stream.model";

const { client: ws_client } = websocket;

export const connectToWSServer = (url: string) => new Promise<websocket.connection>((resolve, reject) => {
    const client = new ws_client();

    client.on('connectFailed', function (error) {
        reject(error.toString());
    });

    client.on('connect', function (connection) {
        resolve(connection)
    });

    client.connect(url, undefined, undefined, {
        "Connection": "Upgrade",
        "Upgrade": "websocket",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.3",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
        "Origin": "https://vkplay.live",
        "Host": "pubsub.vkplay.live"
    });
})

export const wsAuthenticate = (connection: websocket.connection, wsToken: string) => {
    const token_message = JSON.stringify({
        params: {
            name: "js",
            token: wsToken
        },
        id: 1
    });
    connection.send(token_message);
}

// eslint-disable-next-line no-async-promise-executor
export const startWSEngine = async (auth: AuthModel, database: DataSource)=> new Promise<IWSEngine | null>(async (resolve, reject) => {
    const ws_channels_map = new Map<string, IStream>();
    try {
        const connection = await connectToWSServer(WS_URL);
        logger.log('WebSocket client connected');

        connection.on('error', function (error) {
            logger.log("Connection Error: " + error.toString());
        });
        connection.on('close', function () {
            logger.log('echo-protocol Connection Closed');
        });
        connection.on('message', function (message) {
            if (message.type === 'utf8') {
                try {
                    const data = JSON.parse(message.utf8Data) as IWSMessage;
                    if (isWSChannelConnect(data)) {
                        logger.log('WS connected or disconnected', data.result)
                        resolve({
                            connectToPrivateChannel,
                            disconnectFromPrivateChannel
                        } as IWSEngine);
                    } else if (isWSStreamView(data)) {
                        const channel = data.result.channel;
                        const inner_data = data.result.data.data;
                        switch (inner_data.type) {
                            case "cp_balance_change":
                                logger.log('WS stream balance change', ws_channels_map.get(channel)?.blogUrl, inner_data.data);
                                const stream_repository = database.getMongoRepository(StreamModel);
                                stream_repository.findOneAndUpdate({ blogUrl: ws_channels_map.get(channel)?.blogUrl }, { $set:  { points: inner_data.data.balance }});
                                break;
                            case "cp_bonus_pending":
                                logger.log('WS stream bonus pending', ws_channels_map.get(channel)?.blogUrl, inner_data.data.bonus);
                                // eslint-disable-next-line no-case-declarations
                                const stream = ws_channels_map.get(channel);
                                if (!stream) {
                                    logger.error(`No stream for wsChannel ${channel}`);
                                    break;
                                }
                                gatherBonusBox(stream, auth.authToken.accessToken, inner_data.data.id);
                                break;
                        }
                    }
                } catch (e: unknown) {
                    logger.error(e as string);
                }
            }
        });

        const connectToPrivateChannel = (stream: IStream) => {
            if (!stream.wsChannelPrivate) {
                return;
            }
            ws_channels_map.set(stream.wsChannelPrivate, stream);
            const message = JSON.stringify({
                params: {
                    channel: stream.wsChannelPrivate
                },
                id: 1,
                method: 1
            });
            connection.send(message);
        }

        const disconnectFromPrivateChannel = (stream: IStream) => {
            if (!stream.wsChannelPrivate) {
                return;
            }
            ws_channels_map.delete(stream.wsChannelPrivate);
            const message = JSON.stringify({
                params: {
                    channel: stream.wsChannelPrivate
                },
                id: 1,
                method: 2
            });
            connection.send(message);
        }

        wsAuthenticate(connection, auth.wsToken.token);
    } catch (e: unknown) {
        logger.error(e as string)
        reject(null);
    }
})
