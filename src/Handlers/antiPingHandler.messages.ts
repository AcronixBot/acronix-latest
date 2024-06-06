/***
 * ! Imports
 */
import {
	EmbedBuilder,
	PermissionFlagsBits,
	Message,
	Collection,
	GuildMember,
	GuildChannelManager,
	Colors,
	TextChannel,
} from "discord.js";
import AntiPing, { type AntiPingDocument } from "../database/antiping.js";
import GuildLang from "../database/lang.js";
import { I18n, type langs } from "./i18n.js";

export type TestMentionsData = {
	code: boolean;
	mentions: string;
};

export type ReturnCodeData = {
	code: boolean | number;
	msg?: string;
};

/***
 *
 *
 *
 */
export async function testMentions(
	mentions: Collection<string, GuildMember>,
	DataTable: AntiPingDocument,
): Promise<TestMentionsData[]> {
	let res: Array<TestMentionsData> = [];
	mentions.forEach((m) => {
		if (DataTable?.userArray?.includes(m.id as any)) {
			res.push({
				code: true,
				mentions: m.id,
			});
		}
	});
	return res;
}

export function checkChannelType(message: Message<boolean>): ReturnCodeData {
	let channel = message.channel;
	if (channel.isDMBased())
		return {
			code: false,
		};
	if (!channel.isTextBased())
		return {
			code: false,
		};
	else
		return {
			code: true,
		};
}
/**
 * true = member has role
 * false = member havent the role
 * @param member
 * @param Document
 * @returns
 */
export type checkReturn = {
	code: boolean;
};

export async function checkAllowdRoles(member: GuildMember, Document: AntiPingDocument): Promise<checkReturn> {
	const FetchedMember = await member.fetch();
	const roles = FetchedMember.roles;
	const safedRoles = Document.allowedRoles;

	if (safedRoles.some((r) => roles.cache.has(r))) {
		return {
			code: true,
		};
	} else {
		return {
			code: false,
		};
	}
}
/**
 * true = kanal ist vorhande
 * false = kanal ist nicht vorhanden
 * @returns
 */
export async function checkLogChannel(channels: GuildChannelManager, Document: AntiPingDocument): Promise<checkReturn> {
	if (!channels) return;
	if (!Document) return;

	let safedChannel = Document.logChannel as string;
	let fetchedChannels = await channels.fetch();
	if (fetchedChannels.some((channel) => channel.id === safedChannel)) {
		return {
			code: true,
		};
	} else {
		return {
			code: false,
		};
	}
}

export async function createLogChannelEmbed(
	date: number,
	message: Message<boolean>,
	langDB: I18n,
	mentionedMember: TestMentionsData,
) {
	const embed = new EmbedBuilder()
		.setColor(Colors.Red)
		.setTimestamp()
		.setDescription(
			await langDB.get("log.description", [
				{
					text: `member`,
					value: `<@${message.author.id}>`,
				},
				{
					text: `mentionedMember`,
					value: `<@${mentionedMember.mentions}>`,
				},
				{
					text: `date`,
					value: `<t:${(date / 1000) | 0}:F>`,
				},
			]),
		)
		.addFields([
			{
				name: await langDB.get("log.channel"),
				value: `<#${message.channelId}>`,
				inline: true,
			},
			{
				name: await langDB.get("log.author"),
				value: `\`\`\`fix\n${message.author.id}\`\`\``,
				inline: true,
			},
			{
				name: await langDB.get("log.content"),
				value: `${message.content}`,
				inline: false,
			},
		]);
	return embed;
}

export async function sendLogChannelEmbed(embed: EmbedBuilder, logchannel: string, message: Message<boolean>) {
	const logChannel = await message.guild.channels.fetch(logchannel);
	const lgChannel = message.guild.channels.cache.get(logChannel.id) as TextChannel;
	if (lgChannel.permissionsFor(message.guild.members.me).has(PermissionFlagsBits.ViewChannel)) {
		if (lgChannel.permissionsFor(message.guild.members.me).has(PermissionFlagsBits.SendMessages)) {
			lgChannel.send({ embeds: [embed] });
		}
	}
}

export async function SendEmbedWithContentCopy(message: Message<boolean>, i18n: I18n) {
	const msgChannel = (await message.channel.fetch()) as TextChannel;
	if (msgChannel.permissionsFor(message.guild.members.me).has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks])) {
		message.channel
			.send({
				embeds: [
					new EmbedBuilder()
						.setColor("Red")
						.setFooter({ text: await i18n.get("mentionNotice") })
						.setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
						.setDescription(`>>> ${message.content}`)
				]
			})
	}
}

export async function finalHandle(message: Message<boolean>, i18n: I18n, sendEmbedWithContentCopy: boolean) {
	const msgChannel = (await message.channel.fetch()) as TextChannel;
	if (msgChannel.permissionsFor(message.guild.members.me).has(PermissionFlagsBits.SendMessages)) {
		message.channel
			.send({ content: await i18n.get("warn.msg", [{ text: "member", value: `<@${message.member.id}>` }]) })
			.then((m) => {
				setTimeout(() => {
					m.delete();
				}, 10000);
			});
	}
	if (msgChannel.permissionsFor(message.guild.members.me).has(PermissionFlagsBits.ManageMessages)) {
		message.delete();
		if (sendEmbedWithContentCopy) {
			SendEmbedWithContentCopy(message, i18n);
		}
	}
}

/**
 * 1. überprüf ob es eine neue nachrichenn version gibt
 * 2. suche nach allen erwähnungen
 * 3. schau ob es einen Dattable gibt
 * 4. überprüfe ob eine der erwähnung in der datenbank gespeicher ist
 * 5. wenn es mehr als 1 oder 1 ist über prüfe ob der nachrichten autor eine bypassrole hat
 * 6. wenn er keine bypassrole hat schaue nach ob es einen log channel gibt
 * 7. wenn es einen logchannel gibt
 *  7.1 sende eine nachricht in logchannel
 *  7.2 lösche die ursprungs nachricht
 *  7.3 sende eine nachricht mit einer verwarnung für den user
 * 8 wenn es keinen logchannel gibt
 *  8.1 lösche die ursprungs nachricht
 *  8.2 sende eine nachricht mit einer verwarnung für den user
 */

export async function checkMessages(baseMessage: Message<boolean>, newMessage?: Message<boolean>) {
	let msg = newMessage ? newMessage : baseMessage;

	if (msg.author.bot) return;
	if (msg.author.id === msg.client.user.id) return;

	let lang: langs;
	const langTabel = await GuildLang.findOne({ Guild: msg.guildId }).then(async (l) => l);
	if (!langTabel) lang = "en";
	else if (langTabel) lang = `${langTabel.language}`;
	let i18n = new I18n({ commandName: "antiping", lang: lang });

	let DataTable = await AntiPing.findOne({ guildID: baseMessage.guildId }).then(async (r) => r as AntiPingDocument);
	if (!DataTable) return;

	if (checkChannelType(msg).code === false) return;

	if (msg) {
		let mentions = msg.mentions.members;
		if (DataTable) {
			let result = await testMentions(mentions, DataTable);
			let shouldStop: checkReturn[] = [];
			for (const results of result) {
				if (results.mentions === msg.author.id) {
					shouldStop.push({ code: true });
				}
			}
			if (shouldStop.length > 0 && shouldStop.some((e) => e.code === true)) return;
			else {
				if (result.length > 0) {
					//the message includes one or more mentions
					//now handle it (reply, delete message, check for alloedRoles, send message to log, etc...)

					//check if the first member has a bypassrole
					let rolecheck = await checkAllowdRoles(msg.member, DataTable);
					//member havent any bypassrole
					if (rolecheck.code === false) {
						let channels = msg.guild.channels;
						let testedChannelResult = await checkLogChannel(channels, DataTable);
						if (testedChannelResult.code === true) {
							const embed = await createLogChannelEmbed(new Date().getTime(), msg, i18n, result[0]);
							await sendLogChannelEmbed(embed, DataTable.logChannel as string, msg);
							await finalHandle(msg, i18n, DataTable.sendEmbedWithContent);
						} else {
							await finalHandle(msg, i18n, DataTable.sendEmbedWithContent);
						}
					}
				}
			}
		}
	}
}
