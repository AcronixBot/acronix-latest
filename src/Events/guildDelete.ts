import { ActivityType } from "discord-api-types/v10";
import { IGatewayEvent } from "../../lib/bot/CustomClientTypes.js";
import { CustomClient } from "../../lib/bot/CustomClient.js";
import { CronUpdateBotPing, updateStatusDatabase } from "../../lib/api/routes/StatusEndpoint.js";
import { Client, EmbedBuilder, Events, Guild, GuildTextBasedChannel } from "discord.js";
import { GuildDelete } from "../Handlers/antiPingHandler.events.js";
import { DiscordBotClient } from "../main.js";
import { getEmoji } from "../Handlers/emojis.js";

const event: IGatewayEvent = {
	name: Events.GuildDelete,
	once: false,
	execute: async (guild: Guild) => {
		GuildDelete(guild);

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
