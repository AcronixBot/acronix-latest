export default {
	missingGuildPerms:
		"I do not have the rights to manage Auto Mod rules. Please give me the permission to manage the server.",

	//!
	autoModRuleTriggerWordPlaceholder: "AcronixAutoModerationTriggerTypeKeywordPlaceholder",

	//!Slash Command

	missingAdminPerms: "You dont have the Permissions to use this Command.",
	roleUserSelectMenu: "Select a role or user",
	channelSelectMenu: "Select a channel",
	automodButton: "Auto Mod",
	updateButton: "Syncronize",
	resetButton: "Reset",
	embedTitle: "Anti Ping",
	description: "Use the Components to configure the Anti Ping System.",

	//!interactions

	//? Perms
	viewChannel: "View Channel",
	sendMessages: "Send Messages",
	embedLinks: "Embed Links",

	//? Fields
	trackedMembers: "Tracked Members",
	noTrackedMembers: "I dont track members at this time",
	trackedRoles: "Tracked Roles",
	noTrackedRoles: "I dont track roles at this time",
	logChannel: "Log Channel",
	noLogChannel: "There is no log channel configured",
	autoMod: "Auto Mod",
	autoModActivated: "The Automod is __**activated**__",
	autoModDeactivated: "The Automod is __**deactivated**__",

	//? Select Menus

	roleManged: "This is a managed Role (Role from a Bot) and i will not safe this as a ByPass Role",
	roleRemoved: "{{role}} was removed from the Anti Ping",
	roleAdded: "{{role}} was added the Anti Ping",

	userIsBot: "I will not protect Bots :)",
	userIsSystem: "I will not protect the System :)",
	userRemoved: "{{user}} was removed from the Anti Ping",
	userAdded: "{{user}} was added the Anti Ping",

	interactionMemberNotAllowd: "This interaction is not for you",

	channelRemoved: "{{channel}} is not longer the Logchannel",
	channelMissingPerms:
		"Permissions:\n{{perms}}\nOne of the Permissions showed above i dont have it in the channel. Please grant me this Permission in this channel.",
	channelAdded: "{{channel}} is now the Logchannel\nPermission:\n{{perms}}",

	//? Reset
	quest: "Are you sure you want to delete all data?",
	yes: "Yes",
	no: "No",
	deletingData: "Deleting Data...",
	info: "Ok, i delete the antiping system for this server",
	auditLogMsg: "Reset of the AntiPing System for this Server",
	stopDeletingData: "Process Stop",
	stopInfo: "Ok, i stoped the process",
	timeUp: "Time is up",
	collectorEnd: "~~Are you sure you want to delete all data?~~ {{msg}}",

	//? Automod
	automodOFF: "I disabled the Auto Mod",
	automodON: "Activated the AutoMod System",
	ruleError:
		"It seems that the Auto Mod Rule i try to fetch is not longer avalible. I disaled the AutoMod System and reseted the Rule.",
	customMessage: "Acronix Anti Ping System. Dont mention this Person again",
	noChange: "You havent changed anything in the AntiPing. Please do this befor you activated the Discord Auto Mod",

	//?Update
	couldSync: "I was able to sync the Auto Mod role successfully!",
	couldNotSync: "The Auto Mod is deactivated or I could not find an Auto Mod role",
	onTimeout: "Please wait **{{time}}** min before trying again.",
	noCollection: "There is no anti ping system for the server yet",
	sameData: "No changes were made",

	//!Messages

	//?logEmbed
	"log.description": "{{member}} has mentioned {{mentionedMember}} at {{date}}",
	"log.channel": "Channel",
	"log.author": "Author ID",
	"log.content": "Content",

	//?Warn Msg
	"warn.msg": "{{member}} dont mention this member again",
	"warn.automod": "Please do not mention this person again.",

	//? Error
	error: "Unfortunately, an error has occurred. Try again later",


	//? Mention Notice
	mentionNotice: "Mentioned members in embeds do not receive a notification",
	mentionNoticeTitle: "Content Copy",
	mentionNoticeValue: "Sending embed with copy of content",
	mentionNoticeValueDeactivated: "Sending no embed with copy of content",
};
