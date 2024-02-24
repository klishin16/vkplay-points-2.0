import { Entity, JoinColumn, OneToOne } from "typeorm"
import { BaseModel } from "./base.model.js";
import { WsTokenModel } from "./ws-token.model.js";
import { AuthTokenModel } from "./auth-token.model.js";

@Entity()
export class AuthModel extends BaseModel {
    @OneToOne(() => AuthTokenModel)
    @JoinColumn()
    authToken: AuthTokenModel;

    @OneToOne(() => WsTokenModel)
    @JoinColumn()
    wsToken: WsTokenModel;
}