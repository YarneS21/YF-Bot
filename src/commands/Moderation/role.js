const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('../../../configs/config.js')
const perms = require('../../../configs/permissions.js')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDMPermission(false)
        .setDescription('Removes specified role from specified user.')
        .addSubcommand(command => command.setName('add').setDescription('Gives a role to specified user.').addUserOption(option => option.setName('user').setDescription('Specified user will be given specified role.').setRequired(true)).addRoleOption(option => option.setName('role').setDescription('Specified role will be given to specified user.').setRequired(true)))
        .addSubcommand(command => command.setName('remove').setDescription('Removes a user from specified role.').addUserOption(option => option.setName('user').setDescription('Specified user will be removed from specified role.').setRequired(true)).addRoleOption(option => option.setName('role').setDescription('Specified role will be removed from specified user.').setRequired(true)))
        .addSubcommand(command => command.setName('members').setDescription('Displays the amount of people who have specified role..').addRoleOption(option => option.setName("role").setDescription(`Specified role's member count will be displayed.`).setRequired(true))),
        
    async execute(interaction, client) {

        const channelID = config.logChannel
        const logChan = await client.channels.fetch(channelID)
        const username = interaction.options.getUser('user');
        const member = interaction.options.getMember('user');
        const role = interaction.options.getRole('role');
        const sub = interaction.options.getSubcommand();
        const RoleAdd = perms.RoleAdd
        const RoleRemove = perms.RoleRemove

        switch (sub) {
            
            case 'add':

            if (interaction.member.roles.cache.some(role => RoleAdd.includes(role.id))) {
                const addembed =new EmbedBuilder()
                .setColor(config.embedColor)
                .setAuthor({ name: `💳 Role Tool`})
                .setFooter({ text: `💳 Role Added`})
                .setTimestamp()
                .setTitle(`${config.reply} Role Added to ${username.username}`)
                .addFields({ name: `• User`, value: `${config.reply} ${username}`})
                .addFields({ name: `• Role`, value: `${config.reply} ${role}`})
                .addFields({ name: `• Added By`, value: `${config.reply} ${interaction.member} - ${interaction.member.tag}`})
                .setThumbnail(config.picture)
    
                await member.roles.add(role).catch(err => {
                    addembed.setTitle('> Error!');
                    addembed.setFooter({ text: `💳 Role not Added`});
                    addembed.setFields({ name: `• Error Occured`, value: `${config.reply} Error received trying to add a role to ${username}. **Check** my role position and **permissions** and try again!`});
                    return;
                })
    
                await interaction.reply({ embeds: [addembed] });
                await logChan.send({embeds: [addembed]})
            } else {
                interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true});
            }
    
            break;
            case 'remove':

            if (interaction.member.roles.cache.some(role => RoleRemove.includes(role.id))) {
                const removeembed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setAuthor({ name: `💳 Role Tool`})
                .setFooter({ text: `💳 Role Removed`})
                .setTimestamp()
                .setTitle(`${config.reply}Role Removed from ${username.username}`)
                .addFields({ name: `• User`, value: `${config.reply} ${username}`})
                .addFields({ name: `• Role`, value: `${config.reply} ${role}`})
                .addFields({ name: `• Removed By`, value: `${config.reply} ${interaction.member} - ${interaction.member.tag}`})
                .setThumbnail(config.picture)

                await member.roles.remove(role).catch(err => {
                    removeembed.setTitle('> Error!');
                    removeembed.setFooter({ text: `💳 Role not Removed`});
                    removeembed.setFields({ name: `• Error Occured`, value: `${config.reply} Error received trying to remove a role from ${username}. **Check** my role position and **permissions** and try again!`});
                    return;
                })
            
                await interaction.reply({ embeds: [removeembed] });
                await logChan.send({embeds: [removeembed]})
            } else {
                interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true});
                
            }

            break;
            case 'members':

            const memberslist = await interaction.guild.roles.cache.get(role.id).members.map(m => m.user.tag).join('');

            const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTimestamp()
            .setAuthor({ name: `📃 Role Members tool`})
            .setTitle(`${config.reply}Role's Members`)
            .addFields({ name: `• Role ID`, value: `${config.reply} **${role.id}**`})
            .setThumbnail(config.picture)
            .setFooter({text: `📃 Role Members fetched`})

            if (!memberslist) {
                embed.addFields({ name: `• Role Members List`, value: `${config.reply} No users found with specified role!`});
            } else {
                embed.addFields({ name: `• Role Members List`, value: `${config.reply} ${memberslist.slice(0, 900)}`});
            }

            await interaction.reply({ embeds: [embed] });
            }
        }
    }
