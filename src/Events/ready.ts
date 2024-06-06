import { ActivityType } from "discord-api-types/v10";
import { IGatewayEvent } from "../../lib/bot/CustomClientTypes.js";
import { CustomClient } from "../../lib/bot/CustomClient.js";
import { CronUpdateBotPing, updateStatusDatabase } from "../../lib/api/routes/StatusEndpoint.js";
import { Events } from "discord.js";
import { log } from "../main.js";

const event: IGatewayEvent = {
	name: Events.ClientReady,
	once: false,
	execute: (client: CustomClient) => {
		log.$info("[BOT] Discord Bot is connected to the Discord Gateway");
		log.$info(`Logged in as ${client.user.username} (${client.user.id})`)

		client.user?.setPresence({
			status: client.getTokens.statusOptions.status,
			activities: [
				{
					name: client.getTokens.statusOptions.activity.name.replace(
						"{{servers}}",
						`In ${client.guilds.cache.size} Servers`,
					),
					type: client.getTokens.statusOptions.activity.type,
				},
			],
		});

		setTimeout(async () => {
			updateStatusDatabase("BOT", client.ws.ping);
		}, 5000);

		CronUpdateBotPing(client);
	},
};

export default event;
