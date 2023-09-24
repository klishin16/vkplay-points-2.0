import {Column, Entity} from "typeorm";
import {BaseModel} from "./base.model";
import {IStream} from "../types";
import {PointsTargetModel} from "./points-target.model";

@Entity()
export class StreamModel extends BaseModel implements Partial<IStream> {
    @Column()
    name: string;

    @Column()
    blogUrl: string;

    @Column(() => PointsTargetModel)
    targets: PointsTargetModel[];

    @Column('number', { default: 0 })
    points: number;
}
