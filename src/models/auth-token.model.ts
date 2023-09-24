import { Column, Entity } from "typeorm";
import { BaseModel } from "./base.model.js";

@Entity()
export class AuthTokenModel extends BaseModel {
    @Column()
    accessToken: string;

    @Column()
    refreshToken: string;

    @Column()
    expiresAt: Date;

    constructor(accessToken: string, refreshToken: string, expiresAt: Date) {
        super();
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresAt = expiresAt;
    }
}