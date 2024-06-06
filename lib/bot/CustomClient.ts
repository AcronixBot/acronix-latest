import {
	Client,
	Partials,
	Collection,
	Snowflake,
	ActivitiesOptions,
	PresenceStatusData,
	BitFieldResolvable,
	GatewayIntentsString,
	Options,
	LimitedCollection,
} from "discord.js";
import { connect, set } from "mongoose";
import { ISlashCommand, IGatewayEvent } from "./CustomClientTypes.js";
import { ErrorHandler } from "../utils/errorHandling.js";
import { CustomClientEmojis } from "./CustomClientEmojis.js";
import { AcronixLogger } from "../../src/Handlers/logger.js";
import { Command } from "./Commands/Command.js";

type Environment = "production" | "development";

export enum envType {
	"PRODUCTION" = "production",
	"DEVELOPMENT" = "development",
}

type CredentialsOptions = {
	id: string;
	token: string;
	datbaseToken: string;
	statusOptions: StatusOptions;
};

interface StatusOptions {
	status: PresenceStatusData;
	activity: ActivitiesOptions;
}

type ClientOptions = {
	credentials: Credentials;
	environment: Environment | string;
	owners: Snowflake[];
	supportGuild: SupportGuild;
	intents: BitFieldResolvable<GatewayIntentsString, number>;
	partials: Partials[];
	logger: AcronixLogger;
};

/**
 * Information regarding the bot's support server.
 */
interface SupportGuild {
	/**
	 * The id of the support server.
	 */
	id: Snowflake | null;

	/**
	 * An invite link to the support server.
	 */
	invite: string | null;
}

/**
 * Credentials for various services that the bot depends on.
 */
interface Credentials {
	/**
	 * The discord bot token - used when in a 'production' environment.
	 */
	productionEnvironment: CredentialsOptions;

	/**
	 * The discord bot token - used when in a 'development' environment.
	 */
	devEnvironment: CredentialsOptions;
}

export class CustomClient extends Client {
	public commands = new Collection<string, Command>();
	public events = new Collection<string, IGatewayEvent>();
	public errorHandler = new ErrorHandler({
		discordTimeStampFormat: false,
		safepath: "errors",
	});

	credentials: Credentials;
	environment: string;
	owners: string[];
	supportGuild: SupportGuild;
	customEmojis = CustomClientEmojis;
	log: AcronixLogger;

	constructor(options: ClientOptions) {
		super({
			intents: options.intents,
			partials: options.partials,
			// sweepers: {
			// 	...Options.DefaultSweeperSettings,
			// 	messages: {
			// 		interval: 3600, //every hour
			// 		lifetime: 1800, // older then one hour
			// 	},
			// 	users: {
			// 		interval: 3600,
			// 		filter: () => (user) => user.bot && user.id !== this.user.id, // remove all bots
			// 	},
			// },
			// makeCache: (manager) => {
			// 	switch (manager.name) {
			// 		case "ApplicationCommandManager":
			// 		case "BaseGuildEmojiManager":
			// 		case "GuildBanManager":
			// 		case "GuildEmojiManager":
			// 		case "GuildInviteManager":
			// 		case "GuildMemberManager":
			// 		case "GuildScheduledEventManager":
			// 		case "GuildStickerManager":
			// 		case "PresenceManager":
			// 		case "ReactionManager":
			// 		case "ReactionUserManager":
			// 		case "StageInstanceManager":
			// 		case "VoiceStateManager":
			// 		case "ThreadMemberManager": {
			// 			return new LimitedCollection({ maxSize: 0 });
			// 		}
			// 		case "AutoModerationRuleManager": {
			// 			return new LimitedCollection({
			// 				maxSize: 10000,
			// 			});
			// 		}
			// 		case "MessageManager":
			// 			return new LimitedCollection({
			// 				maxSize: 50000,
			// 			});
			// 		case "ThreadManager":
			// 			return new LimitedCollection({
			// 				maxSize: 5000,
			// 			});
			// 		case "UserManager":
			// 			return new LimitedCollection({
			// 				maxSize: 20000,
			// 				keepOverLimit: (user) => user.id === user.client.user.id,
			// 			});
			// 		default:
			// 			return new Collection();
			// 	}
			// },
		});
		this.credentials = options.credentials;
		this.environment = options.environment;
		this.owners = options.owners;
		this.supportGuild = options.supportGuild;
		this.log = options.logger;
	}

	/**
	 * The appropriate discord token for the environment.
	 */
	public get getTokens(): CredentialsOptions {
		switch (this.environment) {
			case "production":
				return this.credentials.productionEnvironment;
			case "development":
				return this.credentials.devEnvironment;
			default:
				throw new TypeError(`Unexpected environment: "${this.environment}"`);
		}
	}

	/**
	 * Connect the bot to the database
	 */
	public async connectDatabase() {
		set("strictQuery", true);
		await connect(this.getTokens.datbaseToken)
			.catch((e) => {
				this.log.$error(e);
			})
			.then(() => this.log.$info("[Database] Successfully Connected and Loaded Database"));
	}

	/**
	 * Whether this is the production instance of the bot.
	 */
	public get isProduction(): boolean {
		return this.environment === "production";
	}

	/**
	 * Whether this is the development instance of the bot.
	 */
	public get isDevelopment(): boolean {
		return this.environment === "development";
	}
}
