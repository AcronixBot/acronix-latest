import * as path from "path";
import * as fs from "fs";
import { pathToFileURL, fileURLToPath } from "url";
import { log } from "../main.js";
export type langs = "de" | "en" | `${string}`;
export enum Langs {
	"en",
	"de",
}

const Langss = {
	EnglishGB: "en-GB",
	German: "de",
};

interface IOptions {
	lang: langs;
	commandName: string;
}

type i18nStore = { [key: string]: string };

export class I18n {
	constructor(options: IOptions) {
		this.options = options;

		//this.getDataSync()
	}

	private deStore: i18nStore = {};
	private enStore: i18nStore = {};
	private options: IOptions;

	getLang() {
		return `${this.options.lang}`;
	}

	getLangs() {
		return Langss;
	}

	async getData() {
		try {
			return (
				(
					await import(
						`${pathToFileURL(
							`${process.cwd()}/dist/src/Translations/${this.options.lang}/${
								this.options.commandName
							}.js`,
						)}`
					)
				)?.default || {}
			);
		} catch (error) {
			return {};
		}
	}

	async get(path: string, replace?: { text: string; value: string }[], plural?: boolean) {
		let data = await this.getData();

		if (Object?.keys(data)?.length == 0)
			return `Translation not found for command \`${this.options.commandName}\` in language \`${this.options.lang}\``;
		else {
			function getNested(objekt: any, path: string) {
				let back = "";
				Object?.keys(objekt).forEach((f) => {
					if (f === path) {
						back = objekt[path];
					}
				});
				return back;
			}
			let string = getNested(data, path);
			if (string)
				replace?.forEach((e) => {
					string = string.replaceAll(`{{${e.text}}}`, e.value);
				});

			if (string && typeof string === "string" && string.match(/\;\[.+?\]/gi)) {
				string.match(/\;\[.+?\]/gi)?.forEach((_string) => {
					string = string.replaceAll(_string, _string.slice(2, -1).split(", ")[plural ? 1 : 0]);
				});
			}
			if (!string)
				return `Translation not found for command \`${this.options.commandName}\` in language \`${this.options.lang}\``;
			return string;
		}
	}
}

const langs = ["de", "en"] as const;

type AvalibleLangs = (typeof langs)[number];

type LangStore = {
	[key in AvalibleLangs]: {
		[key: string]: string;
	};
};

type i18nOptions = Pick<i18n, "chosenLang" | "command">;

interface i18n {
	chosenLang: AvalibleLangs;
	command: string;
	store: LangStore;
}

class i18n implements i18n {
	constructor(options: i18nOptions) {
		this.chosenLang = options.chosenLang;
		this.command = options.command;

		this.loadCommandTranslation();
	}

	async loadCommandTranslation() {
		try {
			for (const key in langs) {
				this.store[key] =
					(
						await import(
							`${pathToFileURL(`${process.cwd()}/dist/src/Translations/${key}/${this.command}.js`)}`
						)
					)?.default || {};
			}
		} catch (error) {
			log.$error(error);
		}
	}

	get(key: string, lang?: AvalibleLangs) {
		let tempLang = this.chosenLang;
		if (lang) tempLang = lang;
	}
}
