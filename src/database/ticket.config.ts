import mongoose, { Document, Model } from 'mongoose';

const GuildTicketConfigSchema = new mongoose.Schema({
    guildId: String,
    guildLogChannel: String,
    guildTicketCategoryId: String,
    guildModeratorRoleIds: [String]
}, { timestamps: true })

interface IGuildTicketConfig extends Document {
    guildId: string,
    guildLogChannel: string,
    guildTicketCategoryId: string,
    guildModeratorRoleIds: string[]
}

const GuildTicketConfigModel: Model<IGuildTicketConfig> = mongoose.model<IGuildTicketConfig>(
    'GuildTicketConfig',
    GuildTicketConfigSchema,
    'GuildTicketConfigs'
)

export { GuildTicketConfigModel, IGuildTicketConfig }