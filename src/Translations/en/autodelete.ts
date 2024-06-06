let responseAddition =
	"Use `create` to create a new Auto Delete System, `change` to change the settings from an already created rule and `delete` to delete an active Auto Delete System";
export default {
	//Global
	missingPerms: "You dont have the Permissions to use this Command. (`Administrator`)",

	//create new
	botMissingPerms: "{{permissionArray}}\nI do not have the required permissions in the channel",
	alreadyThere: `In the channel is an Auto Delete System already active.\n${responseAddition}`,
	"interaction.response.create.new":
		"### New Auto Delete created!\nChannel: {{channel}}\nTimeout: `{{timeout}}`\nBot Messages: {{botMSGs}}",
	botMsgsTrue: "will deleted",
	botMsgsFalse: "will not deleted",
	threadNotJoinable: "I could not join the thread!",

	//change
	notThere: `I could not find the selected Auto Delete System. Please try again.\n${responseAddition}`,
	noChange: `You havent changed something.\n${responseAddition}`,

	"interaction.response.change.title": "### Changed the Auto Delete for Channel: {{channel}}",
	"interaction.response.change.timeout": "- Delete Timeout: `{{timeout}}`",
	"interaction.response.change.botMsgs.true": "✅ I **will** delete Messages send by a Bot",
	"interaction.response.change.botMsgs.false": "❌ I will **not** delete Messages send by a Bot",
	"interaction.response.change.userMsgs.true": "✅ I **will** delete Messages send by a User",
	"interaction.response.change.userMsgs.false": "❌ I will **not** delete Messages send by a User",

	//tosmalltimeout
	toSmallTimeout: "The Timeout of {{timeout}} is to small. The minimum is 5 seconds",

	//delete
	question: "Are you sure you want to delete this rule?",
	no: "No",
	yes: "Yes",

	//autoComplete
	noOptions: "No options avalible",

	//reset Handler
	unknownError: "An unknown Error occuried. Please try again",
	stop: "Ok, i stoped the process",
	unknownCollection: "It seems like the Auto Delete Rule is not longer avalible",
	ruleDelete: "### I deleted the rule for {{channel}}",

	//embed
	"embed.title": "Auto Delete",
	"embed.description.default": "Every Message send by a Guild Member (not a Bot) will be deleted after {{timeout}}!",
	"embed.description.bot": "Every Message send by a Bot will be deleted after {{timeout}}!",
	"embed.description.botAndUser": "Every Message send by a Server Member or Bot will be deleted after {{timeout}}!",
	"embed.description.user": "Every Message send by a Server Member (not a Bot) will be deleted after {{timeout}}!",

	//info panel
	"infopanel.notfound": "I could not find any rule for this server.",
	"infopanel.channel": "Channel",
	"infopanel.msgtypes": "User & Bot Messages",
	"infopanel.msgusers": "User Messages",
	"infopanel.msgbots": "Bot Messages",
	"infopanel.timeout": "Timeout"
};
