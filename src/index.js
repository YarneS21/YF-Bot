const { Client, GatewayIntentBits, ModalBuilder, Partials, ActivityType, AttachmentBuilder, StringSelectMenuBuilder, ActionRowBuilder, ComponentType, ButtonBuilder, ButtonStyle, TextInputBuilder, TextInputStyle, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, ChannelType, Events, MessageType, UserFlagsBitField, InteractionResponse, ReactionUserManager } = require(`discord.js`);
const fs = require('fs');
const GiveawaysManager = require("./utils/giveaway");
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping], partials: [Partials.Channel, Partials.Reaction, Partials.Message] }); 
const config = require('../configs/config')

client.on("ready", async (client) => {
 
    setInterval(() => {

        let activities = [
            { type: 'Watching', name: 'YourForums'},
            { type: 'Watching', name: `${client.guilds.cache.reduce((a,b) => a+b.memberCount, 0)} members!`},
        ];

        const status = activities[Math.floor(Math.random() * activities.length)];

        if (status.type === 'Watching') {
            client.user.setPresence({ activities: [{ name: `${status.name}`, type: ActivityType.Watching }]});
        } else {
            client.user.setPresence({ activities: [{ name: `${status.name}`, type: ActivityType.Playing }]});
        }
        
    }, 5000);
})

const axios = require('axios');
const warningSchema = require('./Schemas.js/warn');
const { CaptchaGenerator } = require('captcha-canvas');
const reactschema = require('./Schemas.js/reactionroles');
const roleschema = require('./Schemas.js/autorole');

client.commands = new Collection();

require('dotenv').config();

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

// HANDLE ALL ERRORS!! //

const process = require('node:process');

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Giveaway Manager //

client.giveawayManager = new GiveawaysManager(client, {
    default: {
      botsCanWin: false,
      embedColor: "#a200ff",
      embedColorEnd: "#550485",
      reaction: "🎉",
    },
});

// Commands //

(async () => {
    for (file of functions) {
        require(`./functions/${file}`)(client);
    }
    client.handleEvents(eventFiles, "./src/events");
    client.handleCommands(commandFolders, "./src/commands");
    client.login(process.env.token)
})();

// Status //

client.on("ready", () => {
    console.log('Bot is online.');

    client.user.setStatus("online");

})

// Sticky Message Code //

const stickyschema = require('./Schemas.js/sticky');
const sticky = require('./commands/Moderation/sticky');

client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;

    stickyschema.findOne({ ChannelID: message.channel.id}, async (err, data) => {
        if (err) throw err;

        if (!data) {
            return;
        }

        let stickychannel = data.ChannelID;
        let cachedChannel = client.channels.cache.get(stickychannel);
        
        const embed = new EmbedBuilder()
        .setThumbnail(config.picture)
        .setFooter({ text: config.footer})
        .setDescription(`${config.reply} ${data.Message}`)
        .setColor(config.embedColor)
        .setTimestamp()

        if (message.channel.id == (stickychannel)) {

            data.CurrentCount += 1;
            data.save();

            if (data.CurrentCount > data.MaxCount) {
                try {
                    await client.channels.cache.get(stickychannel).messages.fetch(data.LastMessageID).then(async(m) => {
                        await m.delete();
                    })

                    let newMessage = await cachedChannel.send({ embeds: [embed]})

                    data.LastMessageID = newMessage.id;
                    data.CurrentCount = 0;
                    data.save();
                } catch {
                    return;
                }
            }
        }
    })
})

// REACTION ROLE CODE //

client.on(Events.MessageReactionAdd, async (reaction, member) => {

    try {
        await reaction.fetch();
    } catch (error) {
        return;
    }

    if (!reaction.message.guild) return;
    else {

        const reactionroledata = await reactschema.find({ MessageID: reaction.message.id });

        await Promise.all(reactionroledata.map(async data => {
            if (reaction.emoji.id !== data.Emoji) return;
            else {

                const role = await reaction.message.guild.roles.cache.get(data.Roles);
                const addmember = await reaction.message.guild.members.fetch(member.id);

                if (!role) return;
                else {

                    try {
                        await addmember.roles.add(role)
                    } catch (err) {
                        return console.log(err);
                    }

                    try {

                        const addembed = new EmbedBuilder()
                        .setColor(config.embedColor)
                        .setAuthor({ name: `💳 Reaction Role Tool`})
                        .setFooter({ text: `💳 Role Added`})
                        .setTitle('> You have been given a role!')
                        .setTimestamp()
                        .setThumbnail(config.picture)
                        .addFields({ name: `• Role`, value: `${config.reply} ${role.name}`}, { name: `• Emoji`, value: `${config.reply} ${reaction.emoji}`}, { name: `• Server`, value: `${config.reply} ${reaction.message.guild.name}`, inline: false})
                        addmember.send({ embeds: [addembed] })
    
                    } catch (err) {
                        return;
                    }
                }
            }
        }))
    }
})

client.on(Events.MessageReactionRemove, async (reaction, member) => {

    try {
        await reaction.fetch();
    } catch (error) {
        return;
    }

    if (!reaction.message.guild) return;
    else {

        const reactionroledata = await reactschema.find({ MessageID: reaction.message.id });

        await Promise.all(reactionroledata.map(async data => {
            if (reaction.emoji.id !== data.Emoji) return;
            else {

                const role = await reaction.message.guild.roles.cache.get(data.Roles);
                const addmember = await reaction.message.guild.members.fetch(member.id);

                if (!role) return;
                else {

                    try {
                        await addmember.roles.remove(role)
                    } catch (err) {
                        return console.log(err);
                    }

                    try {

                        const removeembed = new EmbedBuilder()
                        .setColor(config.embedColor)
                        .setAuthor({ name: `💳 Reaction Role Tool`})
                        .setFooter({ text: `💳 Role Removed`})
                        .setTitle('> You have removed from a role!')
                        .setTimestamp()
                        .setThumbnail(config.picture)
                        .addFields({ name: `• Role`, value: `${config.reply} ${role.name}`}, { name: `• Emoji`, value: `${config.reply} ${reaction.emoji}`}, { name: `• Server`, value: `${config.reply} ${reaction.message.guild.name}`, inline: false})
                        addmember.send({ embeds: [removeembed] })
    
                    } catch (err) {
                        return;
                    }
                }
            }
        }))
    }
})

//MOD LOGS
client.on(Events.ChannelCreate, async channel => {
    channel.guild.fetchAuditLogs({
        type: AuditLogEvent.ChannelCreate,
    })
    .then(async audit =>{
        const {executor} = audit.entries.first()
        const name = channel.name
        const id = channel.id
        let type = channel.type

        if (type == 0) type = 'Text'
        if (type == 2) type = 'Voice'
        if (type == 13) type = 'Stage'
        if (type == 15) type = 'Forum'
        if (type == 5) type = 'Announcement'
        if (type == 4) type = 'Category'

        const channelID = config.logChannel
        const logChan = await client.channels.fetch(channelID)

        logChan.send({ embeds: [new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle(":new: Channel Created")
            .addFields({name: "Channel Name", value: `${name} (<#${id}>)`, inline: false})
            .addFields({name: "Channel Type", value: `${type}`, inline: false})
            .addFields({name: "Channel ID", value: `${id}`, inline: false})
            .addFields({name: "Channel By", value: `${executor} - ${executor.tag}`, inline: false})
            .setTimestamp()
            .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
            .setFooter({ text: `YourForums Logging System`})]})
    })
})

client.on(Events.ChannelDelete, async channel => {
    channel.guild.fetchAuditLogs({
        type: AuditLogEvent.ChannelDelete,
    })
    .then(async audit =>{
        const {executor} = audit.entries.first()
        const name = channel.name
        const id = channel.id
        let type = channel.type

        if (type == 0) type = 'Text'
        if (type == 2) type = 'Voice'
        if (type == 13) type = 'Stage'
        if (type == 15) type = 'Forum'
        if (type == 5) type = 'Announcement'
        if (type == 4) type = 'Category'

        const channelID = config.logChannel
        const logChan = await client.channels.fetch(channelID)

        logChan.send({ embeds: [new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle(":put_litter_in_its_place: Channel Deleted")
            .addFields({name: "Channel Name", value: `${name}`, inline: false})
            .addFields({name: "Channel Type", value: `${type}`, inline: false})
            .addFields({name: "Channel ID", value: `${id}`, inline: false})
            .addFields({name: "Channel By", value: `${executor} - ${executor.tag}`, inline: false})
            .setTimestamp()
            .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
            .setFooter({ text: `YourForums Logging System`})]})
    })
})

client.on(Events.GuildBanAdd, async member => {
    member.guild.fetchAuditLogs({
        type: AuditLogEvent.GuildBanAdd,
    })
    .then(async audit =>{
        const {executor} = audit.entries.first()
        const name = member.user.tag
        const id = member.user.id

        const channelID = config.logChannel
        const logChan = await client.channels.fetch(channelID)

        logChan.send({ embeds: [new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle(":hammer: Member Banned")
            .addFields({name: "Member Name", value: `${config.reply}${name}`, inline: false})
            .addFields({name: "Member ID", value: `${config.reply}${id}`, inline: false})
            .addFields({name: "Banned By", value: `${config.reply}${executor} - ${executor.tag}`, inline: false})
            .setTimestamp()
            .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
            .setFooter({ text: `YourForums Logging System`})]})
    })
})

//UNBANS

client.on(Events.GuildBanRemove, async member => {
    member.guild.fetchAuditLogs({
        type: AuditLogEvent.GuildBanRemove,
    })
    .then(async audit =>{
        const {executor} = audit.entries.first()
        const name = member.user.tag
        const id = member.user.id

        const channelID = config.logChannel
        const logChan = await client.channels.fetch(channelID)

        logChan.send({ embeds: [new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle(":hammer: Member Unbanned")
            .addFields({name: "Member Name", value: `${config.reply}${name}`, inline: false})
            .addFields({name: "Member ID", value: `${config.reply}${id}`, inline: false})
            .addFields({name: "Unbanned By", value: `${config.reply}${executor} - ${executor.tag}`, inline: false})
            .setTimestamp()
            .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
            .setFooter({ text: `YourForums Logging System`})]})
    })
})

//MESSAGE DELETE

client.on(Events.MessageDelete, async (msg) => {
    //let logs = await msg.guild.fetchAuditLogs({type: 72});
    //let entry = logs.entries.first();

    const channelID = config.logChannel
    const logChan = await client.channels.fetch(channelID)

   //if(msg.author.bot) return;

    logChan.send({ embeds: [new EmbedBuilder()
        .setColor(config.embedColor)
        .setTitle(":fire: Message Deleted")
        .addFields({name: "Message Content", value: `${config.reply}${msg.content.replace(/`/g,"'")}`, inline: false})
        .addFields({name: "Message Channel", value: `${config.reply}${msg.channel}`, inline: false})
        .addFields({name: "Author", value: `${config.reply}${msg.author} - ${msg.author.tag}`, inline: false})
        //.addFields({name: "Deleted By", value: `${config.reply}${entry.executor} - ${entry.executor.tag}`, inline: false})
        .setTimestamp()
        .setThumbnail(msg.author.displayAvatarURL({dynamic: true}))
        .setFooter({ text: `YourForums Logging System`})]})
})

//MESSAGE EDIT

client.on(Events.MessageUpdate, async (message, newMessage) => {
        const mes = message.content

        if(!mes) return

        const channelID = config.logChannel
        const logChan = await client.channels.fetch(channelID)

        logChan.send({ embeds: [new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle(":wrench: Message Edited")
            .addFields({name: "Old Message", value: `${config.reply}${mes}`, inline: false})
            .addFields({name: "New Message", value: `${config.reply}${newMessage}`, inline: false})
            .addFields({name: "Message Channel", value: `${config.reply}${message.channel}`, inline: false})
            .addFields({name: "Edited By", value: `${config.reply}${message.author} - ${message.author.tag}`, inline: false})
            .setTimestamp()
            .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
            .setFooter({ text: `YourForums Logging System`})]})
})

// Welcome Message //

client.on(Events.GuildMemberAdd, async (member, err) => {

        const channelID = config.welcomeChannel;
        const channelwelcome = member.guild.channels.cache.get(channelID)

        const roledata = await roleschema.findOne({ Guild: member.guild.id });

        if (roledata) {
            const giverole = await member.guild.roles.cache.get(roledata.Role)

            member.roles.add(giverole).catch(err => {
                console.log('Error received trying to give an auto role!');
            })
        }
        
        const embedwelcome = new EmbedBuilder()
        .setColor(config.embedColor)
         .setTitle(`👋 Welcome to the Server!`)
         .setDescription( `${config.replyc}**Welcome ${member} to the Server!**\n${config.reply}👋 Get cozy and enjoy :)`)
         .setFooter({ text: `Welcome to YourForums!`})
         .setTimestamp()
         .setThumbnail(member.displayAvatarURL({dynamic: true}))  

        const embedwelcomedm = new EmbedBuilder()
         .setColor(config.embedColor)
         .setTitle('👋 Welcome to the Server!')
         .setDescription( `${config.replyc}**Welcome ${member} to the Server!**\n${config.reply}👋 Get cozy and enjoy :)`)
         .setFooter({ text: `Welcome to YourForums!`})
         .setTimestamp()
         .setThumbnail(member.displayAvatarURL({dynamic: true}))  
         
        await channelwelcome.send({ embeds: [embedwelcome]});
        member.send({ embeds: [embedwelcomedm]}).catch(err => console.log(`Welcome DM error: ${err}`))
    
})

// MEMBER LEAVE

client.on(Events.GuildMemberRemove, async (member, err) => {
        const channelID = config.welcomeChannel;
        const channelwelcome = member.guild.channels.cache.get(channelID);

        const embedleave = new EmbedBuilder()
        .setColor(config.embedColor)
        .setTitle(`👋 Member Left`)
        .setDescription( `${config.replyc}**${member} has left the Server**\n${config.reply}👋 Cast your goobyes`)
        .setFooter({ text: `We hope to see you back soon!`})
        .setTimestamp()
        .setThumbnail(member.displayAvatarURL({dynamic: true}))

        await channelwelcome.send({ embeds: [embedleave]}).catch(err);
})

// Verification //

const capschema = require('./Schemas.js/verify');
const verifyusers = require('./Schemas.js/verifyusers');

client.on(Events.InteractionCreate, async interaction => {

    if (interaction.guild === null) return;

    const verifydata = await capschema.findOne({ Guild: interaction.guild.id });
    const verifyusersdata = await verifyusers.findOne({ Guild: interaction.guild.id, User: interaction.user.id });

    if (interaction.customId === 'verify') {

        if (!verifydata) return await interaction.reply({ content: `The **verification system** has been disabled in this server!`, ephemeral: true});

        if (verifydata.Verified.includes(interaction.user.id)) return await interaction.reply({ content: 'You have **already** been verified!', ephemeral: true})
        else {

            let letter = ['0','1','2','3','4','5','6','7','8','9','a','A','b','B','c','C','d','D','e','E','f','F','g','G','h','H','i','I','j','J','f','F','l','L','m','M','n','N','o','O','p','P','q','Q','r','R','s','S','t','T','u','U','v','V','w','W','x','X','y','Y','z','Z',]
            let result = Math.floor(Math.random() * letter.length);
            let result2 = Math.floor(Math.random() * letter.length);
            let result3 = Math.floor(Math.random() * letter.length);
            let result4 = Math.floor(Math.random() * letter.length);
            let result5 = Math.floor(Math.random() * letter.length);

            const cap = letter[result] + letter[result2] + letter[result3] + letter[result4] + letter[result5];
            console.log(cap)

            const captcha = new CaptchaGenerator()
            .setDimension(150, 450)
            .setCaptcha({ text: `${cap}`, size: 60, color: "red"})
            .setDecoy({ opacity: 0.5 })
            .setTrace({ color: "red" })

            const buffer = captcha.generateSync();
            
            const verifyattachment = new AttachmentBuilder(buffer, { name: `captcha.png`});
            
            const verifyembed = new EmbedBuilder()
            .setColor('Green')
            .setAuthor({ name: `✅ Verification Proccess`})
            .setFooter({ text: `✅ Verification Captcha`})
            .setTimestamp()
            .setImage(`attachment://captcha.png`)
            .setThumbnail(config.picture)
            .setTitle(`${config.reply}Verification Step: Captcha`)
            .addFields({ name: `• Verify`, value: `${config.reply} Use the button bellow to submit your captcha!`})

            const verifybutton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setLabel('✅ Enter Captcha')
                .setStyle(ButtonStyle.Success)
                .setCustomId('captchaenter')
            )

            const vermodal = new ModalBuilder()
            .setTitle('Verification')
            .setCustomId('vermodal')

            const answer = new TextInputBuilder()
            .setCustomId('answer')
            .setRequired(true)
            .setLabel('• Please sumbit your Captcha code')
            .setPlaceholder('Your captcha code')
            .setStyle(TextInputStyle.Short)

            const vermodalrow = new ActionRowBuilder().addComponents(answer);
            vermodal.addComponents(vermodalrow);

            const vermsg = await interaction.reply({ embeds: [verifyembed], components: [verifybutton], ephemeral: true, files: [verifyattachment] });

            const vercollector = vermsg.createMessageComponentCollector();

            vercollector.on('collect', async i => {

                if (i.customId === 'captchaenter') {
                    i.showModal(vermodal);
                }

            })

            if (verifyusersdata) {

                await verifyusers.deleteMany({
                    Guild: interaction.guild.id,
                    User: interaction.user.id
                })

                await verifyusers.create ({
                    Guild: interaction.guild.id,
                    User: interaction.user.id,
                    Key: cap
                })

            } else {

                await verifyusers.create ({
                    Guild: interaction.guild.id,
                    User: interaction.user.id,
                    Key: cap
                })

            }
        } 
    }
})

client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'vermodal') {

        const userverdata = await verifyusers.findOne({ Guild: interaction.guild.id, User: interaction.user.id });
        const verificationdata = await capschema.findOne({ Guild: interaction.guild.id });

        if (verificationdata.Verified.includes(interaction.user.id)) return await interaction.reply({ content: `You have **already** verified within this server!`, ephemeral: true});
        
        const modalanswer = interaction.fields.getTextInputValue('answer');
        if (modalanswer === userverdata.Key) {

            const verrole = await interaction.guild.roles.cache.get(verificationdata.Role);

            try {
                await interaction.member.roles.add(verrole);
            } catch (err) {
                return await interaction.reply({ content: `There was an **issue** giving you the **<@&${verificationdata.Role}>** role, try again later!`, ephemeral: true})
            }

            await interaction.reply({ content: 'You have been **verified!**', ephemeral: true});
            await capschema.updateOne({ Guild: interaction.guild.id }, { $push: { Verified: interaction.user.id }});

        } else {
            await interaction.reply({ content: `**Oops!** It looks like you **didn't** enter the valid **captcha code**!`, ephemeral: true})
        }
    }
})
