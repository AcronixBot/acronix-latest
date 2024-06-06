import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType, GuildMember, Message, Colors } from "discord.js";
import { ISlashCommand } from "../../lib/bot/CustomClientTypes.js";
import { Command } from "../../lib/bot/Commands/Command.js";
import { CustomClient } from "lib/bot/CustomClient.js";
import { AllInteractionTypes } from "../Events/interactionCreate.js";
import { I18n } from "../Handlers/i18n.js";
import AutoDelete from "../Handlers/autoPublish.js";

export default class ClearCommand extends Command {
    constructor() {
        super({
            dmPermissions: false,
            category: "Moderation",
            userPermissions: 'Administrator',
            clientPermissions: 'ManageMessages',
            name: {
                key: 'auto-publish',
            },
            description: {
                key: 'Zum verwalten des Auto Publish System',
            },
            type: ApplicationCommandType.ChatInput,
        })
    }

    public async execute(client: CustomClient, interaction: AllInteractionTypes, i18n: I18n) {
        if (!this.isChatInput(interaction)) return;

        return await new AutoDelete().commandManageSystem(interaction, i18n);
    }
}

