import mongoose, { Document, Model } from "mongoose";

const AutoPublishSchema = new mongoose.Schema({
    guildId: {
        default: null,
        required: true,
        type: String
    },
    channelIds: {
        default: [],
        required: false,
        type: [String]
    }
}, { timestamps: true })

interface IAutoPublishSchema extends Document {
    guildId: string,
    channelIds: string[],
    userIds: string[],
    roleIds: string[]
}

const AutoPublishModel: Model<IAutoPublishSchema> = mongoose.model<IAutoPublishSchema>('AutoPublish', AutoPublishSchema, 'AutoPublishConfigs');

export { AutoPublishModel, IAutoPublishSchema }