import {Column, Entity} from "typeorm";
import {BaseModel} from "./base.model";
import {IPointsTarget} from "../types";

@Entity()
export class PointsTargetModel extends BaseModel implements IPointsTarget {
    @Column()
    points: number;

    @Column()
    gold: number;
}
