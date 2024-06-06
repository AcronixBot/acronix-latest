import { log } from "../main.js";
import {
	SlashCommandBuilder,
	PermissionFlagsBits,
	EmbedBuilder,
	ApplicationFlagsBitField,
	Snowflake,
	Colors,
	APIEmbedField,
	BitFieldResolvable,
	ApplicationFlagsString,
	UserFlags,
	GuildTextBasedChannel,
	TextChannel,
	ThreadChannel,
	VoiceChannel,
	NewsChannel,
	ForumChannel,
	StageChannel,
	CategoryChannel,
	ChatInputCommandInteraction,
	RoleTagData,
	ApplicationCommandType,
	ApplicationCommandOptionType,
	PermissionsBitField,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} from "discord.js";
import {
	ApplicationFlags,
	ISlashCommand,
	GuildFeature,
	ChannelType,
	GuildVerificationLevel,
} from "../../lib/bot/CustomClientTypes.js";
import type { ApplicationRPC, JAPIApplicationRoot } from "../../lib/bot/CustomClientTypes.js";
import { formatApplicationFlag, formatGuildFeatures } from "../../lib/utils/index.js";
import { DiscordBotClient } from "../main.js";
import SnowflakeClass from "../../lib/utils/SnowflakeUtil.js";
import os from "os";
import { UserFlagsBitField } from "discord.js";
import { getEmoji } from "../Handlers/emojis.js";
import { addSpaceBeforeUpperCasePascalCase, snakeCaseToCamelCase } from "../Handlers/SnakeToCamelCase.js";

import { Command } from "../../lib/bot/Commands/Command.js";
import { CustomClient } from "lib/bot/CustomClient.js";
import { AllInteractionTypes } from "../Events/interactionCreate.js";
import { I18n } from "../Handlers/i18n.js";

import * as fs from 'fs';
import { exec } from 'child_process'

const loadJSON = (path) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)).toString('utf-8'));
const packageJson = loadJSON('../../package.json')

export default class InfoCommand extends Command {
	constructor() {
		super({
			category: 'Info',
			description: {
				key: "The command that bundles all info commands",
			},
			name: {
				key: "info",
			},
			type: ApplicationCommandType.ChatInput,
			clientPermissions: 'SendMessages',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'appinfo',
					description: 'Displays info about a discord app',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							description: 'The Id from the app',
							name: 'id',
							required: true,
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'snowflake',
					description: 'Returns an embed to a discord snowflake (ID)',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							description: 'The snowflake (ID)',
							name: 'snowflake',
							required: true,
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'assets',
					description: 'Returns embeds with profile emage/banner & server image/banner from a member',
					options: [
						{
							type: ApplicationCommandOptionType.User,
							description: 'The discord user',
							name: 'user'
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'server',
					description: 'A few infos about the current Server',
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'acronix',
					description: 'Base information about me',
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'membercount',
					description: 'Member Count from the Server',
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'user',
					description: 'Userinfo command to get information about a user',
					options: [
						{
							type: ApplicationCommandOptionType.User,
							description: 'The user',
							required: true,
							name: 'user',
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'channel',
					description: 'Channelinfo command to get information about a channel',
					options: [
						{
							type: ApplicationCommandOptionType.Channel,
							description: 'The channel',
							required: true,
							name: 'channel',
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'role',
					description: 'Roleinfo command to get information about a role',
					options: [
						{
							type: ApplicationCommandOptionType.Role,
							description: 'The role',
							required: true,
							name: 'role',
						}
					]
				},

			]
		})
	}

	public async execute(client: CustomClient, interaction: AllInteractionTypes, i18n: I18n) {
		if (!this.isChatInput(interaction)) return;

		switch (interaction.options.getSubcommand()) {
			case "acronix": {
				//TODO User freundlich gerstallten. Invite und App Dir hinzufügen, etc...

				//server, ram usage, ping, uptime, djs, ts and nodejs version, developer, invite button, support server button

				let servers = interaction.client.guilds.cache.size;
				let ramUsage = `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`;
				let APIPing = client.ws.ping;

				function MSToTime(ms: number) {
					let RoundNumber = ms > 0 ? Math.floor : Math.ceil;
					let Days = RoundNumber(ms / 86400000);
					let Hours = RoundNumber(ms / 3600000) % 24;
					let Mins = RoundNumber(ms / 60000) % 60;
					let Secs = RoundNumber(ms / 1000) % 60;

					let time = Days > 0 ? `${Days} Day${Days === 1 ? "" : "s"}, ` : "";
					time += Hours > 0 ? `${Hours} Hour${Hours === 1 ? "" : "s"}, ` : "";
					time += Mins > 0 ? `${Mins} Minute${Mins === 1 ? "" : "s"} and ` : "";
					time += Secs > 0 ? `${Secs} Second${Secs === 1 ? "" : "s"}.` : "0 Seconds.";

					return time;
				}
				let uptime = MSToTime(interaction.client.uptime);

				const nodeJsVersion = (await exec('node -v').stdout.toArray()).toString().replaceAll("\n", "");
				const dev = client.users.cache.get("863453422632173568");

				const embed = new EmbedBuilder()
					.setColor("#04a2f0")
					.setAuthor({ name: interaction.client.user.username })
					.setDescription(
						[
							`## ${client.user.username} Statistiken`,
							`\`-\` Server: **${servers}**`,
							`\`-\` Ram usage: **${ramUsage}**`,
							`\`-\` Ping: **${APIPing}**`,
							`\`-\` Uptime: **${uptime}**`,
							`\`-\` Discord.js Version: **${packageJson.dependencies["discord.js"].replace("^", "v")}**`,
							`\`-\` Typescript Version: **${packageJson.devDependencies["typescript"].replace("^", "v")}**`,
							`\`-\` NodeJS Version: **${nodeJsVersion}**`,
							`\`-\` Developer: **${dev.username}** (\`${dev.id}\`)`,
						].join("\n")
					)

				const buttons = new ActionRowBuilder<ButtonBuilder>().setComponents([
					new ButtonBuilder()
						.setLabel('Invite me')
						.setStyle(ButtonStyle.Link)
						.setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=1376537373730&scope=bot%20applications.commands`),
					new ButtonBuilder()
						.setLabel('Support Server')
						.setStyle(ButtonStyle.Link)
						.setURL(`https://discord.gg/sj3ZTNn9d7`),
				])

				return interaction.reply({
					embeds: [
						embed
					],
					components: [
						buttons
					]
				});
			}
			case "assets": {
				/**
				 TODO er nimmt nicht die Person von der Option
				 */

				const { options, member, guild } = interaction;
				let amember = options.getUser("user") || interaction.member;
				/**@ts-ignore */
				let assetsMember = await guild?.members.fetch(amember);
				/**@ts-ignore */
				let forceFetched = await DiscordBotClient?.users.fetch(amember?.id, { force: true });
				if (!assetsMember) return interaction.reply({ content: await i18n.get("noMember"), ephemeral: true });

				let baseEmbed = new EmbedBuilder()
					.setColor("#2f3136")
					.setTimestamp()
					.setTitle(
						await i18n.get("Assetstitle", [{ text: "member", value: `${assetsMember.user.username}` }]),
					)
					.setDescription(await i18n.get("description"));

				let embedArray = [];
				let ephemeralStatus = false;

				embedArray.push(baseEmbed);

				if (assetsMember.user.avatar) {
					let avatarEmbed = new EmbedBuilder()
						.setColor("#2f3136")
						.setDescription(
							`Avatar\n[PNG](https://cdn.discordapp.com/avatars/${assetsMember.id}/${assetsMember.user.avatar}.png) | [JPEG](https://cdn.discordapp.com/avatars/${assetsMember.id}/${assetsMember.user.avatar}.jpeg) | [GIF](https://cdn.discordapp.com/avatars/${assetsMember.id}/${assetsMember.user.avatar}.gif)`,
						)
						.setImage(
							`https://cdn.discordapp.com/avatars/${assetsMember.id}/${assetsMember.user.avatar}.png`,
						);

					embedArray.push(avatarEmbed);
				}

				if (forceFetched.banner) {
					let bannerEmbed = new EmbedBuilder()
						.setColor("#2f3136")
						.setDescription(
							`Banner\n[PNG](https://cdn.discordapp.com/banners/${forceFetched.id}/${forceFetched.banner}.png?size=1024) | [JPEG](https://cdn.discordapp.com/banners/${forceFetched.id}/${forceFetched.banner}.jpeg?size=1024) | [GIF](https://cdn.discordapp.com/banners/${forceFetched.id}/${forceFetched.banner}.gif?size=1024)`,
						)
						.setImage(
							`https://cdn.discordapp.com/banners/${forceFetched.id}/${forceFetched.banner}.png?size=1024`,
						);

					embedArray.push(bannerEmbed);
				}

				if (assetsMember.avatar) {
					let guildEmbed = new EmbedBuilder()
						.setColor("#2f3136")
						.setDescription(
							`Server Avatar\n[PNG](https://cdn.discordapp.com/guilds/${guild?.id}/users/${assetsMember.id}/avatars/${assetsMember.avatar}.png) | [JPEG](https://cdn.discordapp.com/guilds/${guild?.id}/users/${assetsMember.id}/avatars/${assetsMember.avatar}.jpeg) | [GIF](https://cdn.discordapp.com/guilds/${guild?.id}/users/${assetsMember.id}/avatars/${assetsMember.avatar}.gif)`,
						)
						.setImage(
							`https://cdn.discordapp.com/guilds/${guild?.id}/users/${assetsMember.id}/avatars/${assetsMember.avatar}.png`,
						);
					embedArray.push(guildEmbed);
				}

				if (embedArray.length >= 3) ephemeralStatus = true;

				interaction.reply({ embeds: embedArray, ephemeral: ephemeralStatus });
				break;
			}
			case "appinfo": {
				let appid = interaction.options.getString("id");
				if (!appid) return interaction.reply({ content: await i18n.get("startError") });
				else {
					let res = await fetch(`https://japi.rest/discord/v1/application/${appid}`);
					if (res.ok) {
						const responseData = (await res.json()) as JAPIApplicationRoot;

						if (responseData.data.application === undefined) {
							return interaction.reply({
								ephemeral: true,
								embeds: [
									new EmbedBuilder().setColor("Red").setDescription(await i18n.get("startError")),
								],
							});
						}

						let description = ``;
						let botPublic = ``;

						const flags = new ApplicationFlagsBitField(responseData.data.application.flags)
							.toArray()
							.map((flagName: keyof typeof ApplicationFlags) => formatApplicationFlag(flagName));

						//descrption
						if (responseData.data.application.description)
							description = responseData.data.application.description;
						else description = await i18n.get("noDesc");

						//bot Public
						if (responseData.data.application.bot_public === true) botPublic = await i18n.get("yes");
						else botPublic = await i18n.get("no");

						const BaseEmbed = new EmbedBuilder()
							.setTitle(
								await i18n.get("title", [{ text: "app", value: responseData.data.application.name }]),
							)
							.setTimestamp()
							.setColor("#2f3136")
							.setThumbnail(
								`https://cdn.discordapp.com/app-icons/${appid}/${responseData.data.application.icon}.png?size=4096`,
							)

							.addFields([
								{
									name: `ID`,
									value: `\`\`\`fix\n${appid}\`\`\``,
									inline: true,
								},
								{
									name: await i18n.get("descTitle"),
									value: `${description}`,
									inline: true,
								},
							]);
						if (flags.length)
							BaseEmbed.addFields([
								{ name: await i18n.get("flags"), value: `${flags.join("\n ")}`, inline: false },
							]);

						if (responseData.data.application.tags)
							BaseEmbed.addFields([
								{
									name: await i18n.get("tags"),
									value: `\`\`\`fix\n${responseData.data.application.tags.join(" \n")}\`\`\``,
									inline: true,
								},
							]);
						if (responseData.data.application.bot_public)
							BaseEmbed.addFields([
								{ name: await i18n.get("pApp"), value: `\`\`\`fix\n${botPublic}\`\`\``, inline: true },
							]);
						if (responseData.data.application.summary.length)
							BaseEmbed.addFields([
								{ name: "Summery", value: responseData.data.application.summary, inline: true },
							]);
						return interaction.reply({ embeds: [BaseEmbed] });
					} else {
						return interaction.reply({
							embeds: [new EmbedBuilder().setColor("Red").setDescription(await i18n.get("startError"))],
						});
					}
				}
			}
			case "snowflake": {
				await interaction.deferReply();
				let snowflake: Snowflake = interaction.options.getString("snowflake");

				if (!/^\d{17,20}$/gi.test(snowflake)) {
					await interaction.editReply({
						content: "Invalid snowflake",
					});
					return;
				}

				let SnowflakeData = await new SnowflakeClass().get(snowflake, interaction.client);

				return interaction.editReply({
					embeds: [
						{
							description: SnowflakeData.data.join(` \n`),
							footer: { text: SnowflakeData.type },
							color: Colors.Blue,
						},
					],
				});
			}
			case "server": {
				await interaction.deferReply();

				let verificationLevelStrings = {
					0: await i18n.get("verificationLevelStringsNull"),
					1: await i18n.get("verificationLevelStringsOne"),
					2: await i18n.get("verificationLevelStringsTwo"),
					3: await i18n.get("verificationLevelStringsThree"),
					4: await i18n.get("verificationLevelStringsFour"),
				};

				const server = interaction.guild;
				//@ts-ignore
				const Feature = server.features.map((flagName: GuildFeature) => snakeCaseToCamelCase(flagName, true));

				const FieldArray: APIEmbedField[] = [];

				let badgesString: string;
				if (server.verified === true) badgesString += getEmoji("server_verified");
				if (server.partnered === true) badgesString += getEmoji("server_partnerd");
				if (Feature.includes("Developer Support Server")) badgesString += getEmoji("server_dev_support_server");

				const ServerName: APIEmbedField = {
					name: await i18n.get("serverName"),
					value: `\`\`\`fix\n${server.name}\`\`\``,
					inline: true,
				};
				const ServerID: APIEmbedField = {
					name: await i18n.get("serverID"),
					value: `\`\`\`fix\n${server.id}\`\`\``,
					inline: true,
				};

				const ServerMember: APIEmbedField = {
					name: await i18n.get("members"),
					value: `\`${server.memberCount}\``,
					inline: true,
				}

				const boostLevel = server.premiumTier;
				const boosts = server.premiumSubscriptionCount;
				const BoostInfo: APIEmbedField = {
					name: "Server Boosts",
					value: `${boosts} Boosts | Lvl ${boostLevel}`,
					inline: true,
				};

				//---- filter channels
				const Text = server.channels.cache.filter((channel) => channel.type === ChannelType.GuildText).size;
				const Voice = server.channels.cache.filter((channel) => channel.type === ChannelType.GuildVoice).size;
				const Category = server.channels.cache.filter(
					(channel) => channel.type === ChannelType.GuildCategory,
				).size;
				const Stage = server.channels.cache.filter(
					(channel) => channel.type === ChannelType.GuildStageVoice,
				).size;
				const Forum = server.channels.cache.filter((channel) => channel.type === ChannelType.GuildForum).size;
				const Channel: APIEmbedField = {
					name: await i18n.get("channelName"),
					value: await i18n.get("channelValue", [
						{ text: "tx", value: `${Text}` },
						{ text: "vc", value: `${Voice}` },
						{ text: "cat", value: `${Category}` },
						{ text: "st", value: `${Stage}` },
						{ text: "fr", value: `${Forum}` },
					]),
					inline: true,
				};

				//---- filter empjis and Roles
				const Emoji = server.emojis.cache.size;
				const Roles = server.roles.cache.size;
				const Role: APIEmbedField = {
					name: await i18n.get("rolesName"),
					value: await i18n.get("rolesValue", [{ text: "rr", value: `${Roles}` }]),
					inline: true,
				};
				const Emojis: APIEmbedField = {
					name: await i18n.get("emojisName"),
					value: await i18n.get("emojisValue", [{ text: "ee", value: `${Emoji}` }]),
					inline: true,
				};

				//---- Server Created
				const Created: APIEmbedField = {
					name: await i18n.get("created"),
					value: `<t:${(server.createdTimestamp / 1000) | 0}:f>`,
					inline: true,
				};

				FieldArray.push(ServerName, ServerID, Created, ServerMember, BoostInfo, Channel, Role, Emojis); //ServerName, ServerID, UserAndBots, ServerOwner, Channel, Role, Emojis

				const Embed = new EmbedBuilder()
					.setColor(`#2f3136`)
					.setTitle(await i18n.get("ServerInfoTitle"))
					.setTimestamp()
					.addFields(FieldArray);

				if (server.icon)
					Embed.addFields([
						{
							name: await i18n.get("icon"),
							value: `[Link](${server.iconURL({ extension: "png", size: 2048 })})`,
							inline: true,
						},
					]).setThumbnail(server.iconURL({ extension: "png", size: 2048 }));
				if (server.banner)
					Embed.addFields([
						{
							name: await i18n.get("banner"),
							value: `[Link](${server.bannerURL({ extension: "png", size: 2048 })})`,
							inline: true,
						},
					]).setImage(server.bannerURL({ extension: "png", size: 2048 }));
				//----description
				if (server.description === null) {
					Embed.addFields([
						{
							name: await i18n.get("ServerInfoDescription"),
							value: await i18n.get("ServerInfoNoDescription"),
							inline: true,
						},
					]);
				} else if (server.description !== null) {
					Embed.addFields([
						{
							name: await i18n.get("ServerInfoDescription"),
							value: `${server.description}`,
							inline: true,
						},
					]);
				}
				Embed.addFields([
					{
						name: await i18n.get("GuildVerificationLevel"),
						value: `${GuildVerificationLevel[server.verificationLevel]} (${verificationLevelStrings[server.verificationLevel]
							})`,
						inline: true,
					},
					{
						name: await i18n.get("features"),
						value: `\`\`\`fix\n${Feature.join(` \n`) || (await i18n.get("noFeatures"))}\`\`\``,
						inline: false,
					},
				]);
				return interaction.editReply({ embeds: [Embed] });
			}

			/**
			 * Translate it into german
			 * Add i18n.get();
			 */
			case "user": {
				await interaction.deferReply({ fetchReply: true });
				try {
					let user = interaction.options.getUser("user") || interaction.user;

					let us = await client.users.fetch(user);

					if (us.bot) {
						/**
						 * [x] FLAGS
						 *      [x] -> Badges
						 *      [x] -> GateWay Intents
						 *      [x] -> Other Flags
						 *      [x] -> Add Support for 100 Created AutoModRules
						 * [x] CREATED
						 * [x] AVATAR
						 * [x] TAGS
						 */

						let botEmbed = new EmbedBuilder();
						let title = `**${us} (\`${us.username}\`) ${us.flags.has("VerifiedBot") ? getEmoji("verifiedBot") : getEmoji("bot")
							}**`;

						/**
						 * Request Application Rpc
						 */
						let rpc = (await interaction.client.rest.get(`/applications/${us.id}/rpc`)) as ApplicationRPC;

						async function flags(flags: BitFieldResolvable<ApplicationFlagsString, number>) {
							/**
							 * Emojis
							 */
							let trueEmoji = getEmoji("util_tick");
							let falseEmoji = getEmoji("util_cross_mark");

							/**
							 * Array
							 */
							let badges: string[] = [];
							let otherFlags: string[] = [];
							let GateWayIntents: string[] = [];

							/**
							 * Deconstructor the BitField
							 */
							let ApplicationFlags = new ApplicationFlagsBitField(flags).toArray();

							/**
							 * Other Flags
							 */
							if (ApplicationFlags.includes("ApplicationCommandBadge")) {
								otherFlags.push(await i18n.get("supportsSlashCommands"));
								badges.push(getEmoji("slashCommands"));
							}
							if (ApplicationFlags.includes("ApplicationAutoModerationRuleCreateBadge")) {
								otherFlags.push(await i18n.get("autoModRules"));
								badges.push(getEmoji("UsesAutoMod"));
							}
							if (ApplicationFlags.includes("VerificationPendingGuildLimit"))
								otherFlags.push(await i18n.get("pendingVerification"));
							/**
							 * Gateway Flags
							 */
							if (ApplicationFlags.includes("GatewayGuildMembers"))
								GateWayIntents.push(`${trueEmoji} ${await i18n.get("serverMembersIntent")}`);
							if (!ApplicationFlags.includes("GatewayGuildMembers"))
								GateWayIntents.push(`${falseEmoji} ${await i18n.get("serverMembersIntent")}`);

							if (ApplicationFlags.includes("GatewayMessageContent"))
								GateWayIntents.push(`${trueEmoji} ${await i18n.get("messageContentIntent")}`);
							if (!ApplicationFlags.includes("GatewayMessageContent"))
								GateWayIntents.push(`${falseEmoji} ${await i18n.get("messageContentIntent")}`);

							if (ApplicationFlags.includes("GatewayPresence"))
								GateWayIntents.push(`${trueEmoji} ${await i18n.get("presenceIntent")}`);
							if (!ApplicationFlags.includes("GatewayPresence"))
								GateWayIntents.push(`${falseEmoji} ${await i18n.get("presenceIntent")}`);

							return {
								badges: badges.length !== 0 ? badges : null,
								gateWayIntents: GateWayIntents,
								otherFlags: otherFlags.length !== 0 ? otherFlags : null,
							};
						}

						let { gateWayIntents, badges, otherFlags } = await flags(rpc.flags);

						/**Add GateWayIntents to Embed */
						let gateWayIntentsEmbedFiled: APIEmbedField = {
							name: await i18n.get("gatewayIntents"),
							value: `${gateWayIntents.join(`\n`)}`,
							inline: false,
						};
						botEmbed.addFields([gateWayIntentsEmbedFiled]);

						/**Add other flags to embed */
						if (otherFlags !== null) {
							let otherFlagsEmbedField: APIEmbedField = {
								name: await i18n.get("otherFlags"),
								value: `${otherFlags.join(`\n`)}`,
								inline: true,
							};
							botEmbed.addFields([otherFlagsEmbedField]);
						}

						if (badges !== null) {
							title += `\n${badges.join(` `)}`;
						}
						botEmbed.setDescription(title);
						botEmbed.setColor("Random");
						botEmbed.setThumbnail(us.avatarURL({ size: 512, extension: "png" }));

						try {
							botEmbed.addFields([
								{
									name: await i18n.get("created"),
									value: `<t:${(us.createdTimestamp / 1000) | 0}:F>`,
									inline: true,
								},
								{
									name: await i18n.get("userTags"),
									value: `\`\`\`\n${rpc.tags.join(`\n`)}\`\`\``,
								},
							]);
						} catch (e) {
							botEmbed.addFields([
								{
									name: await i18n.get("created"),
									value: `<t:${(us.createdTimestamp / 1000) | 0}:F>`,
									inline: true,
								},
								{
									name: await i18n.get("userTags"),
									value: `\`\`\`\n${await i18n.get("noTags")}\`\`\``,
								},
							]);
						}

						return interaction.editReply({ embeds: [botEmbed] });
					} else if (!user.bot) {
						let userEmbed = new EmbedBuilder();

						let userFlags = new UserFlagsBitField(us.flags)
							.toArray()
							.join(` `)
							.replace("ActiveDeveloper", getEmoji("activDev"))
							.replace("BotHTTPInteractions", getEmoji("httpOnly"))
							.replace("BugHunterLevel1", getEmoji("bugHunterLvl1"))
							.replace("BugHunterLevel2", getEmoji("bugHunterLvl2"))
							.replace("CertifiedModerator", getEmoji("ModAlumni"))
							.replace("HypeSquadOnlineHouse1", getEmoji("hsq_bravery"))
							.replace("HypeSquadOnlineHouse2", getEmoji("hsq_brilliance"))
							.replace("HypeSquadOnlineHouse3", getEmoji("hsq_balance"))
							.replace("Hypesquad", getEmoji("hypesqaud"))
							.replace("Partner", getEmoji("partner"))
							.replace("PremiumEarlySupporter", getEmoji("early_sup"))
							.replace("Staff", getEmoji("discord_staff"))
							.replace("VerifiedBot", getEmoji("verifiedBot"))
							.replace("VerifiedDeveloper", getEmoji("earlyVerifiedDev"));

						userEmbed
							.setColor("Random")
							.setAuthor({ name: us.username })
							.setThumbnail(us.avatarURL({ extension: "png" }))
							.setDescription(`${us} (\`${us.username}\`) ${userFlags}`)
							.addFields([
								{
									name: await i18n.get("created"),
									value: `<t:${(us.createdTimestamp / 1000) | 0}:F>`,
									inline: true,
								},
								{
									name: `Id`,
									value: `\`${us.id}\``,
									inline: true,
								},
								{
									name: await i18n.get("avatar"),
									value: `[Link](${us.avatarURL({ extension: "png" })})`,
									inline: true,
								},
							]);

						return interaction.editReply({ embeds: [userEmbed] });
					}
				} catch (e) {
					log.$error(e);
					return interaction.editReply({ content: await i18n.get("userError") });
				}
			}

			case "channel": {
				await interaction.deferReply({ fetchReply: true });
				try {
					type allChannels =
						| TextChannel
						| VoiceChannel
						| NewsChannel
						| ForumChannel
						| StageChannel
						| CategoryChannel
						| ThreadChannel;

					let channel = interaction.options.getChannel("channel");
					const { id, name, parent, type } = channel as allChannels;

					async function channelTypeConverter(ChannelTypeAsNumber: number): Promise<string> {
						const ChannelType = {
							0: await i18n.get("textChannel"),
							1: await i18n.get("dm"),
							2: await i18n.get("voiceChannel"),
							3: await i18n.get("groupDm"),
							4: await i18n.get("categorie"),
							5: await i18n.get("newsChannel"),
							10: await i18n.get("newsThread"),
							11: await i18n.get("publicThread"),
							12: await i18n.get("privateThread"),
							13: await i18n.get("stageChannel"),
							14: await i18n.get("directory"),
							15: await i18n.get("forumChannel"),
						};
						let error = await i18n.get("unknonChannel");
						let numberArray = [0, 1, 2, 3, 4, 5, 10, 11, 12, 13, 14, 15];
						if (numberArray.includes(ChannelTypeAsNumber)) {
							return ChannelType[ChannelTypeAsNumber];
						} else return error;
					}

					const embed = new EmbedBuilder()
						.setTitle(await i18n.get("channel.title", [{ text: "name", value: `${name}` }]))
						.setColor("#2f3136")
						.setTimestamp()
						.addFields([
							{
								name: await i18n.get("channel.id"),
								value: `\`\`\`\n${id}\n\`\`\``,
								inline: true,
							},
							{
								name: await i18n.get("channel.type"),
								value: `${await channelTypeConverter(channel.type)}`,
								inline: true,
							},
							{
								name: await i18n.get("channel.parent"),
								value: `${parent || (await i18n.get("channel.noParent"))}`,
								inline: true,
							},
							{
								name: await i18n.get("channel.created"),
								//@ts-ignore
								value: `<t:${(channel.createdAt / 1000) | 0}>`,
								inline: true,
							},
						])
						.setThumbnail(interaction.guild.iconURL());

					if (type === ChannelType.GuildText || type === ChannelType.GuildForum) {
						const { rateLimitPerUser, nsfw, position } = channel as TextChannel;
						embed.addFields([
							{
								name: await i18n.get("channel.topic"),
								//@ts-ignore
								value: `${channel.topic || (await i18n.get("channel.noTopic"))}`,
								inline: true,
							},
							{
								name: await i18n.get("channel.position"),
								value: `\`${position}\``,
								inline: true,
							},
							{
								name: await i18n.get("channel.slowmode"),
								value: `\`${rateLimitPerUser}\``,
								inline: true,
							},
							{
								name: await i18n.get("channel.nsfw"),
								value: `${nsfw ? getEmoji("util_tick") : getEmoji('util_cross_mark')}`,
								inline: true,
							},
						]);
					}

					if (type === ChannelType.PublicThread || type === ChannelType.PrivateThread) {
						const { ownerId, archived, locked } = channel as ThreadChannel;
						embed.addFields([
							{
								name: await i18n.get("channel.owner"),
								value: `\`${ownerId}\``,
								inline: true,
							},
							{
								name: await i18n.get("channel.archived"),
								value: `${archived ? getEmoji("util_tick") : getEmoji('util_cross_mark')}`,
								inline: true,
							},
							{
								name: await i18n.get("channel.locked"),
								value: `${locked ? getEmoji("util_tick") : getEmoji('util_cross_mark')}`,
								inline: true,
							},
						]);
					}

					if (type === ChannelType.GuildAnnouncement || type === ChannelType.AnnouncementThread) {
						const { nsfw } = channel as TextChannel;
						embed.addFields([
							{
								name: await i18n.get("channel.nsfw"),
								value: `${nsfw ? getEmoji("util_tick") : getEmoji('util_cross_mark')}`,
								inline: true,
							},
						]);
					}

					if (type === ChannelType.GuildVoice || type === ChannelType.GuildStageVoice) {
						const { bitrate, userLimit, full, position } = channel as VoiceChannel;
						embed.addFields([
							{
								name: await i18n.get("channel.position"),
								value: `\`${position}\``,
								inline: true,
							},
							{
								name: await i18n.get("channel.bitrate"),
								value: `\`${bitrate}\``,
								inline: true,
							},
							{
								name: await i18n.get("channel.userLimit"),
								value: `\`${userLimit}\``,
								inline: true,
							},
							{
								name: await i18n.get("channel.full"),
								value: `${full ? getEmoji("util_tick") : getEmoji('util_cross_mark')}`,
								inline: true,
							},
						]);
					}
					return interaction.editReply({ embeds: [embed] });
				} catch (e) {
					log.$error(e);
					return interaction.editReply({ content: await i18n.get("userError") });
				}
			}

			case "role": {
				try {
					function integerToHexColor(integerValue: number): string {
						// Stellen sicher, dass der Wert zwischen 0 und 16777215 (0xFFFFFF) liegt
						integerValue = Math.min(0xffffff, Math.max(0, integerValue));

						// Wandelt den Integer-Wert in einen hexadezimalen String um und füllt mit Nullen auf
						const hexString = integerValue.toString(16).toUpperCase().padStart(6, "0");

						// Fügt das '#'-Präfix hinzu
						const hexColorCode = `#${hexString}`;

						return hexColorCode;
					}

					let role = interaction.options.getRole("role");

					let hoisted = role.hoist ? await i18n.get("role.hostied") : await i18n.get("role.notHoisted");
					let roleID = role.id;
					let roleColor = role.color !== 0 ? `\`${integerToHexColor(role.color)}\`` : "`#000000`";
					let botOrApplication = role.managed
						? /^\d{17,20}$/gi.test((role.tags as RoleTagData)?.botId)
							? `<@${(role.tags as RoleTagData).botId}>`
							: await i18n.get("role.isNotManged")
						: await i18n.get("role.isNotManged");

					let embed = new EmbedBuilder()
						.setColor(role.color)
						.setTitle(await i18n.get("role.title", [{ text: `name`, value: `${role.name}` }]))
						.setDescription(
							`${await i18n.get("role.description", [
								{
									text: `role`,
									value: `${role}`,
								},
								{
									text: `roleId`,
									value: `${roleID}`,
								},
								{
									text: `hoist`,
									value: `${hoisted}`,
								},
							])} ${await i18n.get("role.color", [
								{
									text: `roleColor`,
									value: `${roleColor}`,
								},
							])}\n${role.managed
								? /** true */ await i18n.get("role.managed", [
									{
										text: `botOrApplication`,
										value: `${botOrApplication}`,
									},
								])
								: /** false */ ``
							}`,
						)
						.addFields([
							{
								name: await i18n.get("role.perms"),
								value: `\`\`\`\n${(role.permissions as Readonly<PermissionsBitField>).toArray().map(permission => addSpaceBeforeUpperCasePascalCase(permission)).join(`\n`)}\n\`\`\``,
								inline: false
							}
						]);

					//https://cdn.discordapp.com/role-icons/<roleid>/<iconHash>.png
					if (role.icon)
						embed.setThumbnail(`https://cdn.discordapp.com/role-icons/${role.id}/${role.icon}.png`);

					return interaction.reply({ embeds: [embed] });
				} catch (e) {
					return interaction.reply({ content: `${e}` });
				}
			}
			case "membercount": {
				try {
					const approxMembers = interaction.guild.memberCount;
					return interaction.reply({
						embeds: [
							new EmbedBuilder().setColor("Gold").setDescription(
								await i18n.get("memberCount", [
									{
										text: "approxMembers",
										value: `${approxMembers}`,
									},
								]),
							),
						],
					});
				} catch (e) {
					return interaction.reply({
						embeds: [new EmbedBuilder().setColor("Red").setDescription(await i18n.get("memberCountFail"))],
					});
				}
			}
		}
	}
}
