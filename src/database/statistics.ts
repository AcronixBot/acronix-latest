import { Document, Schema, model, Model } from "mongoose";

export interface mostUsedCommandObject {
	commandName: string;
	runs: number;
}

export interface Statistics extends Document {
	key: string;
	commandRunAllTime: number;
	mostUsedCommands: mostUsedCommandObject[];
}

const StatisticsSchema = new Schema({
	key: String,
	commandRunAllTime: Number,
	mostUsedCommands: Array<mostUsedCommandObject>,
}, { timestamps: true });

const StatisticsModel: Model<Statistics> = model<Statistics>("Statistics", StatisticsSchema);

export default StatisticsModel;

export const Key = process.env.StatisticsKey;
