import mongoose from 'mongoose';
declare const _default: mongoose.Model<{
    username: string;
    email: string;
    image: string;
    refreshTokens: string[];
    password?: string | null | undefined;
}, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    username: string;
    email: string;
    image: string;
    refreshTokens: string[];
    password?: string | null | undefined;
}, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<{
    username: string;
    email: string;
    image: string;
    refreshTokens: string[];
    password?: string | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    username: string;
    email: string;
    image: string;
    refreshTokens: string[];
    password?: string | null | undefined;
}, mongoose.Document<unknown, {}, {
    username: string;
    email: string;
    image: string;
    refreshTokens: string[];
    password?: string | null | undefined;
}, {
    id: string;
}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & Omit<{
    username: string;
    email: string;
    image: string;
    refreshTokens: string[];
    password?: string | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    [path: string]: mongoose.SchemaDefinitionProperty<undefined, any, any>;
} | {
    [x: string]: mongoose.SchemaDefinitionProperty<any, any, mongoose.Document<unknown, {}, {
        username: string;
        email: string;
        image: string;
        refreshTokens: string[];
        password?: string | null | undefined;
    }, {
        id: string;
    }, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & Omit<{
        username: string;
        email: string;
        image: string;
        refreshTokens: string[];
        password?: string | null | undefined;
    } & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    username: string;
    email: string;
    image: string;
    refreshTokens: string[];
    password?: string | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    username: string;
    email: string;
    image: string;
    refreshTokens: string[];
    password?: string | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export default _default;
