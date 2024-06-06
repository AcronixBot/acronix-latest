import {
	ActionRowBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	CacheType,
	Interaction,
	Colors,
	ChannelSelectMenuBuilder,
	ChannelType,
	MentionableSelectMenuBuilder,
} from "discord.js";
import { AntiPingDocument } from "../database/antiping.js";
import { I18n } from "./i18n.js";

export default async function editMessageBuildNewDescription(
	interaction: Interaction<CacheType>,
	collection: AntiPingDocument,
	i18n: I18n,
) {
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

	const channelSelectMenuRow = new ActionRowBuilder<ChannelSelectMenuBuilder>().setComponents([ChannelSelectMenu]);

	const autoModButton = new ButtonBuilder()
		.setLabel(await i18n.get("automodButton"))
		.setStyle(ButtonStyle.Success)
		.setCustomId(
			`antiping:button:toggleAutomod:toggle:${interaction.user.id}:${collection && collection.usesAutoMod === true ? "true" : "false"
			}`,
		);

	const resetButton = new ButtonBuilder()
		.setCustomId(`antiping:button:reset:toggle:${interaction.user.id}`)
		.setLabel(await i18n.get("resetButton"))
		.setStyle(ButtonStyle.Danger);

	const updateButton = new ButtonBuilder()
		.setCustomId(`antiping:button:sync:update:${interaction.user.id}`)
		.setLabel(await i18n.get("updateButton"))
		.setStyle(ButtonStyle.Success);

	const toggleSendEmbedWithContent = new ButtonBuilder()
		.setCustomId(`antiping:button:embedWithContent:update:${interaction.user.id}`)
		.setLabel(await i18n.get("mentionNoticeTitle"))
		.setStyle(collection.sendEmbedWithContent ? ButtonStyle.Success : ButtonStyle.Danger);

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
		.setFooter({ text: interaction.guild.name })
		.setTimestamp();
	embed.setDescription(await i18n.get("description"));

	let uArray = [];
	let rArray = [];

	if (collection) {
		if (collection.userArray !== null && collection.userArray.length !== 0)
			collection.userArray.map((u: any) => uArray.push(`<@${u}>`));

		if (collection.userArray !== null && collection.allowedRoles.length !== 0)
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

	return {
		embed,
		selectMenuRow,
		channelSelectMenuRow,
		otherSettingsRow,
		otherSettingsSecondRow
	};
}
