const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const warningSchema = require('../../Schemas.js/warn');
const config = require('../../../configs/config.js')
const perms = require('../../../configs/config.js')
module.exports = {
    data: new SlashCommandBuilder()
    .setName('warn')
    .setDMPermission(false)
    .setDescription('Warns specified user for specified reason.')
    .addSubcommand(command => command.setName('add').setDescription('Warns specified user for specified reason.').addUserOption(option => option.setName('user').setDescription('Specified user will be warned.').setRequired(true)).addStringOption(option => option.setName('reason').setDescription('The reason as to why you are warning specified user.').setRequired(false).setMaxLength(500)))
    .addSubcommand(command => command.setName('clear').setDescription(`Clears all specified user's warnings.`).addUserOption(option => option.setName('user').setDescription('Specified user will have their warning cleared.').setRequired(true))),
    async execute(interaction, client) {
        const WarnPerms = perms.WarnPerms
        const channelID = config.logChannel
        const logChan = await client.channels.fetch(channelID)
        if (interaction.member.roles.cache.some(role => WarnPerms.includes(role.id))) {
            const sub = interaction.options.getSubcommand();
            switch (sub) {
            
                case 'add':
    
                const { options, guildId, user } = interaction;
    
            const target = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason') || 'No reason provided :(';
            
            const userTag = `${target.username}#${target.discriminator}`
    
            warningSchema.findOne({ GuildID: guildId, UserID: target.id, UserTag: userTag }, async (err, data) => {
    
                if (err) throw err;
    
                if (!data) {
                    data = new warningSchema({
                        GuildID: guildId,
                        UserID: target.id,
                        UserTag: userTag,
                        Content: [
                            {
                                ExecuterId: user.id,
                                ExecuterTag: user.tag,
                                Reason: reason
                            }
                        ],
                    });
     
                } else {
                    const warnContent = {
                        ExecuterId: user.id,
                        ExecuterTag: user.tag,
                        Reason: reason
                    }
                    data.Content.push(warnContent);
                }
                data.save()
            });
    
            const dmembed = new EmbedBuilder()
            .setTimestamp()
            .setColor(config.embedColor)
            .setThumbnail(config.picture)
            .setAuthor({ name: `⚠ Warning Tool`})
            .setFooter({ text: `⚠ Warning Recieved`})
            .setTitle(`${config.reply} You were warned in ${interaction.guild.name}`)
            .addFields({ name: `• Warned By`, value: `${config.reply} ${interaction.member} - ${interaction.member.tag}`})
            .addFields({ name: `• Reason`, value: `${config.reply} ${reason}`})
    
            const embed = new EmbedBuilder()
            .setTimestamp()
            .setColor(config.embedColor)
            .setThumbnail(config.picture)
            .setAuthor({ name: `⚠ Warning Tool`})
            .setFooter({ text: `⚠ Warning Sent`})
            .setTitle(`${config.reply} Warned a Member`)
            .addFields({ name: `• Warned User`, value: `${config.reply} ${target.tag}`})
            .addFields({ name: `• Warned By`, value: `${config.reply} ${interaction.member} - ${interaction.member.tag}`})
            .addFields({ name: `• Reason`, value: `${config.reply} ${reason}`})
    
            target.send({ embeds: [dmembed] }).catch(err => {
                return;
            })
    
            interaction.reply({ embeds: [embed] })
            logChan.send({embeds: [embed]})
    
            break;
            case 'clear':
    
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers) && interaction.user.id !== '619944734776885276') return await interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true});
    
            const target1 = interaction.options.getUser('user');
    
            const embed1 = new EmbedBuilder()
    
            warningSchema.findOne({ GuildID: interaction.guild.id, UserID: target1.id, UserTag: target1.tag }, async (err, data) => {
    
                if (err) throw err;
    
                if (data) {
                    await warningSchema.findOneAndDelete({ GuildID: interaction.guild.id, UserID: target1.id, UserTag: target1.tag })
    
                    embed1.setColor(config.embedColor)
                    .setTimestamp()
                    .setFooter({ text: `⚠ Warning Brush`})
                    .setAuthor({ name: `⚠ Warning Tool`})
                    .setTitle(`${config.reply} Cleared a user's warnings`)
                    .addFields({ name: `• Warnings Cleared`, value: `${config.reply} **${target1.tag}** had their warnings cleared`})
                    .addFields({ name: `• Cleared By`, value: `${config.reply} ${interaction.member} - ${interaction.member.tag}`})
                    .setThumbnail(config.picture)
    
                    interaction.reply({ embeds: [embed1] });
                    logChan.send({embeds: [embed1]})
                } else {
                    interaction.reply({ content: `**${target1.tag}** has no warnings, can't clear **nothing**!`, ephemeral: true})
                }
            });
            }
        } else {
            interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true});
        }
    }
}