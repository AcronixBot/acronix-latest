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
	Guild,
	GuildMember,
	Role,
	GuildChannel,
	AutoModerationRule,
	DMChannel,
	NonThreadGuildBasedChannel,
} from "discord.js";
import AntiPing from "../database/antiping.js";

export async function GuildRoleDelete(role: Role) {
	let DataTabel = await AntiPing.findOne({ guildID: role.guild.id }).then((r) => r);
	if (DataTabel) {
		if (DataTabel.allowedRoles.includes(role.id as any)) {
			let removedRoleArray = DataTabel.allowedRoles.filter((r) => r !== (role.id as any));
			await AntiPing.findOneAndUpdate(
				{ guildID: role.guild.id },
				{
					$set: {
						allowedRoles: removedRoleArray,
					},
				},
			);
		}
	}
}

export async function ChannelDelete(channel: NonThreadGuildBasedChannel) {
	let DataTabel = await AntiPing.findOne({ guildID: channel.guildId }).then((c) => c);
	if (DataTabel) {
		let savedChannel = DataTabel.logChannel as string;
		if (savedChannel === channel.id) {
			await AntiPing.findOneAndUpdate(
				{ guildID: channel.guildId },
				{
					$set: {
						logChannel: null,
					},
				},
			);
		}
	}
}

//! not useable with missing server members intent
async function guildMemberRemove(member: GuildMember) {
	let DataTabel = await AntiPing.findOne({ guildID: member.guild.id }).then((m) => m);
	if (DataTabel) {
		if (DataTabel.userArray.includes(member.id as any)) {
			let removedMemberArray = DataTabel.userArray.filter((m) => m !== (member.id as any));
			await AntiPing.findOneAndUpdate(
				{ guildID: member.guild.id },
				{
					$set: {
						userArray: removedMemberArray,
					},
				},
			);
		}
	}
}

export async function GuildDelete(guild: Guild) {
	let DataTabel = await AntiPing.findOne({ guildID: guild.id }).then((g) => g);
	if (DataTabel) {
		if (DataTabel.guildID === guild.id) {
			await AntiPing.findOneAndDelete({ guildID: guild.id });
		}
	}
}

export async function AutoModerationRuleDelete(rule: AutoModerationRule) {
	let db = await AntiPing.findOne({ guildID: rule.guild.id, safedAutoModRuleID: rule.id }).then((r) => r);
	if (db && db.safedAutoModRuleID === rule.id) {
		await AntiPing.findOneAndUpdate(
			{
				guildID: rule.guild.id,
				safedAutoModRuleID: rule.id,
			},
			{
				$set: {
					safedAutoModRuleID: null,
					usesAutoMod: false,
				},
			},
		);
	}
}
