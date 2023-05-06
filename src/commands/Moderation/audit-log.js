const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    EmbedBuilder 
} = require("discord.js");
 
const logSchema = require("../../Schemas.js/logSchema"); // If necessary, update this to your schema file name.
 
module.exports = {
    data: new SlashCommandBuilder()
        .setName("audit-log") // Update this to your preference.
        .setDescription("Configure your logging system to receive audit logs.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("Channel.")
                .setRequired(false)
        ),
 
    async execute(interaction) {
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