const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
  } = require("discord.js");
  const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName("advice")
      .setDescription("Get random advice."),
    async execute(interaction) {
      const data = await fetch("https://api.adviceslip.com/advice").then((res) =>
        res.json()
      );
      
      const embed = new EmbedBuilder()
      .setTimestamp()
      .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081275127850864640/largeblue.png')
      .setTitle('> Advice Given')
      .setFooter({ text: `🤝 Advice Fetched`})
      .setAuthor({ name: `🤝 Advice Randomizer`})
      .addFields({ name: `• Advice`, value: `${config.reply} ${data.slip.advice}`})
      .setColor(config.embedColor)

      await interaction.reply({embeds: [embed]});
    },
  };
  