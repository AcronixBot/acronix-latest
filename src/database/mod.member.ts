import { Schema, model, Model } from "mongoose";
import { Snowflake } from "../../lib/bot/CustomClientTypes";

type Accident = "mute" | "unmute";

type AccidentData = {};

export interface IAccident {
	customId: string;
	type: Accident;
	created: number;
	data: AccidentData;
}

export type TModMemberLog = {
	guildId: Snowflake;
	memberId: Snowflake;
	accidents: IAccident[];
};

let modMemberLog = new Schema({}, { timestamps: true });

const ModMemberLogModel: Model<TModMemberLog> = model<TModMemberLog>("ModMemberLog", modMemberLog);

export default ModMemberLogModel;
