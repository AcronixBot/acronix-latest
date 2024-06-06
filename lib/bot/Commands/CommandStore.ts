import { pathToFileURL } from "url";
import { Collection } from "discord.js";
import * as globPkg from "glob";

import { Command } from "./Command.js";
import * as path from "path";
import { log } from "../../../src/main.js";

const { glob } = globPkg;

// "/dist/src/${dirName}/*.js"
type safeDirectory = `/${string}/*.js`;

export interface CommandStoreOptions {
	safeDirectory: safeDirectory;
}

export class CommandStore {
	private options: CommandStoreOptions;
	constructor(options: CommandStoreOptions) {
		this.options = options;
	}

	public get getOptions() {
		return this.options;
	}

	public async LoadCommands() {
		const files = (await glob(`dist/src/Commands/*.js`)).map(filePath => path.resolve(filePath));

		const commands = new Collection<string, Command>();

		await Promise.all(files.map(async (file: string) => {
			const command: Command = new (await import(`${pathToFileURL(file).href}`)).default;

			const commandData = command.toJSON();

			if (!commandData.name) {
				log.$info(`Could not load command: ${file} does not have a name`);
			} else {
				commands.set(commandData.name, command.getCommand());
			}
		}));

		return commands;
	}
}
