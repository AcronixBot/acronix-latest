export default {
	missingGuildPerms:
		"Ich habe nicht die Rechte Auto Mod Rollen zu verwalten. Bitte erteile mir die Berechtigung den Server zu verwalten.",

	//!
	autoModRuleTriggerWordPlaceholder: "AcronixAutoModerationTriggerTypeKeywordPlaceholder.",

	//!Slash Command

	missingAdminPerms: "Du hast nicht die Rechte diesen Befehl zu nutzen.",
	roleUserSelectMenu: "Wähle einen Nutzer oder eine Rolle.",
	channelSelectMenu: "Wähle einen Kanal.",
	automodButton: "Auto Mod",
	updateButton: "Syncronisieren",
	resetButton: "Zurücksetzen",
	embedTitle: "Anti Ping",
	description: "Benutze die Komponenten um das Anti Ping System zu verwalten.",

	//!interactions

	//? Perms
	viewChannel: "Kanal Sehen",
	sendMessages: "Nachrichten Senden",
	embedLinks: "Links einbetten",

	//? Fields
	trackedMembers: "Mitglieder",
	noTrackedMembers: "Derzeit achte ich auf keine Mitglieder.",
	trackedRoles: "Rollen",
	noTrackedRoles: "Derzeit achte ich auf keine Rollen.",
	logChannel: "Log Kanal",
	noLogChannel: "Es ist kein Log Kanal eingestellt.",
	autoMod: "Auto Mod",
	autoModActivated: "Der Automod ist __**aktiviert**__.",
	autoModDeactivated: "Der Automod ist __**deaktiviert**__.",

	//? Select Menus

	roleManged: "Das ist eine Rolle von einem Bot und ich achte nicht auf diese.",
	roleRemoved: "{{role}} wurde entfernt.",
	roleAdded: "{{role}} wurde hinzugefügt.",

	userIsBot: "Ich werde nicht auf Bots achten :).",
	userIsSystem: "Ich werde nicht auf das Discord System achten :).",
	userRemoved: "{{user}} wurde entfernt.",
	userAdded: "{{user}} wurde hinzugefügt.",

	interactionMemberNotAllowd: "Die Interaktion ist nicht für dich.",

	channelRemoved: "{{channel}} ist nicht länger der Log Kanal.",
	channelMissingPerms:
		"Berechtigungen:\n{{perms}}\nIch habe eine oder mehrer der oben gezeigten Berechtigungen nicht. Bitte gib mir diese Berechtigung",
	channelAdded: "{{channel}} ist nun der Log Kanal. Berechtigungen:\n{{perms}}",

	//? Reset
	quest: "Bist du dir sicher das du alles Löschen willst?",
	yes: "Ja",
	no: "Nein",
	deletingData: "Daten gelöscht...",
	info: "Ok, ich werde das Anti Ping System für diesen Server löschen.",
	auditLogMsg: "Ich habe das Anti Ping System für diesen Server zurückgesetzt.",
	stopDeletingData: "Vorgang wurde gestoppt.",
	stopInfo: "Ok ich habe den Vorgang abgebrochen.",
	timeUp: "Zeit ist um.",
	collectorEnd: "~~Bist du dir sicher das du alles Löschen willst?~~ {{msg}}.",

	//? Automod
	automodOFF: "Automod wurde deaktiviert.",
	automodON: "Automod wurde aktiviert.",
	ruleError:
		"Es sieht so aus als würde die Automod Regel, welche ich versuche zu erreiche, nicht weiter Existieren. Ich habe das Automod System deaktivert und die Regel zurückgesetzt.",
	customMessage: "Acronix Anti Ping System. Dont edit this Rule!",
	noChange:
		"Du hast bisher keine Änderung am Anti Ping System vorgenommen. Deshalb werde ich keine Automod Regel erstellen.",

	//?Update
	couldSync: "Ich konnt die Auto Mod Regel erfolgreich syncronisieren!",
	couldNotSync: "Der Auto Mod ist deaktiviert oder ich konnte keine Auto Mod Regel finden.",
	onTimeout: "Bitte warte noch **{{time}}** Minuten bevor du es erneut probierst.",
	noCollection: "Es ist noch kein Anti Ping System für den Server vorhanden.",
	sameData: "Es wurden keine änderungen vorgenommen.",

	//!Messages

	//?logEmbed
	"log.description": "{{member}} hat {{mentionedMember}} um {{date}} erwähnt.",
	"log.channel": "Kanal",
	"log.author": "Autor ID",
	"log.content": "Content",

	//?Warn Msg
	"warn.msg": "{{member}} erwähne diese Person nicht nocheinmal.",
	"warn.automod": "Bitte erwähne diese Person nicht nocheinmal.",

	//? Error
	error: "Leider ist ein Fehler aufgetreten. Probiere es später nochmal",

	//? Mention Notice
	mentionNotice: "Erwähnte Mitglieder in Einbettungen erhalten keine Benachrichtigung",
	mentionNoticeTitle: "Kontent kopie",
	mentionNoticeValue: "Einbettung mit Kopie des Inhalts senden",
	mentionNoticeValueDeactivated: "Keine Einbettung mit Kopie des Inhalts senden",
};
