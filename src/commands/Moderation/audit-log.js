const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, ChannelType } = require("discord.js");
 
const logSchema = require("../../Schemas.js/logSchema");
 
module.exports = {
    data: new SlashCommandBuilder()
        .setName('log-setup') 
        .setDescription('Configure your logging system to receive audit logs.')
        .setDMPermission(false)
        .addChannelOption(option => 
            option
            .setName('channel')
            .setDescription('Specified channel for your logging system')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)),
 
    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.SendMessages)) return await interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true});


        const { channel, guildId, options } = interaction;
 
        const logChannel = options.getChannel("channel") || channel;
        const embed = new EmbedBuilder();
 
        logSchema.findOne({ Guild: guildId }, async (err, data) => {
            if (!data) {
                await logSchema.create({
                    Guild: guildId,
                    Channel: logChannel.id
                });
 
                embed.setDescription(`Successful data transmission to the channel ${logChannel}.`)
                    .setColor("Green")
                    .setTimestamp();
            } else if (data) {
                data.Channel = logChannel.id;
                await data.save();
 
                embed.setDescription(`Successfully updated the audit log channel to ${logChannel}.`)
                    .setColor("Green")
                    .setTimestamp();
            }
 
            if (err) {
                embed.setDescription("An error occurred while trying to update the audit log channel.")
                    .setColor("Red")
                    .setTimestamp();
            }
 
            return interaction.reply({ embeds: [embed], ephemeral: true });
        });
    }
}