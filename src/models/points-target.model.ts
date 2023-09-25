import { Column, Entity, ManyToOne } from "typeorm";
import {BaseModel} from "./base.model";
import {IPointsTarget} from "../types";
import { StreamModel } from "./stream.model";

@Entity()
export class PointsTargetModel extends BaseModel implements IPointsTarget {
    @Column()
    points: number;

    @Column()
    gold: number;

    @ManyToOne(() => StreamModel, (stream) => stream.id)
    stream: StreamModel
}
