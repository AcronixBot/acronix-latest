import { IGatewayEvent } from "../../lib/bot/CustomClientTypes.js";
import { Events, Guild } from "discord.js";
import { DiscordBotClient } from "../main.js";

const event: IGatewayEvent = {
	name: Events.GuildCreate,
	once: false,
	execute: async (guild: Guild) => {
		DiscordBotClient.user?.setPresence({
			status: DiscordBotClient.getTokens.statusOptions.status,
			activities: [
				{
					name: DiscordBotClient.getTokens.statusOptions.activity.name.replace(
						"{{servers}}",
						`In ${DiscordBotClient.guilds.cache.size} Servers`,
					),
					type: DiscordBotClient.getTokens.statusOptions.activity.type,
				},
			],
		});
	},
};

export default event;
