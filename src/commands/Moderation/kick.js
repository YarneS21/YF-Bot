const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('../../../configs/config.js')
const perms = require('../../../configs/permissions.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('kick')
    .setDMPermission(false)
    .setDescription('Kicks specified user.')
    .addUserOption(option => option.setName('user').setDescription('Specify the user you want to kick.').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason as to why you want to kick specified user.').setRequired(false)),
    async execute(interaction, client) {
        
        const users = interaction.options.getUser('user');
        const ID = users.id;
        const kickedmember = interaction.options.getMember('user');
        const KickPerms = perms.KickPerms

        if (!interaction.member.roles.cache.some(role => KickPerms.includes(role.id))) return await interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true});
        if (interaction.member.id === ID) return await interaction.reply({ content: 'You **cannot** use the kick power on you, silly goose..', ephemeral: true});

        if (!kickedmember) return await interaction.reply({ content: `That user **does not** exist within your server.`, ephemeral: true});
    
        const reason = interaction.options.getString('reason') || 'No reason provided :(';
        
        const dmembed = new EmbedBuilder()
        .setColor(config.embedColor)
        .setAuthor({ name: '🔨 Kick Tool'})
        .setTitle(`${config.reply}You were kicked from "${interaction.guild.name}"`)
        .addFields({ name: '• Server', value: `${config.reply} ${interaction.guild.name}`})
        .addFields({ name: '• Reason', value: `${config.reply} ${reason}`})
        .addFields({ name: '• Kicked By', value: `${config.reply}${interaction.member} - ${interaction.user.tag}`})
        .setFooter({ text: '🔨 Kicked from a server'})
        .setTimestamp()
        .setThumbnail(config.picture)

        const embed = new EmbedBuilder()
        .setColor(config.embedColor)
        .setAuthor({ name: '🔨 Kick Tool'})
        .setTitle(`${config.reply}User was kicked!`)
        .addFields({ name: '• User', value: `${config.reply} ${users.tag}`})
        .addFields({ name: '• Reason', value: `${config.reply} ${reason}`})
        .addFields({ name: '• Kicked By', value: `${config.reply}${interaction.member} - ${interaction.user.tag}`})
        .setThumbnail(config.picture)
        .setFooter({ text: '🔨 Someone got kicked hard'})
        .setTimestamp()

        await kickedmember.kick().catch(err => {
            return interaction.reply({ content: `**Couldn't** kick this member! Check my **role position** and try again.`, ephemeral: true});
        })

        await kickedmember.send({ embeds: [dmembed] }).catch(err => {
            return;
        })
        const channelID = config.logChannel
        const logChan = await client.channels.fetch(channelID)
        await logChan.send(embeds [embed])
        await interaction.reply({ embeds: [embed] });
    }
}