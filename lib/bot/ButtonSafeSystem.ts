import { ButtonInteraction, CacheType, Snowflake } from "discord.js";

interface ButtonSafeSystemOptions {
	continueMethode: () => void;
	customId: string;
	userId: Snowflake;
	interaction: ButtonInteraction<CacheType>;
}

export class ButtonSafeSystem {
	private static successMethode: () => void;
	private static customId: string;
	private static userId: Snowflake;
	private static interaction: ButtonInteraction<CacheType>;
	private static replied: boolean;
	private static ephemeral: boolean;

	public static handle(options: ButtonSafeSystemOptions) {
		this.successMethode = options.continueMethode;
		this.customId = options.customId ?? options.interaction.customId;
		this.userId = options.userId ?? options.interaction.user.id;
		this.interaction = options.interaction;

		this.replied = this.interaction.replied === true ? true : false;
		this.ephemeral = this.interaction.ephemeral === true ? true : false;

		if (typeof this.successMethode === "undefined")
			this.interaction.replied
				? this.interaction.editReply(`The 'continueMethode' cant be 'undefined'`)
				: this.interaction.reply({ ephemeral: true, content: `The 'continueMethode' cant be undefined` });

		if (this.userId === this.interaction.user.id) {
			this.customId.split(`:`).forEach((customIdElement) => {
				if (customIdElement === "true") {
					return this.successMethode();
				} else if (customIdElement === "false") {
					this.replied
						? this.ephemeral
							? this.interaction.editReply(`You do not have the Permissions to use this commands`)
							: null
						: this.interaction.reply({ content: `I stoped the process`, ephemeral: true });

					return this.interaction.message.delete();
				}
			});
		} else {
			return this.replied
				? this.ephemeral
					? this.interaction.editReply(`You do not have the Permissions to use this commands`)
					: null
				: this.interaction.reply({ content: `I stoped the process`, ephemeral: true });
		}
	}
}
