/**
 * ! update the automod when deleteing a user, a role or a channel
 * ! make a button for syncing the automod
 * ! the confirm buttons from the reset button dont work
 *
 * ! nocheinmal alles testen ob es funktioniert
 *
 * interactionAlreadyAckknoledge Fehler beheben
 */

/***
 * ! Imports
 */
import {
	ActionRowBuilder,
	ButtonInteraction,
	Guild,
	PermissionFlagsBits,
	TextChannel,
	ButtonBuilder,
	ButtonStyle,
	AutoModerationActionType,
	ChannelSelectMenuInteraction,
	ComponentType,
	AutoModerationRuleTriggerType,
	AutoModerationRuleEventType,
	MentionableSelectMenuInteraction,
	AutoModerationRuleEditOptions,
	Channel,
	CacheType,
	Interaction,
	AutoModerationAction,
	AutoModerationTriggerMetadata,
	Collection,
	GuildBasedChannel,
	Role,
	AutoModerationActionOptions,
	AutoModerationRuleCreateOptions,
} from "discord.js";
import AntiPing, { AntiPingDocument } from "../database/antiping.js";
import { I18n, langs } from "./i18n.js";
import GuildLang from "../database/lang.js";
import newMsgComponents from "./antiPingHandler.editMessageComponents.js";
import { formatDuration, msToHhMmSs, msToMmSs } from "../../lib/utils/TimeUtil.js";
import { log } from "../main.js";

/***
 * ! Function Event Specific
 */

export async function handleAntiPingInteractions(interaction: Interaction<CacheType>) {
	if (interaction.isChannelSelectMenu()) {
		await interaction.deferReply({ fetchReply: true, ephemeral: true });
		AntiPingSelectMenu(interaction);
	} else if (interaction.isMentionableSelectMenu()) {
		await interaction.deferReply({ fetchReply: true, ephemeral: true });
		AntiPingSelectMenu(interaction);
	} else if (interaction.isButton() && interaction.customId.split(":")[0] === "antiping") {
		await interaction.deferReply({ fetchReply: true, ephemeral: true });
		toggleAutoMod(interaction);
		toggleSendEmbedWithContent(interaction);
		resetAntiPingSystem(interaction);
		updateAutoModRule(interaction);
	}
}

/***
 * ! Menu
 */
/**
 * *
 * *
 * *
 * *
 * *
 * *
 * *
 * *
 * *
 * * ****************************************************   New Menu Start  ********************************************************
 * *
 * *
 * *
 * *
 * *
 * *
 * *
 * *
 * *
 * *
 */

export async function testChannel(channel: Channel) {
	try {
		let ch = (await channel.fetch(true)) as TextChannel;

		let tested: string[] = [];
		let allPerms: boolean = true;

		// ViewChannel
		if (ch.permissionsFor(ch.guild.members.me).has(PermissionFlagsBits.ViewChannel)) {
			tested.push(`✅ \`ViewChannel\``);
		} else {
			tested.push(`❌ \`ViewChannel\``);
			allPerms = false;
		}

		//SendMessages
		if (ch.permissionsFor(ch.guild.members.me).has(PermissionFlagsBits.SendMessages))
			tested.push(`✅ \`SendMessages\``);
		else {
			tested.push(`❌ \`SendMessages\``);
			allPerms = false;
		}

		//EmbedLinks
		if (ch.permissionsFor(ch.guild.members.me).has(PermissionFlagsBits.EmbedLinks))
			tested.push(`✅ \`EmbedLinks\``);
		else {
			tested.push(`❌ \`EmbedLinks\``);
			allPerms = false;
		}

		return { tested, allPerms };
	} catch (e) {
		let tested = [`❌ \`ViewChannel\``, `❌ \`SendMessages\``, `❌ \`EmbedLinks\``];
		let allPerms = false;
		return {
			tested,
			allPerms,
		};
	}
}

export async function AntiPingSelectMenu(interaction: MentionableSelectMenuInteraction | ChannelSelectMenuInteraction) {
	try {
		let categorie = interaction.customId.split(`:`)[0];
		if (categorie === "antiping") {
			//Language
			let lang: langs;
			const langTabel = await GuildLang.findOne({ Guild: interaction.guildId }).then(async (l) => l);
			if (!langTabel) lang = "en";
			else if (langTabel) lang = `${langTabel.language}`;
			let i18n = new I18n({ commandName: "antiping", lang: lang });

			/**
			 * Wich changes to role or user i need to make this changes for the other one too
			 */
			if (interaction.isMentionableSelectMenu()) {
				//antiping:menu:select:<entity/channel>:<userID>
				let userId = interaction.customId.split(`:`)[4];
				if (interaction.user.id === userId) {
					if (interaction.guild.members.me.permissions.has("ManageGuild") !== true)
						return interaction.editReply(await i18n.get("missingGuildPerms"));
					let i = interaction as MentionableSelectMenuInteraction;

					if (i.roles.size !== 0) {
						let role = i.roles.at(0);
						if (role.managed)
							return interaction.editReply({
								content: await i18n.get("roleManged"),
							});

						//search collection
						let collection = await AntiPing.findOne({ guildID: i.guildId }).then(async (c) => c);
						if (collection) {
							/**Remove member */
							if (collection.allowedRoles.some((r) => r === role.id)) {
								let filter = collection.allowedRoles.filter((r) => r !== role.id);
								await AntiPing.findOneAndUpdate(
									{
										guildID: i.guildId,
									},
									{
										$set: {
											allowedRoles: filter,
										},
									},
								);
								const newFetchedCollection = await AntiPing.findOne({
									guildID: interaction.guildId,
								}).then((t) => t as AntiPingDocument);
								let comp = await newMsgComponents(interaction, newFetchedCollection, i18n);
								await interaction.message.edit({
									embeds: [comp.embed],
									components: [comp.selectMenuRow, comp.channelSelectMenuRow, comp.otherSettingsRow, comp.otherSettingsSecondRow],
								});
								return interaction.editReply({
									content: await i18n.get("roleRemoved", [{ text: `role`, value: `${role}` }]),
								});
							} else {
								//Add member
								let filter = collection.allowedRoles;
								filter.push(role.id as any);
								await AntiPing.findOneAndUpdate(
									{
										guildID: i.guildId,
									},
									{
										$set: {
											allowedRoles: filter,
										},
									},
								);

								const newFetchedCollection = await AntiPing.findOne({
									guildID: interaction.guildId,
								}).then((t) => t as AntiPingDocument);
								let comp = await newMsgComponents(interaction, newFetchedCollection, i18n);
								await interaction.message.edit({
									embeds: [comp.embed],
									components: [comp.selectMenuRow, comp.channelSelectMenuRow, comp.otherSettingsRow, comp.otherSettingsSecondRow],
								});
								return interaction.editReply({
									content: await i18n.get("roleAdded", [{ text: `role`, value: `${role}` }]),
								});
							}
							//new Collection
						} else {
							let coll = await AntiPing.create({
								guildID: i.guildId,
								allowedRoles: [role.id],
							});
							const newFetchedCollection = await AntiPing.findOne({ guildID: interaction.guildId }).then(
								(t) => t as AntiPingDocument,
							);
							let comp = await newMsgComponents(interaction, newFetchedCollection, i18n);
							await interaction.message.edit({
								embeds: [comp.embed],
								components: [comp.selectMenuRow, comp.channelSelectMenuRow, comp.otherSettingsRow, comp.otherSettingsSecondRow],
							});
							return interaction.editReply({
								content: await i18n.get("roleAdded", [
									{ text: `role`, value: `<@&${coll.allowedRoles.at(0)}>` },
								]),
							});
						}
					} else if (i.users.size !== 0) {
						let user = i.users.at(0);
						if (user.bot) return interaction.editReply({ content: await i18n.get("userIsBot") });
						if (user.system) return interaction.editReply({ content: await i18n.get("userIsSystem") });

						//search collection
						let collection = await AntiPing.findOne({ guildID: i.guildId }).then(async (c) => c);
						if (collection) {
							/**Remove member */
							if (collection.userArray.some((u) => u === user.id)) {
								let filter = collection.userArray.filter((u) => u !== user.id);
								await AntiPing.findOneAndUpdate(
									{
										guildID: i.guildId,
									},
									{
										$set: {
											userArray: filter,
										},
									},
								);
								const newFetchedCollection = await AntiPing.findOne({
									guildID: interaction.guildId,
								}).then((t) => t as AntiPingDocument);
								let comp = await newMsgComponents(interaction, newFetchedCollection, i18n);
								await interaction.message.edit({
									embeds: [comp.embed],
									components: [comp.selectMenuRow, comp.channelSelectMenuRow, comp.otherSettingsRow, comp.otherSettingsSecondRow],
								});
								return interaction.editReply({
									content: await i18n.get("userRemoved", [{ text: `user`, value: `${user}` }]),
								});
							} else {
								//Add member
								let filter = collection.userArray;
								filter.push(user.id as any);
								await AntiPing.findOneAndUpdate(
									{
										guildID: i.guildId,
									},
									{
										$set: {
											userArray: filter,
										},
									},
								);
								const newFetchedCollection = await AntiPing.findOne({
									guildID: interaction.guildId,
								}).then((t) => t as AntiPingDocument);
								let comp = await newMsgComponents(interaction, newFetchedCollection, i18n);
								await interaction.message.edit({
									embeds: [comp.embed],
									components: [comp.selectMenuRow, comp.channelSelectMenuRow, comp.otherSettingsRow, comp.otherSettingsSecondRow],
								});
								return interaction.editReply({
									content: await i18n.get("userAdded", [{ text: `user`, value: `${user}` }]),
								});
							}
							//new Collection
						} else {
							let coll = await AntiPing.create({
								guildID: i.guildId,
								userArray: [user.id],
							});
							const newFetchedCollection = await AntiPing.findOne({ guildID: interaction.guildId }).then(
								(t) => t as AntiPingDocument,
							);
							let comp = await newMsgComponents(interaction, newFetchedCollection, i18n);
							await interaction.message.edit({
								embeds: [comp.embed],
								components: [comp.selectMenuRow, comp.channelSelectMenuRow, comp.otherSettingsRow, comp.otherSettingsSecondRow],
							});
							return interaction.editReply({
								content: await i18n.get("userAdded", [
									{ text: `user`, value: `<@${coll.userArray.at(0)}>` },
								]),
							});
						}
					}
				} else {
					return interaction.editReply({ content: await i18n.get("interactionMemberNotAllowd") });
				}
			} else if (interaction.isChannelSelectMenu()) {
				//antiping:menu:select:<entity/channel>:<userID>
				let userId = interaction.customId.split(`:`)[4];
				if (interaction.user.id === userId) {
					if (interaction.guild.members.me.permissions.has("ManageGuild") !== true)
						return interaction.editReply(await i18n.get("missingGuildPerms"));
					//transform interaction type
					let i = interaction as ChannelSelectMenuInteraction;
					let channel = i.channels.at(0) as Channel;

					let testResult = await testChannel(channel);

					//search collection
					let collection = await AntiPing.findOne({ guildID: i.guildId }).then(async (c) => c);
					if (collection) {
						if (collection.logChannel === channel.id) {
							await AntiPing.findOneAndUpdate(
								{ guildID: i.guildId },
								{
									$set: {
										logChannel: null,
									},
								},
							);
							const newFetchedCollection = await AntiPing.findOne({ guildID: interaction.guildId }).then(
								(t) => t as AntiPingDocument,
							);
							let comp = await newMsgComponents(interaction, newFetchedCollection, i18n);
							await interaction.message.edit({
								embeds: [comp.embed],
								components: [comp.selectMenuRow, comp.channelSelectMenuRow, comp.otherSettingsRow, comp.otherSettingsSecondRow],
							});
							return interaction.editReply({
								content: await i18n.get("channelRemoved", [{ text: `channel`, value: `${channel}` }]),
							});
						} else {
							if (testResult.allPerms === false) {
								return interaction.editReply({
									content: await i18n.get("channelMissingPerms", [
										{ text: `perms`, value: `${testResult.tested.join(`\n`)}` },
									]),
								});
							} else {
								await AntiPing.findOneAndUpdate(
									{ guildID: i.guildId },
									{
										$set: {
											logChannel: channel.id,
										},
									},
								);
								const newFetchedCollection = await AntiPing.findOne({
									guildID: interaction.guildId,
								}).then((t) => t as AntiPingDocument);
								let comp = await newMsgComponents(interaction, newFetchedCollection, i18n);
								await interaction.message.edit({
									embeds: [comp.embed],
									components: [comp.selectMenuRow, comp.channelSelectMenuRow, comp.otherSettingsRow, comp.otherSettingsSecondRow],
								});
								return interaction.editReply({
									content: await i18n.get("channelAdded", [
										{ text: `channel`, value: `${channel}` },
										{ text: `perms`, value: `${testResult.tested.join(`\n`)}` },
									]),
								});
							}
						}
					} else if (!collection) {
						if (testResult.allPerms === false) {
							return interaction.editReply({
								content: await i18n.get("channelMissingPerms", [
									{ text: `perms`, value: `${testResult.tested.join(`\n`)}` },
								]),
							});
						} else {
							let coll = await AntiPing.create({
								guildID: i.guildId,
								logChannel: channel.id,
							});
							const newFetchedCollection = await AntiPing.findOne({ guildID: interaction.guildId }).then(
								(t) => t as AntiPingDocument,
							);
							let comp = await newMsgComponents(interaction, newFetchedCollection, i18n);
							await interaction.message.edit({
								embeds: [comp.embed],
								components: [comp.selectMenuRow, comp.channelSelectMenuRow, comp.otherSettingsRow, comp.otherSettingsSecondRow],
							});
							return interaction.editReply({
								content: await i18n.get("channelAdded", [
									{ text: `channel`, value: `${channel}` },
									{ text: `perms`, value: `${testResult.tested.join(`\n`)}` },
								]),
							});
						}
					}
				} else {
					return interaction.editReply({ content: await i18n.get("interactionMemberNotAllowd") });
				}
			}
		}
	} catch (e) {
		log.$error(e);
		return interaction.editReply({ content: `${e}` });
	}
}

export async function updateAutoModRule(interaction: ButtonInteraction) {
	try {
		//Language
		let lang: langs;
		const langTabel = await GuildLang.findOne({ Guild: interaction.guildId }).then(async (l) => l);
		if (!langTabel) lang = "en";
		else if (langTabel) lang = `${langTabel.language}`;
		let i18n = new I18n({ commandName: "antiping", lang: lang });

		let categorie = interaction.customId.split(`:`)[0];
		if (categorie === "antiping") {
			let userId = interaction.customId.split(`:`)[4];
			if (userId === interaction.user.id) {
				if (interaction.customId.split(":")[2] === `sync`) {
					if (interaction.guild.members.me.permissions.has("ManageGuild") !== true)
						return interaction.editReply(await i18n.get("missingGuildPerms"));
					let collection = await AntiPing.findOne({ guildID: interaction.guild.id }).then(
						(c) => c as AntiPingDocument,
					);

					if (collection) {
						if (
							collection.autoModUpdateTimeout == null ||
							new Date().getTime() >= collection.autoModUpdateTimeout
						) {
							if (collection.usesAutoMod === true && collection.safedAutoModRuleID !== null) {
								let autoModRule = interaction.guild.autoModerationRules.cache.get(
									collection.safedAutoModRuleID,
								);
								if (autoModRule === undefined)
									autoModRule = (
										await interaction.guild.autoModerationRules.fetch({ cache: true })
									).get(collection.safedAutoModRuleID);
								if (autoModRule === undefined || autoModRule === null)
									return interaction.editReply({ content: await i18n.get("couldNotSync") });

								interface IDataForEdit {
									actions?: AutoModerationActionOptions[];
									enabled?: boolean;
									exemptRoles?: Collection<string, Role> | string[];
									exemptChannels?: Collection<string, GuildBasedChannel> | string[];
									triggerMetadata?: AutoModerationTriggerMetadata | { keywordFilter: string[] };
								}

								let oldAutoModRuleValues: IDataForEdit = {
									actions: autoModRule.actions,
									enabled: autoModRule.enabled,
									exemptRoles: autoModRule.exemptRoles,
									exemptChannels: autoModRule.exemptChannels,
									triggerMetadata: autoModRule.triggerMetadata,
								};

								let SyncOptions: IDataForEdit = {};

								collection.usesAutoMod === true
									? (SyncOptions.enabled = true)
									: (SyncOptions.enabled = false);

								if (collection.allowedRoles.length !== 0) {
									SyncOptions.exemptRoles = collection.allowedRoles as string[];
								}
								if (collection.logChannel !== null) {
									SyncOptions.actions = [
										{
											type: AutoModerationActionType.SendAlertMessage,
											metadata: {
												channel: collection.logChannel as string,
											},
										},
										{
											type: AutoModerationActionType.BlockMessage,
											metadata: {
												customMessage: await i18n.get("warn.automod"),
											},
										},
									];
									SyncOptions.exemptChannels = [collection.logChannel as string];
								}

								if (collection.userArray.length !== 0) {
									SyncOptions.triggerMetadata = {
										keywordFilter: collection.userArray.map((u: any) => `<@${u}>`),
									};
								}

								await AntiPing.findOneAndUpdate(
									{
										guildID: interaction.guildId,
									},
									{
										$set: {
											autoModUpdateTimeout: new Date().getTime() + 300000,
										},
									},
								);

								autoModRule.edit(SyncOptions);
								return interaction.editReply({ content: await i18n.get("couldSync") });
							} else {
								return interaction.editReply({ content: await i18n.get("couldNotSync") });
							}
						} else {
							return interaction.editReply({
								content: await i18n.get("onTimeout", [
									{
										text: `time`,
										value: `${msToMmSs(collection.autoModUpdateTimeout - new Date().getTime())}`,
									},
								]),
							});
						}
					} else {
						return interaction.editReply({ content: await i18n.get("noCollection") });
					}
				}
			} else {
				return interaction.editReply({ content: await i18n.get("interactionMemberNotAllowd") });
			}
		}
	} catch (e) {
		log.$error(e);
		return interaction.editReply({ content: `${e}` });
	}
}

export async function resetAntiPingSystem(interaction: ButtonInteraction) {
	//!interaction is defeered and ephermal
	try {
		//Language
		let lang: langs;
		const langTabel = await GuildLang.findOne({ Guild: interaction.guildId }).then(async (l) => l);
		if (!langTabel) lang = "en";
		else if (langTabel) lang = `${langTabel.language}`;
		let i18n = new I18n({ commandName: "antiping", lang: lang });

		let categorie = interaction.customId.split(`:`)[0];
		if (categorie === "antiping") {
			let userId = interaction.customId.split(`:`)[4];
			if (userId === interaction.user.id) {
				if (interaction.customId === `antiping:question:reset:true:${interaction.user.id}`) {
					let collection = await AntiPing.findOne({
						guildID: interaction.guildId,
					});
					if (collection) {
						try {
							await interaction.guild.autoModerationRules.cache
								.get(collection.safedAutoModRuleID as string)
								.delete();
						} catch (e) { }

						await AntiPing.findOneAndDelete({ guildID: interaction.guildId });

						return interaction.editReply({ content: await i18n.get("auditLogMsg") });
					} else {
						return interaction.editReply({ content: await i18n.get("noCollection") });
					}
				}
				if (interaction.customId === `antiping:question:reset:false:${interaction.user.id}`) {
					return interaction.editReply({ content: await i18n.get("stopInfo") });
				}

				if (interaction.customId.split(":")[2] === `reset`) {
					if (interaction.guild.members.me.permissions.has("ManageGuild") !== true)
						return interaction.editReply(await i18n.get("missingGuildPerms"));
					return interaction.editReply({
						content: await i18n.get("quest"),
						components: [
							new ActionRowBuilder<ButtonBuilder>().setComponents([
								new ButtonBuilder()
									.setCustomId(`antiping:question:reset:true:${interaction.user.id}`)
									.setLabel(await i18n.get("yes"))
									.setStyle(ButtonStyle.Success),
								new ButtonBuilder()
									.setCustomId(`antiping:question:reset:false:${interaction.user.id}`)
									.setLabel(await i18n.get("no"))
									.setStyle(ButtonStyle.Danger),
							]),
						],
					});
				}
			} else {
				return interaction.editReply({ content: await i18n.get("interactionMemberNotAllowd") });
			}
		}
	} catch (e) {
		log.$error(e);
		return interaction.editReply({ content: `${e}` });
	}
}

export async function toggleAutoMod(interaction: ButtonInteraction) {
	//!interaction is defeered
	try {
		//Language
		let lang: langs;
		const langTabel = await GuildLang.findOne({ Guild: interaction.guildId }).then(async (l) => l);
		if (!langTabel) lang = "en";
		else if (langTabel) lang = `${langTabel.language}`;
		let i18n = new I18n({ commandName: "antiping", lang: lang });

		let categorie = interaction.customId.split(`:`)[0];
		if (categorie === "antiping") {
			let userId = interaction.customId.split(`:`)[4];
			if (userId === interaction.user.id) {
				if (interaction.customId.split(":")[2] === `toggleAutomod`) {
					if (interaction.guild.members.me.permissions.has("ManageGuild") !== true)
						return interaction.editReply(await i18n.get("missingGuildPerms"));
					let collection = await AntiPing.findOne({ guildID: interaction.guildId }).then(async (c) => c);
					if (!collection)
						return interaction.editReply({
							content: await i18n.get("noChange"),
						});

					if (collection) {
						/**
						 [ ] automod ist NICHT aktiviert und es ist KEINE regel id vorhanden
							  -> aktiviern
								-> datenbank updaten und regel erstellen
						 [ ] automod ist NICHT aktiviert und es ist EINE regel id vorhanden
							  -> aktiviern
								-> datenbank updaten und regel updaten
						 */

						//if block where i deactived the rule
						if (collection.usesAutoMod === true && collection.safedAutoModRuleID !== null) {
							let guildAutoModRule = interaction.guild.autoModerationRules.cache.get(
								collection.safedAutoModRuleID,
							);
							if (guildAutoModRule === undefined)
								guildAutoModRule = (
									await interaction.guild.autoModerationRules.fetch({ cache: true })
								).get(collection.safedAutoModRuleID);

							//automodRule is not is not avalible
							if (!guildAutoModRule) {
								await AntiPing.findOneAndUpdate(
									{ guildID: interaction.guildId },
									{
										$set: {
											usesAutoMod: false,
											safedAutoModRuleID: null,
										},
									},
								);
								//should return an error
								return interaction.editReply({
									content: await i18n.get("ruleError"),
								});
							}
							//automodRule is avalible
							else {
								//rule is enabled
								if (guildAutoModRule.enabled === true) {
									await guildAutoModRule.edit({
										enabled: false,
									});
									await AntiPing.findOneAndUpdate(
										{ guildID: interaction.guildId },
										{
											$set: {
												usesAutoMod: false,
											},
										},
									);

									const newFetchedCollection = await AntiPing.findOne({
										guildID: interaction.guildId,
									}).then((t) => t as AntiPingDocument);
									let comp = await newMsgComponents(interaction, newFetchedCollection, i18n);
									await interaction.message.edit({
										embeds: [comp.embed],
										components: [
											comp.selectMenuRow,
											comp.channelSelectMenuRow,
											comp.otherSettingsRow,
											comp.otherSettingsSecondRow
										],
									});

									//should return a success
									return interaction.editReply({
										content: await i18n.get("automodOFF"),
									});
								}
								//rule is not enabled
								else if (guildAutoModRule.enabled === false) {
									await AntiPing.findOneAndUpdate(
										{ guildID: interaction.guildId },
										{
											$set: {
												usesAutoMod: false,
											},
										},
									);

									const newFetchedCollection = await AntiPing.findOne({
										guildID: interaction.guildId,
									}).then((t) => t as AntiPingDocument);
									let comp = await newMsgComponents(interaction, newFetchedCollection, i18n);
									await interaction.message.edit({
										embeds: [comp.embed],
										components: [
											comp.selectMenuRow,
											comp.channelSelectMenuRow,
											comp.otherSettingsRow,
											comp.otherSettingsSecondRow
										],
									});

									//should return a success
									return interaction.editReply({
										content: await i18n.get("automodOFF"),
									});
								}
							}
						}

						//if block where i activate the rule
						else if (collection.usesAutoMod === false) {
							//rule id is avalible
							if (collection.safedAutoModRuleID !== null) {
								let autoModRule = interaction.guild.autoModerationRules.cache.get(
									collection.safedAutoModRuleID,
								);
								try {
									if (typeof autoModRule === "undefined")
										(await interaction.guild.autoModerationRules.fetch()).get(
											collection.safedAutoModRuleID,
										);
								} catch (e) {
									return interaction.editReply({
										content: await i18n.get("ruleError"),
									});
								}

								//rule enabled === true -> update db
								if (autoModRule && autoModRule.enabled === true) {
									await AntiPing.findOneAndUpdate(
										{
											guildID: interaction.guildId,
										},
										{
											$set: {
												usesAutoMod: true,
											},
										},
									);

									const newFetchedCollection = await AntiPing.findOne({
										guildID: interaction.guildId,
									}).then((t) => t as AntiPingDocument);
									let comp = await newMsgComponents(interaction, newFetchedCollection, i18n);
									await interaction.message.edit({
										embeds: [comp.embed],
										components: [
											comp.selectMenuRow,
											comp.channelSelectMenuRow,
											comp.otherSettingsRow,
											comp.otherSettingsSecondRow
										],
									});
									//should return a success
									return interaction.editReply({
										content: await i18n.get("automodON"),
									});
								}

								//rule enabled === false -> update db and rule
								else if (autoModRule && autoModRule.enabled === false) {
									await AntiPing.findOneAndUpdate(
										{
											guildID: interaction.guildId,
										},
										{
											$set: {
												usesAutoMod: true,
											},
										},
									);

									await autoModRule.edit({ enabled: true });

									const newFetchedCollection = await AntiPing.findOne({
										guildID: interaction.guildId,
									}).then((t) => t as AntiPingDocument);
									let comp = await newMsgComponents(interaction, newFetchedCollection, i18n);
									await interaction.message.edit({
										embeds: [comp.embed],
										components: [
											comp.selectMenuRow,
											comp.channelSelectMenuRow,
											comp.otherSettingsRow,
											comp.otherSettingsSecondRow
										],
									});
									//should return a success
									return interaction.editReply({
										content: await i18n.get("automodON"),
									});
								}
							}
							//rule id is not avalible
							else if (collection.safedAutoModRuleID === null) {
								let autoModerationRuleCreateOptions: AutoModerationRuleCreateOptions = {
									enabled: true,
									actions: [
										{
											type: AutoModerationActionType.BlockMessage,
											metadata: {
												customMessage: await i18n.get("warn.automod"),
											},
										},
									],
									eventType: AutoModerationRuleEventType.MessageSend,
									name: `Acronix Anti Ping`,
									triggerType: AutoModerationRuleTriggerType.Keyword,
								};

								//users
								if (collection.userArray !== null && collection.userArray.length > 0) {
									autoModerationRuleCreateOptions.triggerMetadata = {
										keywordFilter: collection.userArray.map((u: any) => `<@${u}>`),
									};
								} else {
									//fallback
									autoModerationRuleCreateOptions.triggerMetadata = {
										keywordFilter: [await i18n.get("autoModRuleTriggerWordPlaceholder")],
									};
								}

								//roles
								if (collection.allowedRoles.length !== 0) {
									autoModerationRuleCreateOptions.exemptRoles = collection.allowedRoles;
								}
								//logchannel
								if (collection.logChannel !== null) {
									autoModerationRuleCreateOptions.actions = [
										{
											type: AutoModerationActionType.SendAlertMessage,
											metadata: {
												channel: collection.logChannel,
											},
										},
										{
											type: AutoModerationActionType.BlockMessage,
											metadata: {
												customMessage: await i18n.get("warn.automod"),
											},
										},
									];
									autoModerationRuleCreateOptions.exemptChannels = [collection.logChannel];
								}

								let newRule = await interaction.guild.autoModerationRules.create(
									autoModerationRuleCreateOptions,
								);
								await AntiPing.findOneAndUpdate(
									{
										guildID: newRule.guild.id,
									},
									{
										$set: {
											safedAutoModRuleID: newRule.id,
											usesAutoMod: true,
										},
									},
								);

								const newFetchedCollection = await AntiPing.findOne({
									guildID: interaction.guildId,
								}).then((t) => t as AntiPingDocument);
								let comp = await newMsgComponents(interaction, newFetchedCollection, i18n);
								await interaction.message.edit({
									embeds: [comp.embed],
									components: [comp.selectMenuRow, comp.channelSelectMenuRow, comp.otherSettingsRow, comp.otherSettingsSecondRow],
								});

								//should return a success
								return interaction.editReply({
									content: await i18n.get("automodON"),
								});
							}
						}
					}
				}
			} else {
				return interaction.editReply({ content: await i18n.get("interactionMemberNotAllowd") });
			}
		}
	} catch (e) {
		log.$error(e);
		return interaction.editReply({ content: `${e}` });
	}
}

export async function toggleSendEmbedWithContent(interaction: ButtonInteraction) {
	//!interaction is defeered
	try {
		//Language
		let lang: langs;
		const langTabel = await GuildLang.findOne({ Guild: interaction.guildId }).then(async (l) => l);
		if (!langTabel) lang = "en";
		else if (langTabel) lang = `${langTabel.language}`;
		let i18n = new I18n({ commandName: "antiping", lang: lang });

		let categorie = interaction.customId.split(`:`)[0];
		if (categorie === "antiping") {
			let userId = interaction.customId.split(`:`)[4];
			if (userId === interaction.user.id) {
				if (interaction.customId.split(":")[2] === `embedWithContent`) {
					if (interaction.guild.members.me.permissions.has("ManageGuild") !== true) {
						return interaction.editReply(await i18n.get("missingGuildPerms"));
					}

					let collection = await AntiPing.findOne({ guildID: interaction.guildId }).then(async (c) => c);
					if (!collection) {
						return interaction.editReply({
							content: await i18n.get("noChange"),
						});
					}

					if (collection) {
						await AntiPing.findOneAndUpdate(
							{
								guildID: interaction.guildId,
							},
							{
								sendEmbedWithContent: !collection.sendEmbedWithContent
							},
						);

						const newFetchedCollection = await AntiPing.findOne({
							guildID: interaction.guildId,
						}).then((t) => t as AntiPingDocument);

						let comp = await newMsgComponents(interaction, newFetchedCollection, i18n);
						await interaction.message.edit({
							embeds: [comp.embed],
							components: [comp.selectMenuRow, comp.channelSelectMenuRow, comp.otherSettingsRow, comp.otherSettingsSecondRow],
						});

						return interaction.editReply({
							content: await i18n.get(newFetchedCollection.sendEmbedWithContent === true ? "mentionNoticeValue" : "mentionNoticeValueDeactivated")
						})
					}
				}
			} else {
				return interaction.editReply({ content: await i18n.get("interactionMemberNotAllowd") });
			}
		}
	} catch (e) {
		log.$error(e);
		return interaction.editReply({ content: `${e}` });
	}
}

/**
 * *
 * *
 * *
 * *
 * *
 * *
 * *
 * *
 * *
 * * ****************************************************   New Menu End  ********************************************************
 * *
 * *
 * *
 * *
 * *
 * *
 * *
 * *
 * *
 * *
 */
