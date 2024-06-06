import { pathToFileURL } from "node:url";
import { CustomClient } from "../../lib/bot/CustomClient.js";
import { ISlashCommand } from "../../lib/bot/CustomClientTypes.js";
import { ApplicationCommandDataResolvable } from "discord.js";
import * as globPkg from "glob";
import { log } from "../main.js";
import { CommandStore } from "../../lib/bot/Commands/CommandStore.js";
import { ApplicationCommandDataInterfaces } from "../../lib/bot/Commands/Command.js";

export default async function loadCommands(client: CustomClient) {
	log.$info("[BOT] [COMMANDS] Deployment of commands started!");

	try {
		const commandStore = new CommandStore({
			safeDirectory: "/dist/src/Commands/*.js",
		});

		const commands = await commandStore.LoadCommands();

		let resolvedCommands: ApplicationCommandDataInterfaces[] = [];

		commands.forEach((command) => {
			let commandData = command.toJSON();
			client.commands.set(commandData.name, command);
			resolvedCommands.push(commandData);
		});
		client.application.commands.set(resolvedCommands);
	} catch (e) {
		log.$error(e);
	} finally {
		log.$info("[BOT] [COMMANDS] Deployment of commands finished!");
	}
}

// export async function loadFiles(dirName: string) {
// 	const Files = await glob(`${process.cwd().replace(/\\/g, "/")}/dist/src/${dirName}/*.js`);
// 	return Files;
// }

// async function importFile(filePath: string): Promise<ISlashCommand> {
// 	return (await import(`${pathToFileURL(filePath).href}`))?.default;
// }

// export async function catchCommands(client: CustomClient) {
// 	let Files = await loadFiles("Commands");
// 	let commands: Array<ApplicationCommandDataResolvable> = [];
// 	for (const file of Files) {
// 		let f = await importFile(file);
// 		commands.push(f.data.toJSON());
// 		client.commands.set(f.data.name, f);
// 	}
// 	return commands;
// }

// export async function pushCommands(client: CustomClient) {
// 	try {
// 		let commands = await catchCommands(client);
// 		client.application.commands.set(commands);
// 		log.$info(`[BOT] [Commands] Loaded ${commands.length} Commmands.`);
// 	} catch (e) {
// 		log.$error(e);
// 	}
// }
