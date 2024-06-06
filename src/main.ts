/**
 * * *******************************
 * *
 * *     Setup the logger
 * *
 * * *******************************
 */
import { AcronixLogger } from "acronix-logger";
AcronixLogger.genLogDir();
export const log = new AcronixLogger();

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			ENVIRONMENT: "production" | "development"
			EnvPlatform: "linux" | "win32"
			devEnvironmentDataBaseToken: string
			devEnvironmentId: string
			devEnvironmentBotToken: string
			productionEnvironmentDataBaseToken: string
			productionEnvironmentId: string
			productionEnvironmentBotToken: string
			splatoon3EUsessionToken: string
			protocol: string
			website: string
			api: string
			statusHeaderSecret: string
			StatisticsKey: string,
			errorDBToken: string
		}
	}
}

log.$info('Logger started!')

/**
 * * *******************************
 * *
 * *     Imports
 * *
 * * *******************************
 */
import { ActivityType, Partials } from "discord.js";
import { CustomClient } from "../lib/bot/CustomClient.js";
import loadCommands from "./Handlers/commands.js";
import { loadEvents } from "./Handlers/events.js";
import * as dotenv from "dotenv";
dotenv.config();
import { BigAutoDeleteTimeouts } from "./Handlers/autodelete.js";
import DatabaseHelper from "../lib/bot/DatabaseHelper.js";

export const DiscordBotClient = new CustomClient({
	logger: log,
	intents: ["GuildMessages", "GuildModeration", "Guilds", "AutoModerationConfiguration", "MessageContent"],
	partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.User],
	credentials: {
		devEnvironment: {
			datbaseToken: process.env.devEnvironmentDataBaseToken,
			id: process.env.devEnvironmentId,
			token: process.env.devEnvironmentBotToken,
			statusOptions: {
				status: "idle",
				activity: {
					name: "In Development | {{servers}}",
					type: ActivityType.Custom,
				},
			},
		},
		productionEnvironment: {
			datbaseToken: process.env.productionEnvironmentDataBaseToken,
			id: process.env.productionEnvironmentId,
			token: process.env.productionEnvironmentBotToken,
			statusOptions: {
				status: "online",
				activity: {
					name: "{{servers}}",
					type: ActivityType.Custom,
				},
			},
		},
	},
	environment: process.env.ENVIRONMENT, // set this as an environment variable in the start command and get then automaticly the token
	owners: ["863453422632173568"],
	supportGuild: {
		id: "940258150395814038",
		invite: "https://discord.gg/sj3ZTNn9d7",
	},
});

DiscordBotClient.login(DiscordBotClient.getTokens.token);



//consoleStamp(console);
DiscordBotClient.on("ready", async (cli) => {
	loadCommands(DiscordBotClient);

	// await DiscordBotClient.connectDatabase();
	await new DatabaseHelper().connect(log)

	//Auto Delete
	BigAutoDeleteTimeouts(DiscordBotClient);
});
loadEvents(DiscordBotClient);

DiscordBotClient.on('debug', (message) => {
	log.$info(message);
})

DiscordBotClient.on('error', (error) => {
	log.$error(error);
})

DiscordBotClient.on('warn', (warn) => {
	log.$info(warn);
})