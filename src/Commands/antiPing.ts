import {
	PermissionFlagsBits,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	Colors,
	ActionRowBuilder,
	ChannelSelectMenuBuilder,
	ChannelType,
	ApplicationCommandType,
} from "discord.js";
import { Command } from "../../lib/bot/Commands/Command.js";
import AntiPing, { AntiPingDocument } from "../database/antiping.js";
import { MentionableSelectMenuBuilder } from "@discordjs/builders";
import { CustomClient } from "lib/bot/CustomClient.js";
import { AllInteractionTypes } from "../Events/interactionCreate.js";
import { I18n } from "../Handlers/i18n.js";

export default class AntiPingCommand extends Command {
	constructor() {
		super({
			category: "Moderation",
			description: {
				key: "Manage the Anti Ping System",
				localizations: {
					"en-US": "Manage the Anti Ping System",
					de: "Verwalte das Anti Ping System",
				}
			},
			name: {
				key: "antiping",
			},
			type: ApplicationCommandType.ChatInput,
			dmPermissions: false,
			userPermissions: 'Administrator',
		})
	}

	public async execute(client: CustomClient, interaction: AllInteractionTypes, i18n: I18n) {
		if (!this.isChatInput(interaction)) return;

		interaction.deferReply().then(async () => {
			const { guild: server } = interaction;
			const collection = await AntiPing.findOne({ guildID: interaction.guildId }).then((t) => t as AntiPingDocument);

			if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
				return interaction.editReply({ content: await i18n.get("missingAdminPerms") });
			}

			const SelectMenu = new MentionableSelectMenuBuilder()
				.setCustomId(`antiping:menu:select:entity:${interaction.user.id}`)
				.setMaxValues(1)
				.setMinValues(1)
				.setPlaceholder(await i18n.get("roleUserSelectMenu"));

			const selectMenuRow = new ActionRowBuilder<MentionableSelectMenuBuilder>().setComponents([SelectMenu]);

			const ChannelSelectMenu = new ChannelSelectMenuBuilder()
				.setCustomId(`antiping:menu:select:channel:${interaction.user.id}`)
				.setMaxValues(1)
				.setMinValues(1)
				.setPlaceholder(await i18n.get("channelSelectMenu"))
				.setChannelTypes([ChannelType.GuildText]);

			const channelSelectMenuRow = new ActionRowBuilder<ChannelSelectMenuBuilder>().setComponents([
				ChannelSelectMenu,
			]);

			const autoModButton = new ButtonBuilder()
				.setLabel(await i18n.get("automodButton"))
				.setStyle(ButtonStyle.Success)
				.setCustomId(
					`antiping:button:toggleAutomod:toggle:${interaction.user.id}:${collection && collection.usesAutoMod === true ? "true" : "false"
					}`,
				);

			const resetButton = new ButtonBuilder()
				.setCustomId(`antiping:button:reset:reset:${interaction.user.id}`)
				.setLabel(await i18n.get("resetButton"))
				.setStyle(ButtonStyle.Danger);

			const updateButton = new ButtonBuilder()
				.setCustomId(`antiping:button:sync:update:${interaction.user.id}`)
				.setLabel(await i18n.get("updateButton"))
				.setStyle(ButtonStyle.Success);

			const toggleSendEmbedWithContent = new ButtonBuilder()
				.setCustomId(`antiping:button:embedWithContent:update:${interaction.user.id}`)
				.setLabel(await i18n.get("mentionNoticeTitle"))
				.setStyle(collection?.sendEmbedWithContent ? ButtonStyle.Success : ButtonStyle.Danger);

			const otherSettingsRow = new ActionRowBuilder<ButtonBuilder>().addComponents([
				autoModButton,
				updateButton,
				resetButton,
			]);

			const otherSettingsSecondRow = new ActionRowBuilder<ButtonBuilder>().addComponents([
				toggleSendEmbedWithContent
			])

			const embed = new EmbedBuilder()
				.setColor(Colors.White)
				.setTitle(await i18n.get("embedTitle"))
				.setFooter({ text: server.name })
				.setTimestamp();
			embed.setDescription(await i18n.get("description"));

			let uArray = [];
			let rArray = [];

			if (collection) {
				if (collection.userArray !== null && collection.userArray.length !== 0)
					collection.userArray.map((u: any) => uArray.push(`<@${u}>`));

				if (collection.allowedRoles !== null && collection.allowedRoles.length !== 0)
					collection.allowedRoles.map((r: any) => rArray.push(`<@&${r}>`));

				embed.addFields([
					{
						name: await i18n.get("trackedMembers"),
						value: uArray.length !== 0 ? uArray.join(`, `) : await i18n.get("noTrackedMembers"),
						inline: true,
					},
					{
						name: await i18n.get("trackedRoles"),
						value: rArray.length !== 0 ? rArray.join(`, `) : await i18n.get("noTrackedRoles"),
						inline: true,
					},
					{
						name: await i18n.get("logChannel"),
						value:
							collection.logChannel !== null && collection.logChannel.length !== 0
								? `<#${collection.logChannel}>`
								: await i18n.get("noLogChannel"),
						inline: true,
					},
					{
						name: await i18n.get("autoMod"),
						value:
							collection.usesAutoMod === true
								? await i18n.get("autoModActivated")
								: await i18n.get("autoModDeactivated"),
						inline: true,
					},
					{
						name: await i18n.get("mentionNoticeTitle"),
						value:
							collection.sendEmbedWithContent === true
								? await i18n.get("mentionNoticeValue")
								: await i18n.get("mentionNoticeValueDeactivated"),
						inline: true,
					},
				]);
			}

			await interaction.editReply({
				embeds: [embed],
				components: [selectMenuRow, channelSelectMenuRow, otherSettingsRow, otherSettingsSecondRow],
			});
		});


	}
}

