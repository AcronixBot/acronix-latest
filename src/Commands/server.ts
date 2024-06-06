import {
	SlashCommandBuilder,
	PermissionFlagsBits,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	EmbedBuilder,
	ChatInputCommandInteraction,
	Locale,
	APIEmbedField,
	ApplicationCommandType,
	ApplicationCommandOptionType,
	AutocompleteInteraction,
	CacheType,
} from "discord.js";
import { ISlashCommand } from "../../lib/bot/CustomClientTypes.js";
import LangDatabase from "../database/lang.js";
import AutodeleteDatabase from "../database/autodelete.js";
import AntiPinggDatabase from "../database/antiping.js";
import ms from "ms";
import { I18n } from "../Handlers/i18n.js";
import { getEmoji } from "../Handlers/emojis.js";
import { Command } from "../../lib/bot/Commands/Command.js";
import { CustomClient } from "lib/bot/CustomClient.js";
import { AllInteractionTypes } from "../Events/interactionCreate.js";

/**
 TODO - Die Übersetzungen werde nicht geladen die daten scheinbar schon
 FIXME - *
 */

/**
 *
 * @param interaction
 * @param i18n
 * @returns
 */

async function buildLangPart(interaction: ChatInputCommandInteraction, i18n: I18n) {
	let lang = "";
	await LangDatabase.findOne({ Guild: interaction.guildId }).then(async (result) => {
		if (!result) {
			lang = "en";
		} else {
			lang = result.language;
		}
	});

	return {
		name: await i18n.get("lang.embed.fields.name"),
		value: `${lang === "de" ? "🇩🇪" : "🇬🇧"} \`${lang}\``,
		inline: true,
	};
}

async function buildAntiPingPart(interaction: ChatInputCommandInteraction, i18n: I18n) {
	let antipingI18n = new I18n({
		commandName: "antiping",
		lang: i18n.getLang(),
	});

	let embedParts: APIEmbedField[] = [];

	await AntiPinggDatabase.findOne({ guildID: interaction.guildId }).then(async (result) => {
		if (result) {
			let uArray = [];
			let rArray = [];

			if (result.userArray !== null && result.userArray.length !== 0)
				result.userArray.map((u: any) => uArray.push(`<@${u}>`));

			if (result.allowedRoles !== null && result.allowedRoles.length !== 0)
				result.allowedRoles.map((r: any) => rArray.push(`<@&${r}>`));

			embedParts.push(
				{
					name: await i18n.get("antiping.embed.user.fields.name"),
					value: uArray.length !== 0 ? uArray.join(`, `) : await antipingI18n.get("noTrackedMembers"),
					inline: false,
				},
				{
					name: await i18n.get("antiping.embed.role.fields.name"),
					value: rArray.length !== 0 ? rArray.join(`, `) : await antipingI18n.get("noTrackedRoles"),
					inline: true,
				},
				{
					name: await i18n.get("antiping.embed.channel.fields.name"),
					value:
						result.logChannel !== null && result.logChannel.length !== 0
							? `<#${result.logChannel}>`
							: await antipingI18n.get("noLogChannel"),
					inline: true,
				},
				{
					name: await i18n.get("antiping.embed.automod.fields.name"),
					value:
						result.usesAutoMod === true
							? await antipingI18n.get("autoModActivated")
							: await antipingI18n.get("autoModDeactivated"),
					inline: true,
				},
			);
		} else {
			embedParts.push({
				name: await i18n.get("antiping.embed.title"),
				value: await i18n.get("antiping.embed.noFound"),
				inline: false,
			});
		}
	});

	return embedParts;
}

export default class ServerCommand extends Command {
	constructor() {
		super({
			type: ApplicationCommandType.ChatInput,
			category: "Info",
			description: {
				key: `To configurate the settings of the guild`,
			},
			name: {
				key: `server`
			},
			dmPermissions: false,
			userPermissions: "Administrator",
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'config',
					description: `See the configurtion for antiping, autodelete and other configurations for the server`
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'language',
					description: `To configurate the language of the guild`,
					options: [
						{
							type: ApplicationCommandOptionType.String,
							description: 'Available languages',
							name: 'language',
							required: true,
							autocomplete: true
						}
					]
				}
			]
		})
	}

	public async execute(client: CustomClient, interaction: AllInteractionTypes, i18n: I18n) {
		if (!this.isChatInput(interaction)) return;

		if (interaction.options.getSubcommand() === "language") {
			let inputLang = interaction.options.getString("language");

			let baseEmbed = new EmbedBuilder()
				.setColor("DarkGold")
				.setTitle(await i18n.get("lang.embed.title"))
				.setFooter({ text: await i18n.get("lang.embed.footer") })
				.setDescription(await i18n.get("lang.embed.description"))
				.setTimestamp()
				.setFields([
					{
						name: await i18n.get("lang.embed.fields.name"),
						value: `${inputLang === "de" ? "🇩🇪" : "🇬🇧"} \`${inputLang}\``,
						inline: true,
					},
				]);

			await LangDatabase.findOne({ Guild: interaction.guildId }).then(async (result) => {
				if (!result) {
					await LangDatabase.create({ Guild: interaction.guild.id, language: inputLang });
				} else {
					await LangDatabase.findOneAndUpdate(
						{ Guild: interaction.guildId },
						{
							$set: {
								language: inputLang,
							},
						},
					);
				}
			});

			return interaction.reply({
				embeds: [baseEmbed],
			});
		}
		if (interaction.options.getSubcommand() === "config") {
			let baseEmbed = new EmbedBuilder()
				.setColor("DarkGrey")
				.setTitle(await i18n.get("config.embed.title"))
				.setDescription(await i18n.get("config.embed.description.all"))
				.addFields([
					await buildLangPart(interaction, i18n),
					{
						name: await i18n.get("autodelete.ruleCount"),
						value: `\`${(await AutodeleteDatabase.find({ guildID: interaction.guildId })).length}\``,
						inline: true,
					},
				]);
			baseEmbed.addFields(await buildAntiPingPart(interaction, i18n));

			return interaction.reply({
				embeds: [baseEmbed],
			});
		}
	}

	public async autoComplete(client: CustomClient, interaction: AutocompleteInteraction<CacheType>, i18n: I18n) {
		if (interaction.options.getSubcommand() === "language") {
			const focusedValue = interaction.options.getFocused();

			const choices: string[] = [];

			let guildPreferredLocale = interaction.guild.preferredLocale;

			let avalibleLangs = i18n.getLangs();

			let arr = [avalibleLangs.EnglishGB, avalibleLangs.German];

			await Promise.all(arr.map(async (local) => {
				choices.push(
					`${local} ${local === guildPreferredLocale ? await i18n.get("lang.autoComplete.preferedLang") : ""}`
				)
			}));

			const filtered = choices.filter((choice) => choice.startsWith(focusedValue));

			await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice.slice(0, 2) })));
		}
	}
}
