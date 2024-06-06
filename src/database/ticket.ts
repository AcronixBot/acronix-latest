import mongoose, { Document, Model } from 'mongoose';

const TicketSchema = new mongoose.Schema({
    guildId: String,
    ticketId: String,
    channelId: String,
    memberIds: [String],
    closed: Boolean,
    locked: String
}, { timestamps: true })

interface ITicket extends Document {
    guildId: string,
    ticketId: string,
    channelId: string,
    memberIds: string[],
    closed: boolean,
    locked: string
}

const TicketModel: Model<ITicket> = mongoose.model<ITicket>(
    'GuildTicketConfig',
    TicketSchema,
    'GuildTicketConfigs'
)

export { TicketModel, ITicket }