import { Message, Events } from "discord.js";
import { IGatewayEvent } from "../../lib/bot/CustomClientTypes.js";
import { checkMessages } from "../Handlers/antiPingHandler.messages.js";
import { handleAutoDelete } from "../Handlers/autodelete.js";

const event: IGatewayEvent = {
	name: Events.MessageCreate,
	once: false,
	execute: (message: Message) => {
		//Anti Ping Check Messages
		checkMessages(message);

		//Auto Delete
		handleAutoDelete(message);
	},
};

export default event;
