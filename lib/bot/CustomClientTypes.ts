import {
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	Interaction,
	SlashCommandBuilder,
} from "discord.js";
import { CustomClient } from "./CustomClient.js";
import { I18n } from "../../src/Handlers/i18n.js";
import { AllInteractionTypes } from "../../src/Events/interactionCreate.js";

export type Snowflake = string;
export interface ISlashCommand {
	data: SlashCommandBuilder | any; //
	catagorie: "Info" | "Moderation" | "Help" | "Util" | "Splatoon";
	execute: (client: CustomClient, interaction: AllInteractionTypes, i18n: I18n) => void;
	autoComplete?: (client: CustomClient, interaction: AutocompleteInteraction<CacheType>, i18n: I18n) => void;
}
export interface IGatewayEvent {
	name: string;
	once?: boolean | false;
	execute: (...args: any) => void;
}

export enum InteractionType {
	Ping = 1,
	ApplicationCommand = 2,
	MessageComponent = 3,
	ApplicationCommandAutocomplete = 4,
	ModalSubmit = 5,
}

export interface HelpCommandObjekt {
	commandName: string;
	description: string;
	defaultPermission: string;
	catagorie: string | any;
	subCommands: string;
}

export enum ComponentType {
	ActionRow = 1,
	Button = 2,
	StringSelect = 3,
	TextInput = 4,
	UserSelect = 5,
	RoleSelect = 6,
	MentionableSelect = 7,
	ChannelSelect = 8,
	/**
	 * Select menu for picking from defined text options
	 *
	 * @deprecated This is the old name for {@apilink ComponentType#StringSelect}
	 */
	SelectMenu = 3,
}

/**
 * https://discord.com/developers/docs/resources/application#application-object-application-flags
 */
export declare enum ApplicationFlags {
	/**
	 * @unstable
	 */
	EmbeddedReleased = 2,
	/**
	 * @unstable
	 */
	ManagedEmoji = 4,
	/**
	 * @unstable
	 */
	GroupDMCreate = 16,
	/**
	 * @unstable
	 */
	RPCHasConnected = 2048,
	GatewayPresence = 4096,
	GatewayPresenceLimited = 8192,
	GatewayGuildMembers = 16384,
	GatewayGuildMembersLimited = 32768,
	VerificationPendingGuildLimit = 65536,
	Embedded = 131072,
	GatewayMessageContent = 262144,
	GatewayMessageContentLimited = 524288,
	EmbeddedFirstParty = 1048576,
	ApplicationCommandBadge = 8388608,
}
export enum GuildFeature {
	AnimatedBanner = "ANIMATED_BANNER",
	AnimatedIcon = "ANIMATED_ICON",
	ApplicationCommandPermissionsV2 = "APPLICATION_COMMAND_PERMISSIONS_V2",
	AutoModeration = "AUTO_MODERATION",
	Banner = "BANNER",
	Community = "COMMUNITY",
	CreatorMonetizableProvisional = "CREATOR_MONETIZABLE_PROVISIONAL",
	CreatorStorePage = "CREATOR_STORE_PAGE",
	DeveloperSupportServer = "DEVELOPER_SUPPORT_SERVER",
	Discoverable = "DISCOVERABLE",
	Featurable = "FEATURABLE",
	HasDirectoryEntry = "HAS_DIRECTORY_ENTRY",
	Hub = "HUB",
	InvitesDisabled = "INVITES_DISABLED",
	InviteSplash = "INVITE_SPLASH",
	LinkedToHub = "LINKED_TO_HUB",
	MemberVerificationGateEnabled = "MEMBER_VERIFICATION_GATE_ENABLED",
	MonetizationEnabled = "MONETIZATION_ENABLED",
	MoreStickers = "MORE_STICKERS",
	News = "NEWS",
	Partnered = "PARTNERED",
	PreviewEnabled = "PREVIEW_ENABLED",
	PrivateThreads = "PRIVATE_THREADS",
	RelayEnabled = "RELAY_ENABLED",
	RoleIcons = "ROLE_ICONS",
	RoleSubscriptionsAvailableForPurchase = "ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE",
	RoleSubscriptionsEnabled = "ROLE_SUBSCRIPTIONS_ENABLED",
	TicketedEventsEnabled = "TICKETED_EVENTS_ENABLED",
	VanityURL = "VANITY_URL",
	Verified = "VERIFIED",
	VIPRegions = "VIP_REGIONS",
	WelcomeScreenEnabled = "WELCOME_SCREEN_ENABLED",
	TextInVoiceEnabled = "TEXT_IN_VOICE_ENABLED",
	GuildOnboardingEverEnabled = "GUILD_ONBOARDING_EVER_ENABLED",
}

export enum ChannelType {
	GuildText = 0,
	DM = 1,
	GuildVoice = 2,
	GroupDM = 3,
	GuildCategory = 4,
	GuildAnnouncement = 5,
	AnnouncementThread = 10,
	PublicThread = 11,
	PrivateThread = 12,
	GuildStageVoice = 13,
	GuildDirectory = 14,
	GuildForum = 15,
	GuildNews = 5,
	GuildNewsThread = 10,
	GuildPublicThread = 11,
	GuildPrivateThread = 12,
}

export enum GuildVerificationLevel {
	None = 0,
	Low = 1,
	Medium = 2,
	High = 3,
	VeryHigh = 4,
}

export type ApplicationRPC = {
	bot_public: boolean;
	bot_require_code_grant: boolean;
	description: string;
	flags: number;
	hook: boolean;
	icon: string;
	id: string;
	name: string;
	summary: string;
	tags: string[];
};

export interface JAPIApplicationRoot {
	cache_expiry: number;
	cached: boolean;
	data: JAPIData;
}

export interface JAPIData {
	application: JAPIApplication;
	bot: JAPIBot;
}

export interface JAPIApplication {
	id: string;
	name: string;
	icon: string;
	description: string;
	summary: string;
	type: any;
	hook: boolean;
	bot_public: boolean;
	bot_require_code_grant: boolean;
	terms_of_service_url: string;
	privacy_policy_url: string;
	custom_install_url: string;
	verify_key: string;
	flags: number;
	tags: string[];
	flags_array: string[];
	assets: any[];
}

export interface JAPIBot {
	id: string;
	username: string;
	avatar: string;
	discriminator: string;
	public_flags: number;
	bot: boolean;
	approximate_guild_count: number;
	public_flags_array: string[];
}

export interface APIEmbedImage {
	/**
	 * Source url of image (only supports http(s) and attachments)
	 */
	url: string;
	/**
	 * A proxied url of the image
	 */
	proxy_url?: string;
	/**
	 * Height of image
	 */
	height?: number;
	/**
	 * Width of image
	 */
	width?: number;
}

export interface HLMData {
	stage: {
		name: string;
		url: string;
	};
	hl: string;
	weapons: [
		{
			name: string;
			url: string;
		},
		{
			name: string;
			url: string;
		},
		{
			name: string;
			url: string;
		},
		{
			name: string;
			url: string;
		},
	];
	code: string;
}
