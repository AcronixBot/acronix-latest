import {
	SlashCommandBuilder,
	PermissionFlagsBits,
	PermissionsBitField,
	EmbedBuilder,
	ChatInputCommandInteraction,
	ApplicationCommandOptionType,
	Collection,
	ApplicationCommandType,
	StringSelectMenuOptionBuilder,
	StringSelectMenuBuilder,
	ActionRowBuilder,
	ComponentType,
	StringSelectMenuInteraction,
	CacheType,
} from "discord.js";
import { HelpCommandObjekt, ISlashCommand } from "../../lib/bot/CustomClientTypes.js";
import { Category, Command, TCategory } from "../../lib/bot/Commands/Command.js";
import { CustomClient } from "../../lib/bot/CustomClient.js";
import { AllInteractionTypes } from "../../src/Events/interactionCreate.js";
import { I18n } from "../../src/Handlers/i18n.js";
import { getEmoji, getEmojiForHelpMenu } from "../../src/Handlers/emojis.js";

export default class HelpCommand extends Command {
	constructor() {
		super({
			category: "Help",
			description: {
				key: 'Shows a list of Commands and relevant Links'
			},
			name: {
				key: 'help'
			},
			type: ApplicationCommandType.ChatInput,
			dmPermissions: false,
		})
	}

	public async execute(client: CustomClient, interaction: AllInteractionTypes, i18n: I18n) {
		if (!this.isChatInput(interaction)) return;

		await interaction.deferReply({ ephemeral: false, fetchReply: true });

		let commandCollection = client.commands;

		const BaseEmbed = new EmbedBuilder()
			.setColor("Aqua")
			.setThumbnail(`${client.user?.avatarURL({ size: 1024, extension: "png" })}`)
			.setDescription(
				await i18n.get("description", [{ text: "client", value: `${client.user.username}` }]),
			)
			.setTitle(getEmojiForHelpMenu("Home", false) + " " + "Home")
			.setTimestamp();

		const options = [
			...Category.map((category) => new StringSelectMenuOptionBuilder().setLabel(category).setValue(`menu:option:${category}`).setEmoji(getEmojiForHelpMenu(category)))
		]

		options.push(new StringSelectMenuOptionBuilder().setLabel("Home").setValue(`menu:option:Home`).setEmoji(getEmojiForHelpMenu("Home")))
		options.reverse();

		const menu = new StringSelectMenuBuilder()
			.setCustomId(`menu:builer`)
			.setMaxValues(1)
			.setMinValues(1)
			.setOptions(options);

		const msg = await interaction.editReply({
			embeds: [BaseEmbed],
			components: [
				new ActionRowBuilder<StringSelectMenuBuilder>().addComponents([menu])
			]
		})

		/**
		 * Collector und basierend auf der Auswahl wird das Embed angepasst
		 */

		const filter = (i: StringSelectMenuInteraction<CacheType>) => i.user.id === interaction.user.id;
		const collector = msg.createMessageComponentCollector({
			componentType: ComponentType.StringSelect,
			time: 60000
		})

		collector.on('collect', async (collected) => {
			if (filter(collected)) {

				if (collected.isStringSelectMenu()) {
					const option = collected.values[0];
					const categoryFromOption = option.split(':')[2] as TCategory;
					if ((categoryFromOption as string) === "Home") {
						collected.deferUpdate();

						collected.message.edit({
							embeds: [
								BaseEmbed.setColor("Aqua")
									.setThumbnail(`${client.user?.avatarURL({ size: 1024, extension: "png" })}`)
									.setDescription(
										await i18n.get("description", [{ text: "client", value: `${client.user.username}` }]),
									)
									.setTimestamp()
									.setTitle(getEmojiForHelpMenu(categoryFromOption, false) + " " + categoryFromOption)
							],
							components: [
								new ActionRowBuilder<StringSelectMenuBuilder>().addComponents([menu])
							]
						})

						return;
					}
					if (!Category.includes(categoryFromOption)) {
						collected.reply({
							ephemeral: true,
							embeds: [BaseEmbed.setDescription(`Looks like you choosed a categorie that i dont know. Please inform my developer about this.\nChoosen category: \`${categoryFromOption}\``)],
						})
						return;
					} else {
						collected.deferUpdate();

						const commandsForCategory = commandCollection.filter((command) => command.getData.category === categoryFromOption);
						let commandString = "";
						if (commandsForCategory.size <= 0) commandString = "Could not find any commands related to this category.";
						else {
							Promise.all(commandsForCategory.map((command) => {
								commandString += `\`/${command.getData.name.key}\` - ${command.getData.description.key}\n`
							}))
						}
						collected.message.edit({
							embeds: [
								BaseEmbed.setDescription(commandString).setTitle(getEmojiForHelpMenu(categoryFromOption, false) + " " + categoryFromOption)
							],
							components: [
								new ActionRowBuilder<StringSelectMenuBuilder>().addComponents([menu])
							]
						})
						return;
					}
				}
			} else {
				collected.reply({
					content: `${getEmoji('util_cross_mark')} This menu is not for you!`,
					ephemeral: true
				})
			}
		})

		collector.on('end', () => {
			interaction.webhook.editMessage(msg, {
				components: []
			})
		})

	}
}	