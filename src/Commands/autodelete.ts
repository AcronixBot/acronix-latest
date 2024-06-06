import AutoDelete, { TAutoDelete } from "../database/autodelete.js";
import {
	SlashCommandBuilder,
	PermissionFlagsBits,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	EmbedBuilder,
	ChatInputCommandInteraction,
	ChannelType,
	Message,
	GuildTextBasedChannel,
	TextChannel,
	ButtonInteraction,
	InteractionType,
	PermissionsBitField,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	AutocompleteInteraction,
	CacheType,
	ApplicationCommandType,
	ApplicationCommandOptionType,
} from "discord.js";
import { ISlashCommand } from "../../lib/bot/CustomClientTypes.js";
import ms from "ms";
import { testChannel } from "../../lib/bot/TestChannel.js";
import AutoDeleteTimeoutModel from "../database/autodelete.timeout.js";
import { log } from "../main.js";
import { getEmoji } from "../Handlers/emojis.js";
import { Command } from "../../lib/bot/Commands/Command.js";
import { CustomClient } from "lib/bot/CustomClient.js";
import { AllInteractionTypes } from "../Events/interactionCreate.js";
import { I18n } from "../Handlers/i18n.js";

export default class AutoDeleteCommand extends Command {
	constructor() {
		super({
			name: {
				key: "autodelete",
			},
			type: ApplicationCommandType.ChatInput,
			category: "Moderation",
			description: {
				key: "Configure an Auto Delete System (for Messages)",
			},
			userPermissions: "Administrator",
			dmPermissions: false,
			options: [
				{
					name: "info-panel",
					type: ApplicationCommandOptionType.Subcommand,
					description: "View information for up to 7 AutoDelete rules",
				},
				{
					name: "delete",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Deletes an Auto Delete System",
					options: [
						{
							description: "The rule",
							name: "rule",
							type: ApplicationCommandOptionType.String,
							autocomplete: true,
							required: true,
						},
					],
				},
				{
					name: "setup",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Setup a new Auto Delete",
					options: [
						{
							type: ApplicationCommandOptionType.Channel,
							name: "channel",
							description: "The channel",
							channel_types: [
								ChannelType.GuildText,
								ChannelType.AnnouncementThread,
								ChannelType.PublicThread,
							],
							required: true,
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "timeout",
							description: "A custom timeout (default: 40 seconds) (10s, 10min, 1h, 9d)",
							required: false,
						},
					],
				},
				{
					name: "change",
					type: ApplicationCommandOptionType.Subcommand,
					description: "View information for up to 7 AutoDelete rules",
					options: [
						{
							description: "The rule",
							name: "rule",
							type: ApplicationCommandOptionType.String,
							autocomplete: true,
							required: true,
						},
						{
							description: "Specifies whether user messages should be deleted (true) or not (false)",
							name: "user-messages",
							type: ApplicationCommandOptionType.Boolean,
						},
						{
							description: "Specifies whether bot messages should be deleted (true) or not (false)",
							name: "bot-messages",
							type: ApplicationCommandOptionType.Boolean,
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "timeout",
							description: "A custom timeout (default: 40 seconds) (10s, 10min, 1h, 9d)",
							required: false,
						},
					],
				},
			],
		});
	}

	public async autoComplete(client: CustomClient, interaction: AutocompleteInteraction<CacheType>, i18n: I18n) {
		const focusedValue = interaction.options.getFocused();

		let collection = await AutoDelete.find({ guildID: interaction.guildId });

		const choices: string[] = [];

		if (Array.isArray(collection) && collection.length !== 0) {
			collection.map((entry) => {
				choices.push(
					`${interaction.guild.channels.cache.get(entry.channelId).name} ${entry.channelId} (Timeout ${ms(entry.timeout)}, Info Message: ${entry.messageId})`,
				);
			});

			const filtered = choices.filter((choice) => choice.startsWith(focusedValue));
			await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
		} else {
			await interaction.respond([
				{
					name: await i18n.get(`noOptions`),
					value: "autoCompleteNoOptionsAvalible",
				},
			]);
		}
	}

	public async execute(client: CustomClient, interaction: AllInteractionTypes, i18n: I18n) {
		if (!this.isChatInput(interaction)) return;

		if (!interaction.memberPermissions.has("Administrator"))
			return interaction.reply({
				content: await i18n.get(`missingPerms`),
				ephemeral: true,
			});

		if (interaction.options.getSubcommand() === "info-panel") {
			await interaction.deferReply({ ephemeral: true });
			let collection = await AutoDelete.find({ guildID: interaction.guildId });
			if (!collection || collection.length <= 0) {
				return interaction.editReply({
					content: await i18n.get(`infopanel.notfound`),
				});
			} else {
				let embed = new EmbedBuilder().setColor("Random").setDescription(`# Auto Delete`);

				//TODO
				await Promise.all(
					collection.map(async (doc) => {
						embed.addFields([
							{
								name: await i18n.get(`infopanel.channel`),
								value: `<#${doc.channelId}>`,
								inline: true,
							},
							{
								name: await i18n.get(`infopanel.msgtypes`),
								value: `${
									doc.botMessages ? getEmoji("util_tick") : getEmoji("util_cross_mark")
								} ${await i18n.get(`infopanel.msgbots`)}\n${
									doc.userMessages ? getEmoji("util_tick") : getEmoji("util_cross_mark")
								} ${await i18n.get(`infopanel.msgusers`)}`,
								inline: true,
							},
							{
								name: await i18n.get(`infopanel.timeout`),
								value: `\`${ms(doc.timeout, { long: true })}\``,
								inline: true,
							},
						]);
					}),
				);

				return interaction.editReply({
					embeds: [embed],
				});
			}
		}

		if (interaction.options.getSubcommand() === "setup") {
			let channel = interaction.options.getChannel<
				ChannelType.GuildText | ChannelType.AnnouncementThread | ChannelType.PublicThread
			>("channel");
			let timeout = (interaction.options.getString("timeout") as string) ?? "40s";
			let convertedTimeout = ms(timeout);

			let test = await testChannel(
				channel,
				[
					PermissionFlagsBits.ViewChannel,
					channel.isThread() ? PermissionFlagsBits.SendMessagesInThreads : PermissionFlagsBits.SendMessages,
					PermissionFlagsBits.ManageMessages,
					PermissionFlagsBits.EmbedLinks,
				],
				interaction.guild.members.me,
			);

			if (convertedTimeout < ms("5s")) {
				return interaction.reply({
					content: await i18n.get(`toSmallTimeout`, [{ text: `timeout`, value: `${timeout}` }]),
					ephemeral: true,
				});
			}

			if (test.allPerms === false) {
				return interaction.reply({
					content: await i18n.get(`botMissingPerms`, [
						{ text: `permissionArray`, value: `${test.permArray.join(`\n`)}` },
					]),
					ephemeral: true,
				});
			} else {
				let collection = await AutoDelete.findOne({ guildID: interaction.guildId, channelId: channel.id }).then(
					(c) => c as TAutoDelete,
				);
				if (collection)
					return interaction.reply({
						content: await i18n.get(`alreadyThere`),
						ephemeral: true,
					});
				else {
					if (channel.isThread()) {
						if (!channel.joined) {
							if (!channel.joinable) {
								return interaction.reply({
									content: await i18n.get("threadNotJoinable"), //Add Translation (Could not join the thread)
									ephemeral: true,
								});
							} else {
								await channel.join();
							}
						}
					}

					let newMsg = await channel.send({
						embeds: [
							new EmbedBuilder()
								.setTitle(await i18n.get(`embed.title`))
								.setColor("Red")
								.setTimestamp()
								.setDescription(
									await i18n.get(`embed.description.default`, [
										{ text: `timeout`, value: `${timeout}` },
									]),
								),
						],
					});

					let newCollection = await AutoDelete.create({
						botMessages: false,
						channelId: channel.id,
						messageId: newMsg.id,
						guildID: interaction.guild.id,
						timeout: convertedTimeout,
						userMessages: true,
					});

					return interaction.reply({
						content: await i18n.get(`interaction.response.create.new`, [
							{
								text: `channel`,
								value: `<#${newCollection.channelId}>`,
							},
							{
								text: `timeout`,
								value: `\`${ms(newCollection.timeout)}\``,
							},
							{
								text: `botMSGs`,
								value: `${
									newCollection.botMessages === false
										? await i18n.get(`botMsgsFalse`)
										: await i18n.get(`botMsgsTrue`)
								}`,
							},
						]),
						ephemeral: false,
					});
				}
			}
		}

		if (interaction.options.getSubcommand() === "change") {
			await interaction.deferReply();

			let value = interaction.options.getString("rule");

			let userMessages = interaction.options.getBoolean("user-messages") ?? null;
			let botMessages = interaction.options.getBoolean("bot-messages") ?? null;
			let timeout = interaction.options.getString("timeout") ?? null;

			let collection = await AutoDelete.findOne({
				guildID: interaction.guildId,
				channelId: value.split(` `)[1],
			});

			if (!collection)
				return interaction.editReply({
					content: await i18n.get("notThere"),
				});
			else {
				try {
					if (userMessages === null && botMessages === null && timeout === null) {
						return interaction.editReply({
							content: await i18n.get("noChange"),
						});
					}

					let transformedTimeout = timeout !== null ? ms(timeout) : collection.timeout;

					if (transformedTimeout < ms("5s")) {
						return interaction.editReply({
							content: await i18n.get(`toSmallTimeout`, [{ text: `timeout`, value: `${timeout}` }]),
						});
					}

					await AutoDelete.findOneAndUpdate(
						{
							guildID: interaction.guildId,
							channelId: value.split(` `)[1],
						},
						{
							$set: {
								timeout: timeout !== null ? transformedTimeout : collection.timeout,
								botMessages: botMessages !== null ? botMessages : collection.botMessages,
								userMessages: userMessages !== null ? userMessages : collection.userMessages,
							},
						},
					);

					try {
						await AutoDelete.findOne({
							guildID: interaction.guildId,
							channelId: value.split(` `)[1],
						}).then(async (result) => {
							let cacheChannel = interaction.guild.channels.cache.get(result.channelId);
							if (cacheChannel === undefined)
								cacheChannel = (await interaction.guild.channels.fetch(
									result.channelId,
								)) as TextChannel;
							if (cacheChannel) {
								if (cacheChannel.isTextBased()) {
									let msg = cacheChannel.messages.cache.get(result.messageId);
									if (msg === undefined)
										msg = await cacheChannel.messages.fetch(result.messageId).catch(() => {
											return undefined;
										});
									if (msg) {
										let newDescription =
											result.userMessages === true
												? result.botMessages === true
													? await i18n.get(`embed.description.botAndUser`, [
															{ text: `timeout`, value: `${ms(result.timeout)}` },
														])
													: await i18n.get(`embed.description.user`, [
															{ text: `timeout`, value: `${ms(result.timeout)}` },
														])
												: await i18n.get(`embed.description.bot`, [
														{ text: `timeout`, value: `${ms(result.timeout)}` },
													]);

										msg.edit({
											embeds: [
												new EmbedBuilder()
													.setTitle(await i18n.get("embed.title"))
													.setColor("Red")
													.setTimestamp()
													.setDescription(newDescription),
											],
										});
									}
								}
							}
						});
					} catch (e) {
						log.$error(e);
					}

					let responseArr: string[] = [];
					responseArr.push(
						await i18n.get("interaction.response.change.title", [
							{ text: `channel`, value: `<#${collection.channelId}>` },
						]),
					);

					if (botMessages !== null)
						responseArr.push(
							`- ${
								botMessages === true
									? await i18n.get("interaction.response.change.botMsgs.true")
									: await i18n.get("interaction.response.change.botMsgs.false")
							}`,
						);

					if (userMessages !== null)
						responseArr.push(
							`- ${
								userMessages === true
									? await i18n.get("interaction.response.change.userMsgs.true")
									: await i18n.get("interaction.response.change.userMsgs.false")
							}`,
						);

					if (timeout !== null)
						responseArr.push(
							await i18n.get("interaction.response.change.timeout", [
								{ text: `timeout`, value: `${timeout}` },
							]),
						);

					return interaction.editReply({
						content: responseArr.join(`\n`),
					});
				} catch (e) {
					log.$error(e);
					return interaction.editReply({ content: `${e}` });
				}
			}
		}

		if (interaction.options.getSubcommand() === "delete") {
			await interaction.deferReply({ ephemeral: true, fetchReply: true });
			let value = interaction.options.getString("rule");

			let collection = await AutoDelete.findOne({
				guildID: interaction.guildId,
				channelId: value.split(` `)[1],
			});

			(await AutoDeleteTimeoutModel.find({ channelId: collection.channelId })).forEach((es) => es.deleteOne());

			if (!collection)
				return interaction.editReply({
					content: await i18n.get("notThere"),
				});
			else {
				return interaction.editReply({
					content: await i18n.get(`question`),
					components: [
						new ActionRowBuilder<ButtonBuilder>().addComponents([
							new ButtonBuilder()
								.setCustomId(
									`autodelete:question:reset:false:${interaction.user.id}:${collection.channelId}`,
								)
								.setStyle(ButtonStyle.Danger)
								.setLabel(await i18n.get(`no`)),
							new ButtonBuilder()
								.setCustomId(
									`autodelete:question:reset:true:${interaction.user.id}:${collection.channelId}`,
								)
								.setStyle(ButtonStyle.Success)
								.setLabel(await i18n.get(`yes`)),
						]),
					],
				});
			}
		}
	}
}
