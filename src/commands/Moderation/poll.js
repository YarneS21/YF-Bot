const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType} = require("discord.js");
const config = require('../../../configs/config');
const { PollPerms } = require("../../../configs/permissions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("poll")
        .setDescription("Create a poll and send it to a certain channel.")
        .addStringOption(option =>
            option.setName("question")
                .setDescription("*Provide the question of the poll.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("choice-1")
                .setDescription("*First choice.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("choice-2")
                .setDescription("*Second choice.")
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("The channel to send the poll to.")
                .setRequired(false)
                .addChannelTypes(ChannelType.GuildText)
        )
        .setDMPermission(false),
    async execute(interaction) {
        const { options, channel } = interaction;
        const perms = require('../../../configs/config.js')
        const question = options.getString("question");
        const choiceOne = options.getString("choice-1");
        const choiceTwo = options.getString("choice-2");
        const Channel = options.getChannel("channel") || channel; 
        const PollPerms = perms.PollPerms
        if (interaction.member.roles.cache.some(role => PollPerms.includes(role.id))) {
            try {
                const message = await Channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("\`📊\` New Poll!")
                            .setDescription(`**Question:** ${question}`)
                            .addFields(
                                { name: "\`1️⃣\` Choice 1", value: `${config.reply}${choiceOne}`, inline: true },
                                { name: "\`2️⃣\` Choice 2", value: `${config.reply}${choiceTwo}`, inline: true }
                            )
                            .setFooter({
                                text: `Requested by: ${interaction.member.user.tag}`,
                                iconURL: interaction.member.displayAvatarURL({ dynamic: true })
                            })
                            .setColor("#2b2d31")
                            .setThumbnail(config.picture)
                    ]
                })
    
                
                await message.react("1️⃣");
                await message.react("2️⃣");
    
                
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Green")
                            .setDescription(
                                `:white_check_mark: | Successfully sent the poll embed in the channel: <#${Channel.id}>`
                            )
                            .addFields(
                                { name: "\`❓\` Question", value: `${question}`, inline: true },
                                { name: "\`1️⃣\` Choice 1", value: `${choiceOne}`, inline: true },
                                { name: "\`2️⃣\` Choice 2", value: `${choiceTwo}`, inline: true },
                            )
                    ],
                    ephemeral: true
                })
            } catch (err) { 
                console.log(err);
                return await interaction.reply({ // Send an error embed.
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Yellow")
                            .setDescription(
                                `:warning: | Something went wrong. Please try again later.`
                            )
                    ],
                    ephemeral: true
                })
            }
        } else {
            interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true});
        }
    }
}