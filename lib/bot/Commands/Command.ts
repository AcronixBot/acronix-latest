import {
	LocalizationMap,
	PermissionResolvable,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ApplicationCommandType,
	APIApplicationCommandOption,
	ApplicationCommandOptionData,
	ChatInputApplicationCommandData,
	ChatInputCommandInteraction,
	Awaitable,
	AutocompleteInteraction,
	CacheType,
	MessageApplicationCommandData,
	UserApplicationCommandData,
	InteractionType,
	MessageContextMenuCommandInteraction,
	UserContextMenuCommandInteraction,
} from "discord.js";
import { CustomClient } from "../CustomClient.js";
import { I18n } from "../../../src/Handlers/i18n.js";
import { AllInteractionTypes } from "../../../src/Events/interactionCreate.js";
export interface StringOptions {
	key: string;
	localizations?: LocalizationMap;
}


export const Category = ["Info", "Moderation", "Help", "Util"] as const;

export type TCategory = typeof Category[number]

export type ApplicationCommandDataInterfaces = ChatInputApplicationCommandData | MessageApplicationCommandData | UserApplicationCommandData;

export interface CommandOptions {
	/**
	 * Decides in which catoriy in the help command the command will show up
	 */
	category: TCategory;
	/**
	 * The name and name localizations of this command.
	 */
	name: StringOptions;
	/**
	 * The description and description localizations of this command.
	 */
	description: StringOptions;
	/**
	 * Weither it as in chat input command or a menu command
	 */
	type: ApplicationCommandType;
	/**
	 * The options of this command.
	 */
	options?: ApplicationCommandOptionData[];
	/**
	 * The client Permissions of this command.
	 */
	clientPermissions?: PermissionResolvable;
	/**
	 * The user Permissions of this command.
	 */
	userPermissions?: PermissionResolvable;
	/**
	 * The dm Permissions of this command.
	 */
	dmPermissions?: boolean;
	/**
	 * should the command marked as nsfw.
	 */
	nsfw?: boolean;
}

/**
 * the extended class should be default export
 */
export abstract class Command {
	private options: CommandOptions;

	constructor(commandData: CommandOptions) {
		this.options = commandData;
	}

	public get getData() {
		return this.options;
	}

	public toJSON(): ApplicationCommandDataInterfaces {
		return {
			description: this.options.description.key,
			name: this.options.name.key,

			nameLocalizations: this.options.name.localizations ?? {},
			descriptionLocalizations: this.options.description.localizations ?? {},

			defaultMemberPermissions: this.options.userPermissions ?? null,

			type: this.options.type,

			dmPermission: this.options.dmPermissions ?? false,

			nsfw: this.options.dmPermissions ?? false,

			options: this.options.options ?? [],
		};
	}

	public getCommand() {
		return this;
	}

	public isChatInput(interaction: AllInteractionTypes): interaction is ChatInputCommandInteraction<"cached"> {
		return interaction.isChatInputCommand();
	}

	public isUserMenuCommand(interaction: AllInteractionTypes): interaction is UserContextMenuCommandInteraction {
		return interaction.isUserContextMenuCommand();
	}

	public isMessageMenuCommand(interaction: AllInteractionTypes): interaction is MessageContextMenuCommandInteraction {
		return interaction.isMessageContextMenuCommand();
	}

	public abstract execute?(client: CustomClient, interaction: AllInteractionTypes, i18n: I18n): Awaitable<unknown>;

	/**
	 * 
	 * @param client 
	 * @param interaction 
	 * @param i18n 
	 */
	public autoComplete?(client: CustomClient, interaction: AutocompleteInteraction, i18n: I18n): Awaitable<unknown>;
}
