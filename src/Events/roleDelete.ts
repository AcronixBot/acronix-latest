import { Events, Role } from "discord.js";
import { IGatewayEvent } from "../../lib/bot/CustomClientTypes.js";
import { GuildRoleDelete } from "../Handlers/antiPingHandler.events.js";

const event: IGatewayEvent = {
	name: Events.GuildRoleDelete,
	once: false,
	execute: (role: Role) => {
		//Anti Ping Check Messages
		GuildRoleDelete(role);
	},
};

export default event;
