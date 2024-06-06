import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType, GuildMember, Message } from "discord.js";
import { ISlashCommand } from "../../lib/bot/CustomClientTypes.js";
import { Command } from "../../lib/bot/Commands/Command.js";
import { CustomClient } from "../../lib/bot/CustomClient.js";
import { AllInteractionTypes } from "../Events/interactionCreate.js";
import { I18n } from "../Handlers/i18n.js";
import { getEmoji } from '../Handlers/emojis.js';

export default class ClearCommand extends Command {
	constructor() {
		super({
			dmPermissions: false,
			category: "Moderation",
			userPermissions: 'ManageMessages',
			clientPermissions: 'ManageMessages',
			name: {
				key: 'clear',
			},
			description: {
				key: 'Bulk delete up to 100 messages',
			},
			type: ApplicationCommandType.ChatInput,
			options: [
				{
					type: ApplicationCommandOptionType.Number,
					description: 'The amount of messages, you want to delete.',
					name: 'amount',
					required: true,
					max_value: 100,
					min_value: 1,
				},
				{
					type: ApplicationCommandOptionType.String,
					description: 'The reason why you clearing these messages.',
					name: 'reason',
					required: false,
					maxLength: 200,
					min_length: 1
				},
				{
					type: ApplicationCommandOptionType.User,
					description: 'Target member to only delete the their messages.',
					name: 'target',
					required: false,
				},
			]
		})
	}

	public async execute(client: CustomClient, interaction: AllInteractionTypes, i18n: I18n) {
		if (!this.isChatInput(interaction)) return;

		await interaction.deferReply({ ephemeral: true })

		//Check the Permissons for the client and user
		if (!interaction.guild.members.me.permissions.has("ManageMessages")) {
			return interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setColor('Red')
						.setDescription(getEmoji("util_cross_mark") + " " + await i18n.get("botMissingPerms"))
				]
			})
		}

		if (!interaction.member.permissions.has("ManageMessages")) {
			return interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setColor('Red')
						.setDescription(getEmoji("util_cross_mark") + " " + await i18n.get("userMissingPerms"))
				]
			})
		}

		//Get the Command Parameters
		const amount = interaction.options.getNumber("amount");
		const reason = interaction.options.getString("reason");
		const target = interaction.options.getUser("target");

		//Fetch the messages
		let channelMessages = await interaction.channel?.messages.fetch();

		//Create the response embed
		let responseEmbed = new EmbedBuilder()
			.setColor("Green")
			.setTimestamp()
			.setFooter({ text: await i18n.get("footer") })
			.addFields([
				{
					name: await i18n.get("target"),
					value: `${target || (await i18n.get("noTarget"))}`,
					inline: true,
				},
				{
					name: await i18n.get("mod"),
					value: `${interaction.member}`,
					inline: true,
				},
				{
					name: await i18n.get("reason"),
					value: `${reason || (await i18n.get("noReason"))}`,
					inline: true,
				},
			]);

		//Try to delete the messages
		try {
			if (target) {
				let i = 0;
				let messagesToDelete: Message<true>[] = [];

				channelMessages?.filter((messages) => {

					if (messages.author.id === target.id && amount > i) {
						messagesToDelete.push(messages);
						i++;
					}
				});

				interaction.channel?.bulkDelete(messagesToDelete, true).then(async (messages) => {
					interaction.editReply({
						embeds: [
							responseEmbed.setDescription(
								await i18n.get("description", [{ text: "size", value: `${messages.size}` }]),
							),
						],
					});
				});
			} else {
				interaction.channel?.bulkDelete(amount, true).then(async (messages: { size: any }) => {
					interaction.editReply({
						embeds: [
							responseEmbed.setDescription(
								await i18n.get("description", [{ text: "size", value: `${messages.size}` }]),
							),
						],
					});
				});
			}
		} catch (e) {
			return interaction.editReply({ content: `${e}` });
		}
	}
}

