import { IBot, IStream, IWSEngine } from "../types";
import { AuthModel } from "./auth.model";
import { DataSource } from "typeorm";
import kleur from "kleur";
import cliTable from "../helpers/cli-table";
import { StreamModel } from "./stream.model";

export class BotModel implements IBot {
    auth: AuthModel;
    database: DataSource;
    streams_map: Map<string, IStream>;
    ws_engine: IWSEngine;

    constructor(database: DataSource, auth: AuthModel, ws_engine: IWSEngine) {
        this.database = database;
        this.auth = auth;
        this.ws_engine = ws_engine;
        this.streams_map = new Map<string, IStream>();
    }

    public async printPointsInfo() {
        const data = await this.database.getRepository(StreamModel).find();
        const options = {
            columns: [
                { field: "index", name: kleur.white("ID") },
                { field: "name", name: kleur.cyan("Streamer") },
                { field: "points", name: kleur.magenta("Points") }
            ]
        };
        const table_data = data.map(({ name, points }, index) => ({ index, name, points: points ?? '-' }))
        const table = cliTable(table_data, options);
        console.log(table);
    }
}