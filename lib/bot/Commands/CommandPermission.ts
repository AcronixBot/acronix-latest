import {
	BaseInteraction,
	BitFieldResolvable,
	ChatInputCommandInteraction,
	CommandInteraction,
	Message,
	PermissionFlagsBits,
	PermissionsBitField,
	PermissionsString,
	TextBasedChannel,
} from "discord.js";
import { Command } from "./Command.js";

enum CommandPermissionKeys {
	PreconditionIsOk = "preconditionIsOk",
	PreconditionClientPermissions = "preconditionClientPermissions",
	PreconditionClientPermissionsNoClient = "preconditionClientPermissionsNoClient",
	PreconditionClientPermissionsNoPermissions = "preconditionClientPermissionsNoPermissions",
	PreconditionUserPermissions = "preconditionUserPermissions",
	PreconditionUserPermissionsNoPermissions = "preconditionUserPermissionsNoPermissions",
}

enum ResponseKeys {
	ResponseIsOk = "responseIsOk",
	ResponseIsNotOkClientPermissionsNoPermissions = "responseIsNotOkClientPermissionsNoPermissions",
}

interface PermissionGuardResponse {
	code: ResponseKeys;
	identifier: CommandPermissionKeys;
	message: string;
	context?: {
		missing: BitFieldResolvable<string, bigint>;
	};
}

/**
 * Type union for the full 2 billion dollar mistake in the JavaScript ecosystem
 */
type Nullish = null | undefined;

/**
 TODO Aktuell nicht in nutzung. Sollte noch hinzugefügt werden
 */

export default class CommandPermission {
	public async clientPermissionChatInputRun(interaction: ChatInputCommandInteraction, command: Command) {
		const required = new PermissionsBitField(command.getData.clientPermissions) ?? new PermissionsBitField();

		const channel = await this.fetchChannelFromInteraction(interaction);

		const permissions = await this.getPermissionsForChannel(channel, interaction);

		return this.sharedRun(required, permissions, "chat input", "bot");
	}

	public async userPermissionChatInputRun(interaction: ChatInputCommandInteraction, command: Command) {
		const required = new PermissionsBitField(command.getData.userPermissions) ?? new PermissionsBitField();
		const permissions = interaction.guildId ? interaction.memberPermissions : this.dmUserChannelPermissions;

		return this.sharedRun(required, permissions, "chat input", "user");
	}
	/**
	 * Checks whether or not a value is `null` or `undefined`
	 * @param value The value to check
	 */
	private isNullish(value: unknown): value is Nullish {
		return value === undefined || value === null;
	}

	protected async fetchChannelFromInteraction(interaction: CommandInteraction): Promise<TextBasedChannel> {
		const channel = (await interaction.client.channels.fetch(interaction.channelId, {
			cache: false,
			allowUnknownGuild: true,
		})) as TextBasedChannel;

		return channel;
	}

	private async getPermissionsForChannel(channel: TextBasedChannel, messageOrInteraction: Message | BaseInteraction) {
		let permissions: PermissionsBitField | null = this.dmClientChannelPermissions;

		if (messageOrInteraction.inGuild() && !channel.isDMBased()) {
			if (!this.isNullish(messageOrInteraction.applicationId)) {
				permissions = channel.permissionsFor(messageOrInteraction.applicationId);
			}

			if (this.isNullish(permissions)) {
				const me = await messageOrInteraction.guild?.members.fetchMe();
				if (me) {
					permissions = channel.permissionsFor(me);
				}
			}
		}

		return permissions;
	}

	private error(options: PermissionGuardResponse) {
		return options;
	}

	private ok(): PermissionGuardResponse {
		return {
			code: ResponseKeys.ResponseIsOk,
			identifier: CommandPermissionKeys.PreconditionIsOk,
			message: `All required Permissions`,
		};
	}

	private sharedRun(
		requiredPermissions: PermissionsBitField,
		availablePermissions: PermissionsBitField | null,
		commandType: string,
		botOrUser: string,
	) {
		if (!availablePermissions) {
			return this.error({
				code: ResponseKeys.ResponseIsNotOkClientPermissionsNoPermissions,
				identifier: CommandPermissionKeys.PreconditionClientPermissionsNoPermissions,
				message: `I was unable to resolve the permissions in the ${commandType} command invocation channel.`,
			});
		}

		const missing = availablePermissions.missing(requiredPermissions);
		return missing.length === 0
			? this.ok()
			: this.error({
				code: ResponseKeys.ResponseIsOk,
				identifier:
					botOrUser === "bot"
						? CommandPermissionKeys.PreconditionClientPermissions
						: CommandPermissionKeys.PreconditionUserPermissions,
				message: `I am missing the following permissions to run this command: ${missing
					.map((perm) => CommandPermission.readablePermissions[perm])
					.join(", ")}`,
				context: { missing },
			});
	}

	private readonly dmClientChannelPermissions = new PermissionsBitField(
		~new PermissionsBitField([
			PermissionFlagsBits.AddReactions,
			PermissionFlagsBits.AttachFiles,
			PermissionFlagsBits.EmbedLinks,
			PermissionFlagsBits.ReadMessageHistory,
			PermissionFlagsBits.SendMessages,
			PermissionFlagsBits.UseExternalEmojis,
			PermissionFlagsBits.ViewChannel,
		]).bitfield & PermissionsBitField.All,
	).freeze();

	private readonly dmUserChannelPermissions = new PermissionsBitField(
		~new PermissionsBitField([
			PermissionFlagsBits.AddReactions,
			PermissionFlagsBits.AttachFiles,
			PermissionFlagsBits.EmbedLinks,
			PermissionFlagsBits.ReadMessageHistory,
			PermissionFlagsBits.SendMessages,
			PermissionFlagsBits.UseExternalEmojis,
			PermissionFlagsBits.ViewChannel,
			PermissionFlagsBits.UseExternalStickers,
			PermissionFlagsBits.MentionEveryone,
		]).bitfield & PermissionsBitField.All,
	).freeze();

	public static readonly readablePermissions: Record<PermissionsString, string> = {
		AddReactions: "Add Reactions",
		Administrator: "Administrator",
		AttachFiles: "Attach Files",
		BanMembers: "Ban Members",
		ChangeNickname: "Change Nickname",
		Connect: "Connect",
		CreateInstantInvite: "Create Instant Invite",
		CreatePrivateThreads: "Create Private Threads",
		CreatePublicThreads: "Create Public Threads",
		DeafenMembers: "Deafen Members",
		EmbedLinks: "Embed Links",
		KickMembers: "Kick Members",
		ManageChannels: "Manage Channels",
		ManageEmojisAndStickers: "Manage Emojis and Stickers",
		ManageEvents: "Manage Events",
		ManageGuild: "Manage Server",
		ManageGuildExpressions: "Manage Guild Expressions",
		ManageMessages: "Manage Messages",
		ManageNicknames: "Manage Nicknames",
		ManageRoles: "Manage Roles",
		ManageThreads: "Manage Threads",
		ManageWebhooks: "Manage Webhooks",
		MentionEveryone: "Mention Everyone",
		ModerateMembers: "Moderate Members",
		MoveMembers: "Move Members",
		MuteMembers: "Mute Members",
		PrioritySpeaker: "Priority Speaker",
		ReadMessageHistory: "Read Message History",
		RequestToSpeak: "Request to Speak",
		SendMessages: "Send Messages",
		SendMessagesInThreads: "Send Messages in Threads",
		SendTTSMessages: "Send TTS Messages",
		SendVoiceMessages: "Send Voice Messages",
		Speak: "Speak",
		Stream: "Stream",
		UseApplicationCommands: "Use Application Commands",
		UseEmbeddedActivities: "Start Activities",
		UseExternalEmojis: "Use External Emojis",
		UseExternalSounds: "Use External Sounds",
		UseExternalStickers: "Use External Stickers",
		UseSoundboard: "Use Soundboard",
		UseVAD: "Use Voice Activity",
		ViewAuditLog: "View Audit Log",
		ViewChannel: "Read Messages",
		ViewCreatorMonetizationAnalytics: "View Creator Monetization Analytics",
		ViewGuildInsights: "View Guild Insights",
		CreateEvents: "Create Events",
		CreateGuildExpressions: "Create Guild Expressions",
		SendPolls: "Send Polls"
	};
}
