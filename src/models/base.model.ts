import { PrimaryGeneratedColumn } from "typeorm";

export class BaseModel {
    @PrimaryGeneratedColumn()
    id: number;
}