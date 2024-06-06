import { Schema, model, Model } from "mongoose";
import { Snowflake } from "../../lib/bot/CustomClientTypes";

export type TAutoDelete = {
	guildID: Snowflake;
	channelId: Snowflake;
	messageId: Snowflake;
	botMessages: boolean; //false = bot nachrichten werden übersprungen | true bot nachrichten werden auch gelöscht
	userMessages: boolean;
	timeout: number;
};

let autoDeleteSchema = new Schema({
	guildID: String,
	channelId: String,
	messageId: String,
	botMessages: Boolean,
	userMessages: Boolean,
	timeout: Number,
}, { timestamps: true });

const AutoDeleteModel: Model<TAutoDelete> = model<TAutoDelete>("autoDelete", autoDeleteSchema);

export default AutoDeleteModel;
