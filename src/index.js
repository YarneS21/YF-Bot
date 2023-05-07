const { AuditLogEvent, Client, GatewayIntentBits, ModalBuilder, Partials, ActivityType, AttachmentBuilder, StringSelectMenuBuilder, ActionRowBuilder, ComponentType, ButtonBuilder, ButtonStyle, TextInputBuilder, TextInputStyle, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, ChannelType, Events, MessageType, UserFlagsBitField, InteractionResponse, ReactionUserManager } = require(`discord.js`);
const fs = require('fs');
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

// Commands //

const { logHandler } = require("./utils/logHandler");

(async () => {
    for (file of functions) {
        require(`./functions/${file}`)(client);
    }
    client.handleEvents(eventFiles, "./src/events");
    client.handleCommands(commandFolders, "./src/commands");
    client.login(process.env.token);
    logHandler(client);
})();

// Status //

client.on("ready", () => {
    console.log('Bot is online.');

    client.user.setStatus("online");

})

// Sticky Message Code //

const stickyschema = require('./Schemas.js/sticky');

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

    if (message.channel.id == config.suggestionChannel) {
        message.delete()
        const Channel = await client.channels.fetch(config.suggestionChannel)
        const newMessage = await Channel.send({embeds: [
            new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle(`${message.author.tag}`)
            .setDescription(`${message.content.replace(/`/g,"'")}`)
            .setThumbnail(message.author.displayAvatarURL())]
        })
        await newMessage.react("<:tick:1040008503617671261>")
        await newMessage.react("<:cross:1040008993457836174>")
    }
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
            .setThumbnail(config.picture)
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
            .setThumbnail(config.picture)
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
            .setThumbnail(member.displayAvatarURL({dynamic: true}))        
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
            .setThumbnail(member.displayAvatarURL({dynamic: true}))          
            .setFooter({ text: `YourForums Logging System`})]})
    })
})

//MESSAGE DELETE

client.on(Events.MessageDelete, async (msg) => {
    let logs = await msg.guild.fetchAuditLogs({type: 72});
    let entry = logs.entries.first();

    const channelID = config.logChannel
    const logChan = await client.channels.fetch(channelID)

   try {
    try {
        logChan.send({ embeds: [new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle(":fire: Message Deleted")
            .addFields({name: "Message Content", value: `${config.reply}${msg.content.replace(/`/g,"'")}`, inline: false})
            .addFields({name: "Message Channel", value: `${config.reply}${msg.channel}`, inline: false})
            .addFields({name: "Author", value: `${config.reply}${msg.author} - ${msg.author.tag}`, inline: false})
            .addFields({name: "Deleted By", value: `${config.reply}${entry.executor} - ${entry.executor.tag}`, inline: false})
            .setTimestamp()
            .setThumbnail(msg.author.displayAvatarURL({dynamic: true}))
            .setFooter({ text: `YourForums Logging System`})]})
    } catch (err) {
        logChan.send({ embeds: [new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle(":fire: Message Deleted")
            .addFields({name: "Message Content", value: `*Not Fetchable*`, inline: false})
            .addFields({name: "Message Channel", value: `${config.reply}${msg.channel}`, inline: false})
            .addFields({name: "Author", value: `*Not Fetchable*`, inline: false})
            .addFields({name: "Deleted By", value: `${config.reply}${entry.executor} - ${entry.executor.tag}`, inline: false})
            .setTimestamp()
            .setFooter({ text: `YourForums Logging System`})]})
    }

    } catch (err) {
        console.log(err);
        return console.log('This is a normal error dont worry about it mate')
    }
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
        const channelwelcome = member.guild.channels.cache.get(channelID)

        const embedleave = new EmbedBuilder()
        .setColor(config.embedColor)
        .setTitle(`👋 Member Left`)
        .setDescription( `${config.replyc}**${member} has left the Server**\n${config.reply}👋 Cast your goobyes`)
        .setFooter({ text: `We hope to see you back soon!`})
        .setTimestamp()
        .setThumbnail(member.displayAvatarURL({dynamic: true}))

        await channelwelcome.send({ embeds: [embedleave]}).catch(err);
})
