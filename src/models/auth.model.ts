import { Column, Entity } from "typeorm"
import { BaseModel } from "./base.model.js";
import { WsTokenModel } from "./ws-token.model.js";
import { AuthTokenModel } from "./auth-token.model.js";

@Entity()
export class AuthModel extends BaseModel {
    @Column(() => AuthTokenModel)
    authToken: AuthTokenModel;

    @Column(() => WsTokenModel)
    wsToken: WsTokenModel;
}