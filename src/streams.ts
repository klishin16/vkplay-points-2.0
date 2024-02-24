import { EStreamStatus, IBot, IStream, UpdateStreamsInfo } from "./types";
import { printStreamsInfo, printStreamsUpdateInfo, setIntervalImmediately } from "./helpers";
import { fetchPendingBonuses, fetchStreamers, gatherBonusBox, sendViewerAlive } from "./api";
import { logger } from "./logger.js";
import { MAIN_PAGE } from "./constants";
import { clearInterval } from "timers";
import { StreamModel } from "./models/stream.model";

export const scanStreams = async (token: string): Promise<IStream[]> => {
    const data = await fetchStreamers(token);
    if (!data) {
        return []
    }

    return data.map((stream_info) => {

        return {
            name: stream_info.blog.owner.nick,
            url: MAIN_PAGE + stream_info.blog.blogUrl,
            blogUrl: stream_info.blog.blogUrl,
            streamStatus: stream_info.stream ? EStreamStatus.ONLINE : EStreamStatus.OFFLINE,
            wsChannelPrivate: stream_info.stream?.wsStreamChannelPrivate || null
        } as IStream
    })
}

export const startStreamsScanner = (bot: IBot, interval: number) => {

    const interval_id = setIntervalImmediately(async () => {
        const new_streams_data = await scanStreams(bot.auth.authToken.accessToken);
        printStreamsInfo(new_streams_data);
        const update_streams_info = await updateStreams(bot, new_streams_data);
        if (update_streams_info.addedStreams.length || update_streams_info.removedStreams.length) {
            printStreamsUpdateInfo(update_streams_info);
        }
    }, interval)

    return () => clearInterval(interval_id);
}

/**
 * Обновить страницы со стримами (добавить/закрыть)
 * @param bot Bot interface
 * @param streams  новые данные о стримах
 */
export const updateStreams = async (bot: IBot, streams: IStream[]): Promise<UpdateStreamsInfo> => {
    const online_streams = streams.filter(stream => stream.streamStatus === EStreamStatus.ONLINE);
    const offline_streams = streams.filter(stream => stream.streamStatus === EStreamStatus.OFFLINE);

    const added_streams: IStream[] = [];
    const removed_streams: IStream[] = [];

    /** Удаляем завершившиеся трансляции */
    for (const stream of offline_streams) {
        if (bot.streams_map.has(stream.name)) {
            closeStream(bot, stream);
            bot.streams_map.delete(stream.name);
            removed_streams.push(stream);
        }
    }

    /** Добавляем начавшиеся стримы */
    for (const stream of online_streams) {
        if (!bot.streams_map.has(stream.name)) {
            const added_stream = await openStream(bot, stream);
            bot.streams_map.set(stream.name, added_stream);
            added_streams.push(added_stream);
        }
    }

    // Удаляем стримы стримеров, которые были удалены
    const blogs_urls = streams.map(stream => stream.blogUrl);
    bot.streams_map.forEach(stream => {
        if (!blogs_urls.includes(stream.blogUrl)) {
            closeStream(bot, stream);
            removed_streams.push(stream);
            bot.streams_map.delete(stream.blogUrl)
        }
    })

    return {
        addedStreams: added_streams,
        removedStreams: removed_streams
    }
}

const openStream = async (bot: IBot, stream: IStream) => {
    logger.log('Open stream', stream.blogUrl);
    const token = bot.auth.authToken.accessToken;
    const bonuses = await fetchPendingBonuses(stream, token);
    if (!bonuses) {
        return stream;
    }
    for (const bonus of bonuses) {
        await gatherBonusBox(stream, token, bonus.id);
    }

    if (!stream.wsChannelPrivate) {
        return stream;
    }

    bot.ws_engine.connectToPrivateChannel(stream);
    logger.log(`Connect to ${stream.blogUrl}, channel ${stream.wsChannelPrivate}`);

    const stream_repository = bot.database.getRepository(StreamModel);
    const exist_stream = await stream_repository.findOne({ where: { blogUrl: stream.blogUrl } });
    if (!exist_stream) {
        await stream_repository.save({
            name: stream.name,
            blogUrl: stream.blogUrl
        })
    }

    return stream;
}

const closeStream = (bot: IBot, stream: IStream) => {
    bot.ws_engine.disconnectFromPrivateChannel(stream);
    logger.log(`Disconnected from ${stream.blogUrl}, channel ${stream.wsChannelPrivate}`);
}

export const startViewerStatusSender = (bot: IBot) => {
    setIntervalImmediately(() => {
        logger.log('Send viewer status to live streams')
        bot.streams_map.forEach(async (stream) => {
            await sendViewerAlive(bot.auth.authToken.accessToken, stream);
        })
    }, 1000 * 60)
}
