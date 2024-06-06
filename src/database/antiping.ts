import { Schema, model, Document, Model } from "mongoose";
import { Snowflake } from "lib/bot/CustomClientTypes";

export type AntiPingDocument = {
	userArray?: string[];
	allowedRoles?: string[];
	guildID?: string;
	logChannel?: string;
	usesAutoMod?: boolean;
	safedAutoModRuleID?: string;
	//new Date().getTime() + 5 min
	autoModUpdateTimeout?: number;
	sendEmbedWithContent?: boolean
};

let schema = new Schema({
	guildID: { type: String },
	userArray: {
		default: null, // test if this appiers in the schema online in mongodb compass
		type: Array<String>,
	},
	allowedRoles: {
		default: null, // test if this appiers in the schema online in mongodb compass
		type: Array<String>,
	},
	logChannel: {
		default: null,
		type: String,
	},
	usesAutoMod: {
		default: false,
		type: Boolean,
	},
	safedAutoModRuleID: {
		default: null,
		type: String,
	},
	autoModUpdateTimeout: {
		default: null,
		type: "Number",
	},
	sendEmbedWithContent: {
		default: true,
		type: Boolean
	}
}, { timestamps: true });

interface IAntiPing extends Document {
	userArray?: string[];
	allowedRoles?: string[];
	guildID?: string;
	logChannel?: string;
	usesAutoMod?: boolean;
	safedAutoModRuleID?: string;
	autoModUpdateTimeout?: number;
	sendEmbedWithContent?: boolean
}

const AntiPingModel: Model<IAntiPing> = model<IAntiPing>("antiping", schema);

export default AntiPingModel;
