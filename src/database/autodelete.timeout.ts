import { Schema, model, Model } from "mongoose";
import { Snowflake, HelpCommandObjekt } from "../../lib/bot/CustomClientTypes";
import { TAutoDelete } from "./autodelete";

interface IMessageData {
	id: string;
	channelId: string;
	bot: boolean;
}

export type TTimeoutAutoDelete = {
	guildID: Snowflake;
	message: IMessageData;
	channelId: Snowflake;
	guildRule: TAutoDelete;
	timestampDeletenDate: number;
};

let autoDeleteTimeoutSchema = new Schema({
	guildID: String,
	message: Object,
	channelId: String,
	guildRule: Object,
	timestampDeletenDate: Number,
}, { timestamps: true });

const AutoDeleteTimeoutModel: Model<TTimeoutAutoDelete> = model<TTimeoutAutoDelete>(
	"autoDeleteTimeout",
	autoDeleteTimeoutSchema,
);

export default AutoDeleteTimeoutModel;
