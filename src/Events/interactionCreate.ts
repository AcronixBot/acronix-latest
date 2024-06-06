import {
	APIApplicationCommandInteractionDataStringOption,
	ApplicationCommandOptionType,
	AutocompleteInteraction,
	ButtonInteraction,
	CacheType,
	ChannelSelectMenuInteraction,
	ChatInputCommandInteraction,
	CommandInteraction,
	ContextMenuCommandInteraction,
	Events,
	Interaction,
	MessageContextMenuCommandInteraction,
	ModalSubmitInteraction,
	RoleSelectMenuInteraction,
	SelectMenuInteraction,
	UserContextMenuCommandInteraction,
	UserSelectMenuInteraction,
} from "discord.js";
import { IGatewayEvent, InteractionType } from "../../lib/bot/CustomClientTypes.js";
import { DiscordBotClient, log } from "../main.js";
import { I18n, langs } from "../Handlers/i18n.js";
import langaugeDatabase from "../database/lang.js";
import { handleAntiPingInteractions } from "../Handlers/antiPingHandler.interactions.js";
import { CustomClient } from "../../lib/bot/CustomClient.js";
import { handleAutoDeleteRuleDelete } from "../Handlers/autodelete.js";

const event: IGatewayEvent = {
	name: Events.InteractionCreate,
	execute: async (interaction: AllInteractionTypes) => {
		try {
			if (interaction.isChannelSelectMenu() || interaction.isMentionableSelectMenu() || interaction.isButton()) {
				if (interaction.customId.split(`:`)[0] === "antiping") {
					handleAntiPingInteractions(interaction);
				}
				if (interaction.customId.split(`:`)[0] === "autodelete") {
					handleAutoDeleteRuleDelete(interaction as ButtonInteraction<CacheType>);
				}
			}

			if (interaction.type === InteractionType.ApplicationCommand) {
				const command = DiscordBotClient.commands.get(interaction.commandName);
				if (!command) return interaction.reply({ content: "The Command is outdated", ephemeral: true });
				else {
					/**
					 * Handle Auto Complete and no valid options
					 */
					//true === autoCompleteNoOptionsAvalible | null = continue
					let bool: boolean = null;
					let stringOptions =
						(interaction as ChatInputCommandInteraction).options.data.filter(
							(f) => f.type === ApplicationCommandOptionType.Subcommand,
						) ?? null;
					stringOptions.forEach((c) => {
						c.options.forEach((cc) => {
							if (cc.value === "autoCompleteNoOptionsAvalible") {
								bool = true;
							}
						});
					});
					if (bool === true) {
						return interaction.reply({
							content: `You cannot run this command, because no option is avalible`,
							ephemeral: true,
						});
					}

					let lang: langs;
					await langaugeDatabase.findOne({ Guild: interaction.guildId }).then(async (result) => {
						if (!result) lang = "en";
						else lang = `${result.language}`;

						let i18n = new I18n({
							commandName: interaction.commandName,
							lang: lang,
						});

						await command.execute(DiscordBotClient, interaction, i18n);
					});
				}
			}

			if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
				const command = DiscordBotClient.commands.get(interaction.commandName);
				if (typeof command === "undefined")
					return interaction.respond([
						{
							name: "No options avalible",
							value: "autoCompleteNoOptionsAvalible",
						},
					]);
				else {
					let lang: langs;
					await langaugeDatabase.findOne({ Guild: interaction.guildId }).then(async (result) => {
						if (!result) lang = "en";
						else lang = `${result.language}`;

						let i18n = new I18n({
							commandName: interaction.commandName,
							lang: lang,
						});

						await command.autoComplete(DiscordBotClient, interaction, i18n);
					});
				}
			}
		} catch (e) {
			log.$error(e);
			errorInteractionHandler(DiscordBotClient, interaction);
		}
	},
};
export type AllInteractionTypes =
	| CommandInteraction
	| ButtonInteraction
	| ModalSubmitInteraction
	| SelectMenuInteraction
	| ChatInputCommandInteraction
	| MessageContextMenuCommandInteraction
	| UserContextMenuCommandInteraction
	| ChannelSelectMenuInteraction
	| UserSelectMenuInteraction
	| RoleSelectMenuInteraction
	| AutocompleteInteraction;
async function errorInteractionHandler(client: CustomClient, interaction: AllInteractionTypes): Promise<void> {
	if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
		if (interaction.responded === false) {
			await interaction
				.respond([
					{
						name: "No options avalible",
						value: "autoCompleteNoOptionsAvalible",
					},
				])
				.catch(() => null);
		}
	} else {
		if (interaction.replied) {
			if (interaction.deferred)
				await interaction
					.editReply({
						content: " Unknown error occurred, please try again.",
						embeds: [],
						components: [],
					})
					.catch(() => null);
			else
				await interaction
					.followUp({
						ephemeral: true,
						content: "Unknown error occurred, please try again.",
						embeds: [],
						components: [],
					})
					.catch(() => null);
		} else {
			if (interaction.deferred)
				await interaction
					.editReply({
						content: "Unknown error occurred, please try again.",
						embeds: [],
						components: [],
					})
					.catch(() => null);
			else
				await interaction
					.reply({
						ephemeral: true,
						content: "Unknown error occurred, please try again.",
						embeds: [],
						components: [],
					})
					.catch(() => null);
		}
	}
}

export default event;
