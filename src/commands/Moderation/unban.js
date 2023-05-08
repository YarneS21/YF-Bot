const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('../../../configs/config.js')
const perms = require('../../../configs/permissions.js')
module.exports = {
    data: new SlashCommandBuilder()
    .setName('unban')
    .setDMPermission(false)
    .setDescription('Unbans specified user.')
    .addUserOption(option => option.setName('user').setDescription('Specify the user you want to ban.').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason as to why you want to unban specified user.').setRequired(false)),
    async execute(interaction, client) {
        
        const userID = interaction.options.getUser('user');
        const UnbanPerms = perms.UnbanPerms
        let reason = interaction.options.getString('reason');
        if (!reason) reason = 'No reason provided :('

        const embed = new EmbedBuilder()
        .setColor(config.embedColor)
        .setAuthor({ name: '🔨 Ban Tool'})
        .setTitle(`${config.reply} User was unbanned!`)
        .addFields({ name: '• User', value: `${config.reply}${userID}`})
        .addFields({ name: '• Reason', value: `${config.reply}${reason}`})
        .addFields({ name: '• Unbanned By', value: `${config.reply}${interaction.member} - ${interaction.user.tag}`})
        .setThumbnail(config.picture)
        .setFooter({ text: '🔨 The ban hammer missed'})
        
        if (interaction.member.roles.cache.some(role => UnbanPerms.includes(role.id))) {
            if (interaction.member.id === ID) {
                interaction.reply({ content: 'You **cannot** use the hammer on you, silly goose..'});
            } else {
              await interaction.guild.bans.fetch() 
              .then(async bans => {

                  if (bans.size == 0) return await interaction.reply({ content: 'There is **no one** to unban.', ephemeral: true})
                  let bannedID = bans.find(ban => ban.user.id == userID);
                  if (!bannedID ) return await interaction.reply({ content: 'That user **is not** banned.', ephemeral: true})

                  await interaction.guild.bans.remove(userID, reason).catch(err => {
                      return interaction.reply({ content: `**Couldn't** unban user specified!`, ephemeral: true})
                  })
              })

              await interaction.reply({ embeds: [embed] });
              let logChan = await client.channels.fetch(config.logChannel)
              await logChan.send({embeds: [embed]})
            }
        } else {
            interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true});
        }
    }
}