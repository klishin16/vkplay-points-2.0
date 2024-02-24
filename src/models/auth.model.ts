import { Entity, JoinColumn, OneToOne } from "typeorm"
import { BaseModel } from "./base.model";
import { WsTokenModel } from "./ws-token.model";
import { AuthTokenModel } from "./auth-token.model";

@Entity()
export class AuthModel extends BaseModel {
    @OneToOne(() => AuthTokenModel)
    @JoinColumn()
    authToken: AuthTokenModel;

    @OneToOne(() => WsTokenModel)
    @JoinColumn()
    wsToken: WsTokenModel;
}