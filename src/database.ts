import { IConfig } from "./types";
import { DataSource } from "typeorm";
import { AuthModel, AuthTokenModel, BotModel, WsTokenModel } from "./models";
import { logger } from "./logger";
import { StreamModel } from "./models/stream.model";
import { PointsTargetModel } from "./models/points-target.model";

export const connectToDb = (config: IConfig): Promise<DataSource> => new Promise((resolve, reject) => {
    const data_source = new DataSource({
        type: "sqlite",
        database: config.database,
        entities: [BotModel, AuthTokenModel, WsTokenModel, AuthModel, StreamModel, PointsTargetModel],
        synchronize: true,
        logging: "all"
    });

    data_source.initialize()
        .then(() => {
            logger.log("Database connected successfully")
            // here you can start to work with your database
            resolve(data_source)
        })
        .catch((error) => {
            logger.error(error)
            reject(data_source)
        })
});