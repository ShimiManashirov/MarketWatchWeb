import mongoose, { Document } from 'mongoose';
export interface IComment extends Document {
    content: string;
    owner: mongoose.Types.ObjectId;
    post: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IComment, {}, {}, {}, mongoose.Document<unknown, {}, IComment, {}, mongoose.DefaultSchemaOptions> & IComment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IComment>;
export default _default;
