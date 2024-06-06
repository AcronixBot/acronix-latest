import { Document, Schema, model } from "mongoose";
import { type langs } from "../Handlers/i18n.js";
export type langSchema = {
	Guild?: string;
	language?: string;
};

export interface ILang extends Document {
	Guild: string;
	language: langs;
}

let schema = new Schema({
	Guild: String,
	language: String,
}, { timestamps: true });

const LangModel = model<ILang>("language", schema);

export default LangModel;
