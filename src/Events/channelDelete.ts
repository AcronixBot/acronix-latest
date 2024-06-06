import { DMChannel, Events, NonThreadGuildBasedChannel, Role } from "discord.js";
import { IGatewayEvent } from "../../lib/bot/CustomClientTypes.js";
import { ChannelDelete } from "../Handlers/antiPingHandler.events.js";

const event: IGatewayEvent = {
	name: Events.ChannelDelete,
	once: false,
	execute: (channel: NonThreadGuildBasedChannel) => {
		//Anti Ping Check Messages
		ChannelDelete(channel);
	},
};

export default event;
