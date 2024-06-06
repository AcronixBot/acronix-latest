import { IGatewayEvent } from "../../lib/bot/CustomClientTypes.js";
import { loadFiles } from "../../lib/utils/index.js";
import { CustomClient } from "../../lib/bot/CustomClient.js";
import { pathToFileURL } from "node:url";
import { Events } from "discord.js";
import { log } from "../main.js";
async function importFile(filePath: string): Promise<IGatewayEvent> {
	return (await import(`${pathToFileURL(filePath).href}`))?.default;
}
export async function loadEvents(client: CustomClient) {
	const Files = await loadFiles("Events");
	Files.forEach(async (evt) => {
		let event: IGatewayEvent = await importFile(evt);
		event.once
			? client.once(event.name, (...args) => event.execute(...args))
			: client.on(event.name, (...args) => event.execute(...args));
	});
	log.$info(`[BOT] [Events] Loaded ${Files.length} Events`);
}
