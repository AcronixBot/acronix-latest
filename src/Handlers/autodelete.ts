import AutoDelete, { TAutoDelete } from "../database/autodelete.js";
import AutoDeleteTimeout from "../database/autodelete.timeout.js";
import GuildLang from "../database/lang.js";
import { ChannelType, Message, TextChannel, ButtonInteraction, Guild, ThreadChannel, PublicThreadChannel } from "discord.js";
import { I18n, langs } from "./i18n.js";
import ms from "ms";
import { CronJob } from "cron";
import { CustomClient } from "../../lib/bot/CustomClient.js";
import { log } from "../main.js";

async function checkIfDeleteAble(guildRule: TAutoDelete, message: Message) {
	setTimeout(async () => {
		if (guildRule.botMessages === true && message.author.bot) {
			if (message.deletable && message) {
				await message.delete();
			}
		} else if (guildRule.userMessages === true && !message.author.bot) {
			if (message.deletable && message) {
				await message.delete();
			}
		}
	}, guildRule.timeout);
}

export async function BigAutoDeleteTimeouts(bot: CustomClient) {
	new CronJob(
		"*/1 * * * *",
		async () => {
			(await AutoDeleteTimeout.find()).forEach(async (entry) => {
				try {
					if (entry.timestampDeletenDate <= Date.now()) {
						let guild: Guild;
						try {
							guild = bot.guilds.cache.get(entry.guildID);
						} catch (e) {
							entry.deleteOne();
							return;
						}

						//Handles if the channel doesnt exist
						let channel: TextChannel;
						try {
							channel = guild.channels.cache.get(entry.channelId) as TextChannel;
							if (!channel) channel = await guild.channels.fetch(entry.channelId) as TextChannel;
						} catch (e) {
							entry.deleteOne();
							return;
						}

						//Handels if it is an unknown messae
						let msg: Message<true>;
						try {
							msg = await channel.messages.fetch(entry.message.id);
						} catch (e) {
							entry.deleteOne();
							return;
						}
						if (entry.guildRule.botMessages === true && msg.author.bot) {
							if (msg.deletable && entry.message) {
								await msg.delete();
								await AutoDeleteTimeout.findOneAndDelete({
									guildID: entry.guildID,
									message: entry.message,
									channelId: entry.channelId,
									guildRule: entry.guildRule,
									timestampDeletenDate: entry.timestampDeletenDate,
								});
							}
						} else if (entry.guildRule.userMessages === true && !msg.author.bot) {
							if (msg.deletable && entry.message) {
								await msg.delete();
								await AutoDeleteTimeout.findOneAndDelete({
									guildID: entry.guildID,
									message: entry.message,
									channelId: entry.channelId,
									guildRule: entry.guildRule,
									timestampDeletenDate: entry.timestampDeletenDate,
								});
							}
						}
					}
				} catch (e) {
					entry.deleteOne();
					log.$info('Deleted an entry because of: ' + e)
				}
			});
		},
		null,
		true,
	);
}

export async function handleAutoDelete(message: Message) {
	let { channelId, guildId, channel, author, deletable } = message;
	try {
		if (channel.type === ChannelType.GuildText || channel.type === ChannelType.AnnouncementThread || channel.type == ChannelType.PublicThread) {
			const autoDelete = await AutoDelete.findOne({
				guildID: guildId,
				channelId: channelId,
			});
			if (autoDelete) {
				if (autoDelete.timeout >= 120000) {
					if (message.author.id === message.client.user.id && message.embeds[0].title === "Auto Delete") {
						return;
					}
					try {
						await AutoDeleteTimeout.findOne({ messageId: message.id }).then(async () => {
							await AutoDeleteTimeout.create({
								guildID: message.guildId,
								channelId: message.channelId,
								message: {
									id: message.id,
									channelId: message.channel.id,
									bot: message.author.bot,
								},
								guildRule: autoDelete,
								timestampDeletenDate: message.createdTimestamp + autoDelete.timeout,
							});
						});
					} catch (e) {
						log.$error(`Error | ${e}`);
					}
				} else {
					checkIfDeleteAble(autoDelete, message);
				}
			}
		}
	} catch (e) { }
}

export async function handleAutoDeleteRuleDelete(interaction: ButtonInteraction) {
	if (interaction.isButton() && interaction.customId.split(":")[0] === "autodelete") {
		await interaction.deferReply({ fetchReply: true, ephemeral: true });

		//Language
		let lang: langs;
		const langTabel = await GuildLang.findOne({ Guild: interaction.guildId }).then(async (l) => l);
		if (!langTabel) lang = "en";
		else if (langTabel) lang = `${langTabel.language}`;
		let i18n = new I18n({ commandName: "autodelete", lang: lang });

		try {
			let categorie = interaction.customId.split(`:`)[0];
			if (categorie === "autodelete") {
				let userId = interaction.customId.split(`:`)[4];
				if (userId === interaction.user.id) {
					/**
					 * * 
					  FIXME Es tritt ein unbekannter fehler ab hier auf
					 */

					if (interaction.customId.includes(`autodelete:question:reset:true:${interaction.user.id}`)) {
						let chanId = interaction.customId.split(`:`)[5];
						let collection = await AutoDelete.findOne({
							guildID: interaction.guildId,
							channelId: chanId,
						});

						if (collection) {
							try {
								let cacheChannel = interaction.guild.channels.cache.get(collection.channelId);
								if (cacheChannel === undefined) {
									cacheChannel = (await interaction.guild.channels.fetch(
										collection.channelId,
									)) as TextChannel | PublicThreadChannel;
								}

								/**
								 TODO Throws an err  
								*/
								if (cacheChannel) {
									if (cacheChannel.isTextBased() || cacheChannel.isThread()) {
										let msg = cacheChannel.messages.cache.get(collection.messageId);
										if (msg === undefined) {
											try {
												msg = await cacheChannel.messages.fetch(collection.messageId);
											} catch (e) {
												//
											}
										}
										if (msg) {
											try {
												if (msg.deletable) msg.delete();
											} catch (e) {
												//
											}

										}
									}
								}

								await AutoDelete.findOneAndDelete({ guildID: interaction.guildId, channelId: chanId });

								await interaction.webhook.deleteMessage(interaction.message);
								return interaction.editReply({
									content: await i18n.get(`ruleDelete`, [
										{ text: `channel`, value: `<#${collection.channelId}>` },
									]),
								});
							} catch (e) {
								await interaction.webhook.editMessage(interaction.message, {
									content: interaction.message.content,
									components: [],
								});
								return interaction.editReply({
									content: await i18n.get(`unknownError`),
								});
							}
						} else {
							await interaction.webhook.editMessage(interaction.message, {
								content: interaction.message.content,
								components: [],
							});
							return interaction.editReply({
								content: await i18n.get(`unknownCollection`),
							});
						}
					}
					if (interaction.customId.includes(`autodelete:question:reset:false:${interaction.user.id}`)) {
						await interaction.webhook.editMessage(interaction.message, {
							content: interaction.message.content,
							components: [],
						});
						return interaction.editReply({
							content: await i18n.get(`stop`),
						});
					}
				}
			}
		} catch (e) {
			log.$error(e);
			console.log(e);
			return interaction.editReply({
				content: await i18n.get(`unknownError`),
			});
		}
	}
}