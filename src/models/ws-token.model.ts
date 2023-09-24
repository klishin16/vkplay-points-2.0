import {Column, Entity} from "typeorm";
import {BaseModel} from "./base.model.js";

@Entity()
export class WsTokenModel extends BaseModel {
    @Column()
    token: string;

    @Column()
    clientId: string;

    constructor(token: string, clientId: string) {
        super();
        this.token = token;
        this.clientId = clientId;
    }
}