import { getEmoji } from "../../../src/Handlers/emojis.js";

let responseAddition =
	"Nutze `create` um eine neue Auto Delete Regel zu erstellen, `change` um die Einstellungen einer bereits erstelleten Regel zu ändern oder `delete` um eine Regel zu löschen.";
export default {
	//Global
	missingPerms: "Du hast nicht die Rechte diesen Befehl auszuführen. (`Administrator`).",

	//create new
	botMissingPerms: "{{permissionArray}}\nIch habe nicht die erforderten Berechtigungen in dem Kanal.",
	alreadyThere: `In dem Kanal ist bereits eine Auto Delete Regel Aktiv.\n${responseAddition}`,
	"interaction.response.create.new":
		"### Neue Auto Delete Regel erstellt!\nKanal: {{channel}}\nTimeout: `{{timeout}}`\nBot Nachrichten: {{botMSGs}}",
	botMsgsTrue: "werden gelöscht",
	botMsgsFalse: "werden nicht gelöscht",
	threadNotJoinable: "Ich konnte dem angegeben Thread nicht beitreten",

	//change
	notThere: `Ich konnte die ausgewählte Auto Delete Regel nicht finden. Bitte versuche es erneut.\n${responseAddition}`,
	noChange: `Du hast keine Änderungen vorgenommen.\n${responseAddition}`,

	"interaction.response.change.title": "### Auto Delete Regel für Kanal: {{channel}} aktuallisiert",
	"interaction.response.change.timeout": "- Lösch Timeout: `{{timeout}}`",
	"interaction.response.change.botMsgs.true": `${getEmoji('util_tick')} Ich **werde** Nachrichten von Bots löschen`,
	"interaction.response.change.botMsgs.false": `${getEmoji('util_cross_mark')} Ich werde Nachrichten von Bots **nicht** löschen`,
	"interaction.response.change.userMsgs.true": `${getEmoji('util_tick')} Ich **werde** Nachrichten von Nutzern löschen`,
	"interaction.response.change.userMsgs.false": `${getEmoji('util_cross_mark')} Ich werde Nachrichten von Nutzern **nicht** löschen`,

	//tosmalltimeout
	toSmallTimeout: "Der Timeout von {{timeout}} ist zu klein. Das Minimum sind 5 Sekunden.",

	//delete
	question: "Bist du dir sicher, dass du diese Regel löschen möchtest?",
	no: "Nein!",
	yes: "Ja!",

	//autoComplete
	noOptions: "Keine Optionen verfügbar.",

	//reset Handler
	unknownError: "Ein unbekannter Fehler ist aufgetaucht. Bitte Probiere es erneut.",
	stop: "Ok, ich habe den vorgang gestoppt!",
	unknownCollection: "Es scheint als wäre die auto Delete Regel nicht länger verfügbar.",
	ruleDelete: "### Ich habe die Auto Delete Regel für den Kanal {{channel}} gelöscht",

	//embed
	"embed.title": "Auto Delete",
	"embed.description.default":
		"Jede Nachricht die von einem Mitglied (keinem Bot) gesendet wird, wird nach {{timeout}} gelöscht!",
	"embed.description.bot": "Jede Nachricht die von einem Bot gesendet wird, wird nach {{timeout}} gelöscht!",
	"embed.description.botAndUser":
		"Jede Nachricht die von einem Bot oder Mitglied gesendet wird, wird nach {{timeout}} gelöscht!",
	"embed.description.user":
		"Jede Nachricht die von einem Mitglied (keinem Bot) gesendet wird, wird nach {{timeout}} gelöscht!",

	//info panel
	"infopanel.notfound": "Ich konnte keine Regel für diesen Server finden.",
	"infopanel.channel": "Kanal",
	"infopanel.msgtypes": "User & Bot Nachrichten",
	"infopanel.msgusers": "User Nachrichten",
	"infopanel.msgbots": "Bot Nachrichten",
	"infopanel.timeout": "Timeout"
};
