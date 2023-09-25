import { Column, Entity, OneToMany } from "typeorm";
import { BaseModel } from "./base.model";
import { IStream } from "../types";
import { PointsTargetModel } from "./points-target.model";

@Entity()
export class StreamModel extends BaseModel implements Partial<IStream> {
    @Column()
    name: string;

    @Column()
    blogUrl: string;

    @OneToMany(() => PointsTargetModel, (points_target) => points_target.id)
    targets: PointsTargetModel[];

    @Column('integer', { default: 0 })
    points: number;
}
