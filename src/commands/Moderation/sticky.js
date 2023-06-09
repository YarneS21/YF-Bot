const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const stickyschema = require('../../Schemas.js/sticky');
const config = require('../../../configs/config.js')
const perms = require('../../../configs/permissions.js')
module.exports = {
    data: new SlashCommandBuilder()
    .setName('sticky')
    .setDMPermission(false)
    .setDescription('Manages your sticky notes.')
    .addSubcommand(command => command.setName('set').addStringOption(option => option.setName('message').setDescription('Sticky note message.').setRequired(true).setMaxLength(1000)).addNumberOption(option => option.setName('count').setDescription('Messages required to be sent before refreshing the sticky note').setRequired(false)).setDescription('Creates a sticky message for specified channel.'))
    .addSubcommand(command => command.setName('remove').setDescription('Remove the sticky note in this channel.')),
    async execute(interaction) {
        const StickyPerms = perms.StickyMessagePerms
        if (interaction.member.roles.cache.some(role => StickyPerms.includes(role.id))) {
            const sub = interaction.options.getSubcommand();

            switch (sub) {
    
            case 'set':
    
            let string = interaction.options.getString('message');
            let amount = interaction.options.getNumber('count') || 6;
    
            const embed = new EmbedBuilder()
            .setThumbnail(config.picture)
            .setTitle(`${config.tick} Sticky Messages`)
            .setFooter({ text: config.footer})
            .addFields({ name: '• Sticky Content', value: `${config.reply} ${string}`})
            .setColor(config.embedColor)
            .setTimestamp()
    
            stickyschema.findOne({ ChannelID: interaction.channel.id}, async (err, data) => {
                if (err) throw err;
    
                if (!data) {
                    let msg = await interaction.channel.send({ embeds: [embed]});
    
                    stickyschema.create({
                        ChannelID: interaction.channel.id,
                        Message: string,
                        MaxCount: amount,
                        LastMessageID: msg.id,
                    })
    
                    return await interaction.reply({ content: 'Your **sticky message** has been set.', ephemeral: true})
                } else {
                    await interaction.reply({ content: 'You have **already** set a sticky message up. Do **/sticky remove** to undo.', ephemeral: true})
                }
            })
    
            break;
    
            case 'remove':
    
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages) && interaction.user.id !== '619944734776885276') return interaction.reply({ content: 'You **do not** have the permission to do that.', ephemeral: true})
            const data = await stickyschema.findOne({ ChannelID: interaction.channel.id});
    
            if (!data) {
                return await interaction.reply({ content: 'No **sticky note** to remove! Do **/sticky set** to set a sticky.', ephemeral: true})
            } else {
                try {
                    interaction.client.channels.cache.get(data.ChannelID).messages.fetch(data.LastMessageID).then(async(m) => {
                        await m.delete();
                    })
                } catch { 
                    return;
                }
            }
    
            stickyschema.deleteMany({ ChannelID: interaction.channel.id}, async (err, data) => {
                if (err) throw err;
    
                return await interaction.reply({ content: 'The **sticky note** was removed!', ephemeral: true})
            })
    
            }
        } else {
            interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true});
        }
    }
}
