import 'dotenv/config'
import config from "./config";
import { connectToDb } from "./database";
import { AuthModel, AuthTokenModel, WsTokenModel } from "./models";
import { logger } from "./logger";
import { DataSource } from "typeorm";
import { login } from "./login";
import { getWSToken } from "./api";
import { plainToClass } from "class-transformer";
import { startWSEngine } from "./ws";
import { RESCAN_STREAMS_INTERVAL } from "./constants";
import { delay, setIntervalImmediately } from "./helpers";
import { startStreamsScanner, startViewerStatusSender } from "./streams";
import { BotModel } from "./models";


const getBotModel = async (database: DataSource) => {
    const auth_repository = database.getRepository(AuthModel);
    const auth_model = await auth_repository.findOne({ where: {}, order: { id: "DESC" }, relations: ['authToken', 'wsToken'] });
    if (auth_model) {
        logger.log('Auth model was found!', auth_model);
        return auth_model;
    }

    logger.log('No auth models was found so we log in');
    const new_auth_model = new AuthModel();
    const auth_data = await login({
        email: config.email,
        password: config.password
    })
    if (!auth_data) {
        logger.error('Cannot get auth data');
        return;
    }
    new_auth_model.authToken = await database.getRepository(AuthTokenModel).save(plainToClass(AuthTokenModel, auth_data));

    const ws_auth_data = await getWSToken(auth_data.accessToken, auth_data.clientId);
    if (!ws_auth_data) {
        logger.error('Cannot get ws auth data');
        return;
    }
    new_auth_model.wsToken = await database.getRepository(WsTokenModel).save(plainToClass(WsTokenModel, ws_auth_data));
    await auth_repository.save(new_auth_model);

    return new_auth_model;
}

const main = async () => {
    const database = await connectToDb(config);
    const auth_model = await getBotModel(database);
    if (!auth_model) {
        return;
    }

    logger.log('Start WS engine');
    const ws_engine = await startWSEngine(auth_model, database);
    if (!ws_engine) {
        return;
    }
    logger.log('WS engine started successfully');

    const bot = new BotModel(
        database,
        auth_model,
        ws_engine
    )
    startStreamsScanner(bot, RESCAN_STREAMS_INTERVAL);
    await delay(3000);
    startViewerStatusSender(bot);

    setIntervalImmediately(() => bot.printPointsInfo(), 5000);
}

main()
// TODO получить токен по refresh_token
