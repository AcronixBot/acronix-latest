import { Schema, model, Document } from "mongoose";

let schema = new Schema({
	responsTimes: Array<number>,
	type: String, // API | BOT | UNKNOW,
	status: String, //'Up' | 'Down' | 'Minor Outage'
	acceesKey: {
		default: null,
		type: String,
		required: true,
	},
}, { timestamps: true });

export type StatusSchemaType = {
	responsTimes: number[];
	acceesKey: string;
	type: "API" | "BOT";
	status: "Up" | "Down" | "Minor Outage";
};

export default model("status", schema);
