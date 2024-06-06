import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChannelSelectMenuBuilder, ChannelSelectMenuInteraction, ChannelType, ChatInputCommandInteraction, ComponentType, EmbedBuilder, InteractionType, MentionableSelectMenuBuilder, MentionableSelectMenuInteraction, Message, RoleSelectMenuInteraction, StringSelectMenuInteraction, UserSelectMenuInteraction, messageLink } from "discord.js";
import { I18n } from "./i18n";
import { AutoPublishModel } from "../database/autoPublish.js";
import { getEmojiId } from "./emojis.js";

type CollectedType = ButtonInteraction<"cached">
    | StringSelectMenuInteraction<"cached">
    | UserSelectMenuInteraction<"cached">
    | RoleSelectMenuInteraction<"cached">
    | MentionableSelectMenuInteraction<"cached">
    | ChannelSelectMenuInteraction<"cached">

export default class AutoDelete {
    //#region Public Methodes

    public eventMessageCreate() {

    }

    public eventChannelDelete() {

    }

    public eventGuildDelete() {

    }

    public async commandManageSystem(interaction: ChatInputCommandInteraction<"cached">, i18n: I18n) {
        await interaction.deferReply({ ephemeral: false, fetchReply: true });

        const serverConfig = await AutoPublishModel.findOne({ guildId: interaction.guildId });

        //TODO Button mit einem Embed für ein How Does It Work


        //#region Components

        const howDoesItWorkButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`autopublish:interface:button:howdoesitwork:${interaction.user.id}`)
            .setLabel(await i18n.get('button.interface.howdoesitwork'))
            .setEmoji(getEmojiId('util_info'));

        const resetAllButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setCustomId(`autopublish:interface:button:reset:${interaction.user.id}`)
            .setLabel(await i18n.get('button.interface.reset'))
            .setEmoji(getEmojiId('util_cross_mark'));

        const buttonComponents = new ActionRowBuilder<ButtonBuilder>();
        buttonComponents.addComponents([howDoesItWorkButton, resetAllButton]);

        const channelSelectMenu = new ChannelSelectMenuBuilder()
            .setChannelTypes(ChannelType.GuildAnnouncement)
            .setCustomId('autopublish:interface:menu:channel:${interaction.user.id}')
            .setPlaceholder(await i18n.get('menu.interface.channel'));

        const channelSelectMenuComponent = new ActionRowBuilder<ChannelSelectMenuBuilder>();
        channelSelectMenuComponent.addComponents(channelSelectMenu);

        const roleUserSelectMenu = new MentionableSelectMenuBuilder()
            .setCustomId('autopublish:interface:menu:roleuser:${interaction.user.id}')
            .setPlaceholder(await i18n.get('menu.interface.channel'));

        const roleUserSelectMenuComponent = new ActionRowBuilder<MentionableSelectMenuBuilder>();
        roleUserSelectMenuComponent.addComponents(roleUserSelectMenu);
        //#endregion


        if (!serverConfig) {

            const embed = new EmbedBuilder()
                .setColor('Fuchsia')
                .setTimestamp()
                .setTitle('Auto Publish')
                .setDescription(await i18n.get('embed.description.noconfig'))

            const interactionReply = await interaction.editReply({
                embeds: [embed],
                components: [
                    roleUserSelectMenuComponent, channelSelectMenuComponent, buttonComponents
                ]
            })

            await this.interactionWasReplied(interaction, i18n, interactionReply)

        } else {

            const embed = new EmbedBuilder()
                .setColor('Fuchsia')
                .setTimestamp()
                .setTitle('Auto Publish')
                .setDescription(await i18n.get('embed.description.config', [
                    {
                        text: 'channels',
                        value: ''
                    },
                    {
                        text: 'roles',
                        value: ''
                    },
                    {
                        text: 'user',
                        value: ''
                    },
                ]))

            const interactionReply = await interaction.editReply({
                embeds: [embed],
                components: [
                    roleUserSelectMenuComponent, channelSelectMenuComponent, buttonComponents
                ]
            })

            await this.interactionWasReplied(interaction, i18n, interactionReply)
        }
    }

    //#endregion


    //#region Private Methodes

    //#region Util
    private publishMessage() {

    }

    /**
     * Geht davon aus das die user id an letzt stelle steht und die custom id durch : separiert wird
     * @param customId 
     * @returns 
     */
    private getUserIdFromCustomId(customId: string) {
        return customId.split(':').at(customId.split(':').length - 1)
    }

    private async differentusers(collected: CollectedType, i18n: I18n) {
        await collected.deferReply({ ephemeral: true });

        return await collected.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Fuchsia')
                    .setDescription(await i18n.get('button.interface.differentusers'))
            ]
        })
    }
    //#endregion


    //#region Main Interaction Handle
    private async interactionWasReplied(interaction: ChatInputCommandInteraction<"cached">, i18n: I18n, interactionResponse: Message<true>) {
        const collector = interactionResponse.createMessageComponentCollector({
            time: 60000,

        })

        collector.on('end', async () => {
            await interactionResponse.edit({
                components: [],
                embeds: interactionResponse.embeds
            })
        })

        collector.on('collect', async (collected) => {

            const orginUserId = this.getUserIdFromCustomId(collected.customId);

            if (orginUserId !== collected.user.id) {
                await this.differentusers(collected, i18n)
            }

            switch (collected.componentType) {
                case ComponentType.Button: {
                    if (collected.customId.includes('howdoesitwork')) {

                    } else if (collected.customId.includes('reset')) {

                    } else {
                        await this.defaultComponentResponse(collected, i18n)
                    }
                }
                case ComponentType.ChannelSelect: {

                }
                case ComponentType.MentionableSelect: {

                }
                default: {
                    await this.defaultComponentResponse(collected, i18n)
                }
            }
        })
    }
    //#endregion

    //#region Component Handle
    private async buttonResetAll(collected: CollectedType, i18n: I18n) {
        await collected.deferReply({ ephemeral: true });
    }

    private async buttonHowDoesItWork(collected: CollectedType, i18n: I18n) {
        await collected.deferReply({ ephemeral: true });

        const embed = new EmbedBuilder()

        return await collected.editReply({

        })
    }

    private async menuRoleUser(collected: CollectedType, i18n: I18n) {
        await collected.deferReply({ ephemeral: true });
    }

    private async menuChannel(collected: CollectedType, i18n: I18n) {
        await collected.deferReply({ ephemeral: true });
    }

    private async defaultComponentResponse(collected: CollectedType, i18n: I18n) {
        await collected.deferReply({
            ephemeral: true,
        });

        return await collected.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Fuchsia')
                    .setDescription(await i18n.get('button.interface.defaultresponse'))
            ]
        })
    }
    //#endregion


    //#endregion 
}