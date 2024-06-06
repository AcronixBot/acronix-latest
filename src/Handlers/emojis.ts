import { Category, TCategory } from "../../lib/bot/Commands/Command.js";

const emojis = {
	util_members: "<:util_member:1111964528729653248>",
	util_link: "<:util_linked:1111964353340641362>",
	util_questionMark: "<:util_questionmark:1111964533569884231>",
	util_settings: "<:util_setting:1111964363973218364>",
	util_tick: "<:util_tick:1111964535138558023>",
	util_cross_mark: "<:util_cross:1162841127855079545>",
	util_bell: "<:util_bell:1111964342594838630>",
	util_hammer: "<:util_hammer:1111964348013879296>",
	util_leaf: "<:util_leaf:1111964350471733288>",
	util_info: "<:util_info:1174796502556745887>",
	ModAlumni: "<:ModeratorAlumni:1100400443462520832>",
	UsesAutoMod: "<:UsesAutoMod:1100406353186537502>",
	verifiedBot: "<:bot1:1100401670476791878><:bot2:1100401669340139610>",
	bot: "<:bot:998663934636740648>",
	activDev: "<:activeDeveloper:1040340397685219368>",
	hsq_balance: "<:balance:1040618785217986591>",
	hsq_brilliance: "<:brilliance:1040618788028153976>",
	hsq_bravery: "<:bravery:1040618786757279824>",
	slashCommands: "<:commands:999753182265753610>",
	clock: "<:clock:1036635803520086116>",
	discord: "<:dc:1035276827528274000>",
	spammer: "<:spammer:1023620855512703056>",
	slash: "<:slash:1050533915170980003>",
	partner: "<:partner:998663937358844005>",
	early_sup: "<:nitrouser:1000049397389873282>",
	nitro: "<:nitro:998663935689498735>",
	hypesqaud: "<:hypesqoud:998663939154002091>",
	httpOnly: "<:httpOnlyInteraction:1023620295778652282>",
	discord_staff: "<:staff:1000049398065139844>",
	discord_system: "<:system1:1100073798667092188><:system2:1100073796590915604>",
	bugHunterLvl1: "<:v1:998664478784753724>",
	bugHunterLvl2: "<:v2:998664516365734039>",
	earlyVerifiedDev: "<:verifiedDeveloper:1100402143489433620>",
	server_partnerd: "<:server_partner:1162846023874523176>",
	server_verified: "<:server_verified:1162846022612037702>",
	server_dev_support_server: "<:server_dev_support:1162846641129275422>",
};

export function getEmoji(name: keyof typeof emojis) {
	return emojis[name];
}

export function getEmojiId(name: keyof typeof emojis) {
	return emojis[name].split(':')[2].replace(">", "");
}

export function getEmojiForHelpMenu(category: TCategory | "Home", id = true) {
	switch (category) {
		case ('Help'): {
			return id ? getEmojiId('util_questionMark') : getEmoji("util_questionMark")
		}
		case ('Info'): {
			return id ? getEmojiId('util_info') : getEmoji("util_info")
		}
		case ('Moderation'): {
			return id ? getEmojiId('util_hammer') : getEmoji("util_hammer")
		}
		case ('Util'): {
			return id ? getEmojiId('util_settings') : getEmoji("util_settings")
		}
		case "Home": {
			return id ? getEmojiId('util_leaf') : getEmoji("util_leaf")
		}
	}
}