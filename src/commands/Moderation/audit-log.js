const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, ChannelType } = require("discord.js");
 
const logSchema = require("../../Schemas.js/logSchema");
const welcomeSchema = require("../../Schemas.js/welcomeSchema");
 
module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup') 
        .setDescription('Configure your logging system to receive audit logs.')
        .setDMPermission(false)
        .addSubcommand(command => command.setName('logs').setDescription('Sets up the logging system for you.').addChannelOption(option => 
            option
            .setName('logchannel')
            .setDescription('Specified channel for your logging system')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)))
        .addSubcommand(command => command.setName('welcome').setDescription('Sets up the welcoming system for you.').addChannelOption(option => 
            option
            .setName('welcomechannel')
            .setDescription('Specified channel for your logging system')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement))) 
            ,
 
    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return await interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true});
        const sub = interaction.options.getSubcommand();
        const { channel, guildId, options } = interaction;
 
        const logChannel = options.getChannel("logchannel") || channel;
        const welcomeChannel = options.getChannel("welcomeChannel") || channel;
        const embed = new EmbedBuilder();
        
        switch (sub) {
        case 'logchannel':
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
     
                    embed.setDescription(`Successfully updated the log channel to ${logChannel}.`)
                        .setColor("Green")
                        .setTimestamp();
                }
     
                if (err) {
                    embed.setDescription("An error occurred while trying to update the audit log channel.")
                        .setColor("Red")
                        .setTimestamp();
                }
     
                return interaction.reply({ embeds: [embed] });
            });

        break
        case 'welcomechannel':

            welcomeSchema.findOne({ Guild: guildId }, async (err, data) => {
                if (!data) {
                    await welcomeSchema.create({
                        Guild: guildId,
                        Channel: welcomeChannel.id
                    });
    
                    embed.setDescription(`Successful data transmission to the channel ${welcomeChannel}.`)
                        .setColor("Green")
                        .setTimestamp();
                } else if (data) {
                    data.Channel = welcomeChannel.id;
                    await data.save();
    
                    embed.setDescription(`Successfully updated the welcome channel to ${welcomeChannel}.`)
                        .setColor("Green")
                        .setTimestamp();
                }
    
                if (err) {
                    embed.setDescription("An error occurred while trying to update the welcome channel.")
                        .setColor("Red")
                        .setTimestamp();
                }
    
                return interaction.reply({ embeds: [embed] });
            });            
        }
    }
}