import { AutoModerationRule, Events } from "discord.js";
import { IGatewayEvent } from "../../lib/bot/CustomClientTypes.js";
import { AutoModerationRuleDelete } from "../Handlers/antiPingHandler.events.js";

/**
 * The Event dont fires?
 * or it fires but dont delete the rule
 */

const event: IGatewayEvent = {
	name: Events.AutoModerationRuleDelete,
	once: false,
	execute: async (rule: AutoModerationRule) => {
		AutoModerationRuleDelete(rule);
	},
};

export default event;
