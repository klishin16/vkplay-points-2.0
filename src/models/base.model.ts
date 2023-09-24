import { ObjectId, ObjectIdColumn } from "typeorm";

export class BaseModel {
    @ObjectIdColumn()
    id: ObjectId
}