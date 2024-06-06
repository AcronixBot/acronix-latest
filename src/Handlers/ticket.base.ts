import { ButtonInteraction, ChannelType, ChatInputApplicationCommandData, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { IGuildTicketConfig, GuildTicketConfigModel } from "../database/ticket.config.js";
import { getEmoji } from "./emojis.js";

type PossibleTicketInteractions = ButtonInteraction | ChatInputCommandInteraction;

export default class Tickets {
    private guildConfig: IGuildTicketConfig;
    private noConfig: boolean
    constructor(guildConfig: IGuildTicketConfig, noConfig = false) {
        this.guildConfig = guildConfig;
        this.noConfig = noConfig;
    }

    private async createTicketHandle(guildId: string): Promise<Tickets> {
        const config = await GuildTicketConfigModel.findOne({ guildId });
        return new Tickets(config, config ? true : false);
    }

    private static checkAndHandleNoConfig(interaction: PossibleTicketInteractions, noConfig: boolean) {
        if (noConfig) {
            if (interaction.deferred || interaction.replied) {
                return interaction.editReply({
                    content: `${getEmoji('util_settings')} I could not identify a ticket configuration for this Server.`
                })
            } else {
                interaction.reply({
                    ephemeral: true,
                    content: `${getEmoji('util_settings')} I could not identify a ticket configuration for this Server.`
                })
            }
        }
    }

    public static async createNewTicketSystem(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });

        const logChannel = interaction.options.getChannel<ChannelType.GuildText>('log-channel', false);
        const ticketParent = interaction.options.getChannel<ChannelType.GuildCategory>('parent', false);
        const firstTicketModerationRole = interaction.options.getRole('mod-role', false);

        //Test Permissions for the LogChannel
        if (logChannel !== null) {
            if (!logChannel.permissionsFor(interaction.guild.members.me).has(["ViewChannel", "SendMessages", "EmbedLinks", "UseExternalEmojis", "AttachFiles"], true)) {
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setTitle('Missing permissions for the log channel')
                            .setDescription('Please ensure that i have the following permissions for the log channel\n\`View Channel\`, \`Send Message\`, \`Embed Links\` and \`Use External Emojis\`')
                    ]
                })
            }
        }
        //Test Generell Permissons for the Guild -> ManageChannels
        if (!interaction.guild.members.me.permissions.has(["ManageChannels", "ViewChannel", "SendMessages", "EmbedLinks", "UseExternalEmojis"], true)) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setTitle('Missing permissions for the server')
                        .setDescription('Please ensure that i have the following permissions for the server so i can create, update and delete channels\n\`Manage Channels\`, \`View Channel\`, \`Send Message\`, \`Embed Links\` and \`Use External Emojis\`')
                ]
            })
        }

        //Test Permissions for the category
        if (ticketParent !== null || !ticketParent.permissionsFor(interaction.guild.members.me).has(["ManageChannels", "ViewChannel", "SendMessages", "EmbedLinks", "UseExternalEmojis"], true)) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setTitle('Missing permissions for the ticket parent category')
                        .setDescription('Please ensure that i have the following permissions for the Ticket Category so i can create, update and delete channels\n\`Manage Channels\`, \`View Channel\`, \`Send Message\`, \`Embed Links\` and \`Use External Emojis\`')
                ]
            })
        }

        //Notify the user that he can add additionl Mod Roles later
    }

    public openTicket() {

    }

    public closeTicket() {

    }

    public openClosedTicket() {

    }

    public deleteTicket() {

    }

    public createTranscript() {

    }

    public lock() {

    }

    public unlock() {

    }

    public userAdd() {

    }

    public userRemoved() {

    }
}