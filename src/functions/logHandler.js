const { 
    EmbedBuilder 
} = require("discord.js");
 
function logHandler(client) {
 
  // Import Log Schema  
  const logSchema = require("../Schema/logSchema");
 
  async function send_log(guildId, embed) {
    try {
      const data = await logSchema.findOne({ Guild: guildId });
      if (!data || !data.Channel) return;
 
      const logChannel = client.channels.cache.get(data.Channel);
      if (!logChannel) return;
 
      embed.setTimestamp();
 
      logChannel.send({ embeds: [embed] });
    } catch (err) {
      console.log(err);
    }
  }
 
    // Message Delete Log
 
    client.on("messageDelete", function (message) {
        if (message.author.bot) return;
 
        const embed = new EmbedBuilder()
            .setTitle('Message Deleted')
            .setColor('Red')
            .setDescription(`
            **Author**: <@${message.author.id}>\n**Date**: ${message.createdAt}\n**Channel**: <#${message.channel.id}>\n**Content**: ${message.content.replace(/`/g, "'")}`);
 
        return send_log(message.guild.id, embed);
    });
 
    // Channel Topic Update Log
 
    client.on("guildChannelTopicUpdate", (channel, oldTopic, newTopic) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Channel Topic Updated')
            .setColor('Green')
            .setDescription(`${channel} **topic** has been updated.\n**Previous**: ${oldTopic}\n**New**: ${newTopic}`);
 
        return send_log(channel.guild.id, embed);
 
    });
 
    // Channel Permission Update Log
 
    client.on("guildChannelPermissionsUpdate", (channel, oldPermissions, newPermissions) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Channel Permission Updated')
            .setColor('Green')
            .setDescription(`${channel.name} permissions has been updated.\n**Previous**: ${oldPermissions}\n**New**: ${newPermissions}`);
 
        return send_log(channel.guild.id, embed);
 
    })
 
    // Guild Channel Update
    client.on("unhandledGuildChannelUpdate", (oldChannel, newChannel) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Channel Updated!')
            .setColor('Green')
            .setDescription(`Server channel has been updated.\n**Previous**: ${oldChannel}\n**New**: ${newChannel}`);
 
        return send_log(oldChannel.guild.id, embed);
 
    });
 
    // Member Boosted
 
    client.on("guildMemberBoost", (member) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Member Boosted')
            .setColor('Pink')
            .setDescription(`**${member.user.tag}** has started boosting ${member.guild.name}!`);
        return send_log(member.guild.id, embed);
 
    })
 
    // Member Unboosted
 
    client.on("guildMemberUnboost", (member) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Member Unboosted')
            .setColor('Pink')
            .setDescription(`**${member.user.tag}** has stopped boosting ${member.guild.name}.`);
 
        return send_log(member.guild.id, embed);
 
    })
 
    // Member Add-Role
 
    client.on("guildMemberRoleAdd", (member, role) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Member Add-Role')
            .setColor('Green')
            .setDescription(`**${member.user.tag}** has received ${role.name}.`);
 
        return send_log(member.guild.id, embed);
 
    })
 
    // Member Remove-Role
 
    client.on("guildMemberRoleRemove", (member, role) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Member Remove-Role')
            .setColor('Red')
            .setDescription(`**${member.user.tag}** has unreceived ${role.name}.`);
 
        return send_log(member.guild.id, embed);
 
    })
 
    // Member Nickname Update
 
    client.on("guildMemberNicknameUpdate", (member, oldNickname, newNickname) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Nickname Updated')
            .setColor('Green')
            .setDescription(`**${member.user.tag}** has changed their nickname.\n**Previous**: ${oldNickname}\n**New**: ${newNickname}`);
 
        return send_log(member.guild.id, embed);
 
    })
 
    // Member Joined Server
 
    client.on("guildMemberAdd", (member) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Member Joined')
            .setColor('Green')
            .setDescription(`${member.user} has joined **${member.guild.name}**!`,
                member.user.displayAvatarURL({ dynamic: true }));
 
        return send_log(member.guild.id, embed);
 
    });
 
    // Member Left Server
 
    client.on("guildMemberRemove", (member) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Member Left')
            .setColor('Red')
            .setDescription(`${member.user} has left **${member.guild.name}**.`,
                member.user.displayAvatarURL({ dynamic: true }));
 
        return send_log(member.guild.id, embed);
 
    });
 
    // Server Boost Level Up
 
    client.on("guildBoostLevelUp", (guild, oldLevel, newLevel) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Server Boost Level')
            .setColor('Pink')
            .setDescription(`**${guild.name}** has reached the boost level **${newLevel}**!`);
 
        return send_log(guild.id, embed);
 
    })
 
    // Server Boost Level Down
 
    client.on("guildBoostLevelDown", (guild, oldLevel, newLevel) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Server Boost Level')
            .setColor('Pink')
            .setDescription(`**${guild.name}** lost a level from **${oldLevel}** to **${newLevel}**.`);
 
        return send_log(guild.id, embed);
 
    })
 
    // Server Banner Add
 
    client.on("guildBannerAdd", (guild, bannerURL) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Server Banner Update')
            .setColor('Green')
            .setImage(bannerURL)
 
        return send_log(guild.id, embed);
 
    })
 
    // AFK Channel Add
 
    client.on("guildAfkChannelAdd", (guild, afkChannel) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Server Update')
            .setColor('Green')
            .setDescription(`**${guild.name}** has a new afk channel ${afkChannel}.`);
 
        return send_log(guild.id, embed);
 
    })
 
    // Guild Vanity Add
 
    client.on("guildVanityURLAdd", (guild, vanityURL) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Vanity Link')
            .setColor('Green')
            .setDescription(`**${guild.name}** has their own vanity link now!\n**Discord Link**: ${vanityURL}`);
 
        return send_log(guild.id, embed);
 
    })
 
    // Guild Vanity Remove
 
    client.on("guildVanityURLRemove", (guild, vanityURL) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Vanity Link')
            .setColor('Red')
            .setDescription(`**${guild.name}** has removed their vanity link.\n**Discord Link**: ${vanityURL}`);
 
        return send_log(guild.id, embed);
 
    })
 
    // Guild Vanity Link Update
 
    client.on("guildVanityURLUpdate", (guild, oldVanityURL, newVanityURL) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Vanity Link')
            .setColor('Green')
            .setDescription(`**${guild.name}** has updated their vanity link!\n**Previous**: ${oldVanityURL}\n**New**: ${newVanityURL}`);
 
        return send_log(guild.id, embed);
 
    })
 
    // Message Pin
 
    client.on("messagePinned", (message) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Message Pinned')
            .setColor('Grey')
            .setDescription(`${message} has been pinned by ${message.author}.`);
 
        return send_log(message.guild.id, embed);
 
    })
 
    // Message Edit
 
    client.on("messageContentEdited", (message, oldContent, newContent) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Message Edited')
            .setColor('Grey')
            .setDescription(`**Previous**: ${oldContent}\n**New**: ${newContent}\n**Author**: ${message.author}`);
 
        return send_log(message.guild.id, embed);
 
    })
 
    // Role Position Update
 
    client.on("rolePositionUpdate", (role, oldPosition, newPosition) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Role Position Updated')
            .setColor('Green')
            .setDescription(`**${role.name}** position has been updated.\n**Previous**: ${oldPosition}\n**New**: ${newPosition}`);
 
        return send_log(role.guild.id, embed);
 
    })
 
    // Role Permission Update
 
    client.on("rolePermissionsUpdate", (role, oldPermissions, newPermissions) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Role Permission Updated')
            .setColor('Green')
            .setDescription(`**${role.name}** permissions has been updated.\n**Previous**: ${oldPermissions}\n**New**: ${newPermissions}`);
 
        return send_log(role.guild.id, embed);
 
    })
 
    // Username Update
 
    client.on("userUsernameUpdate", (user, oldUsername, newUsername) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Username Updated')
            .setColor('Green')
            .setDescription(`${user.tag} updated their username.\n**Previous**: ${oldUsername}\n**New**: ${newUsername}`);
 
        return send_log(user.guild.id, embed);
 
    })
 
    // Discriminator Update
 
    client.on("userDiscriminatorUpdate", (user, oldDiscriminator, newDiscriminator) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Discriminator Updated')
            .setColor('Green')
            .setDescription(`**${user.tag}** updated their discriminator.\n**Previous**: ${oldDiscriminator}\n**New**: ${newDiscriminator}`);
 
        return send_log(user.guild.id, embed);
 
    })
 
    // Joined Voice Channel
 
    client.on("voiceChannelJoin", (member, channel) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Voice Channel')
            .setColor('Green')
            .setDescription(`**${member.user.tag}** has joined ${channel}.`);
 
        return send_log(member.guild.id, embed);
 
    })
 
    // Left Voice Channel
 
    client.on("voiceChannelLeave", (member, channel) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Voice Channel')
            .setColor('Red')
            .setDescription(`**${member.user.tag}** has left ${channel}.`);
 
        return send_log(member.guild.id, embed);
 
    })
 
    // Voice Channel Switch
 
    client.on("voiceChannelSwitch", (member, oldChannel, newChannel) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Voice Channel')
            .setColor('Green')
            .setDescription(`**${member.user.tag}** has switched the voice channel.\n**Previous**: ${oldChannel}\n**New**: ${newChannel}`);
 
        return send_log(member.guild.id, embed);
 
    })
 
    // Voice Channel Mute
 
    client.on("voiceChannelMute", (member, muteType) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Voice Channel')
            .setColor('Red')
            .setDescription(`**${member.user.tag}** has been muted.\n**Type**: ${muteType}`);
 
        return send_log(member.guild.id, embed);
 
    })
 
    // Voice Channel Unmute
 
    client.on("voiceChannelUnmute", (member, oldMuteType) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Voice Channel')
            .setColor('Green')
            .setDescription(`**${member.user.tag}** has been unmuted.\n**Type**: ${oldMuteType}`);
 
        return send_log(member.guild.id, embed);
 
    })
 
    // Voice Channel Defean
 
    client.on("voiceChannelDeaf", (member, deafType) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Voice Channel')
            .setColor('Red')
            .setDescription(`**${member.user.tag}** has been defeaned.\n**Type**: ${deafType}`);
 
        return send_log(member.guild.id, embed);
 
    })
 
    // Voice Channel Undefean
 
    client.on("voiceChannelUndeaf", (member, deafType) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Voice Channel')
            .setColor('Green')
            .setDescription(`**${member.user.tag}** has been undefeaned.\n**Type**: ${deafType}`);
 
        return send_log(member.guild.id, embed);
 
    })
 
    // User Started to Stream
 
    client.on("voiceStreamingStart", (member, voiceChannel) => {
 
 
        const embed = new EmbedBuilder()
            .setTitle('Voice Channel')
            .setColor('Green')
            .setDescription(`**${member.user.tag}** has started to stream.\n**Channel**: ${voiceChannel}`);
 
        return send_log(member.guild.id, embed);
 
    })
 
    // User Stopped to Stream
 
    client.on("voiceStreamingStop", (member, voiceChannel) => {
 
 
        const embed = new EmbedBuilder()
            .setTitle('Voice Channel')
            .setColor('Red')
            .setDescription(`**${member.user.tag}** has stopped the stream.\n**Channel**: ${voiceChannel}`);
 
        return send_log(member.guild.id, embed);
    });
 
    // Member Became Offline
 
    client.on("guildMemberOffline", (member, oldStatus) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Member Offline')
            .setColor('Green')
            .setDescription(`**${member.user.tag}** went offline.`);
 
        return send_log(member.guild.id, embed);
 
    });
 
    // Member Became Online
 
    client.on("guildMemberOnline", (member, newStatus) => {
 
        const embed = new EmbedBuilder()
            .setTitle('Member Online')
            .setColor('Green')
            .setDescription(`**${member.user.tag}** is now online.`);
 
        return send_log(member.guild.id, embed);
 
    });
 
    // Role Create
 
    client.on("roleCreate", async (role) => {
        const logs = await role.guild.fetchAuditLogs({ limit: 1, type: 30 });
        const log = logs.entries.first();
 
        const embed = new EmbedBuilder()
          .setTitle('Role Added')
          .setColor('Green')
          .setDescription(`${role}/${role.name} was created by <@${log.executor.id}>.`);
 
        return send_log(role.guild.id, embed);
      });
 
 
    // Role Delete
 
    client.on("roleDelete", async (role) => {
        const logs = await role.guild.fetchAuditLogs({ limit: 1, type: 32 });
        const log = logs.entries.first();
 
        const embed = new EmbedBuilder()
          .setTitle('Role Deleted')
          .setColor('Red')
          .setDescription(`${role}/${role.name} was deleted by <@${log.executor.id}>.`);
 
        return send_log(role.guild.id, embed);
      });
 
 
    // User Ban
 
    client.on("guildBanAdd", async ({ guild, user }) => {
        const logs = await guild.fetchAuditLogs({ limit: 1, type: 22 });
        const log = logs.entries.first();
 
        const embed = new EmbedBuilder()
          .setTitle('Member Banned')
          .setColor('Red')
          .setDescription(`${user}/${user.id} was banned by <@${log.executor.id}>.`);
 
        return send_log(guild.id, embed);
      });
 
 
    // User Unban
 
    client.on("guildBanRemove", async ({ guild, user }) => {
        const logs = await guild.fetchAuditLogs({ limit: 1, type: 22 });
        const log = logs.entries.first();
        const executor = log.executor;
        const embed = new EmbedBuilder()
          .setTitle('Member Unbanned')
          .setColor('Green')
          .setDescription(`${user}/${user.id} was unbanned by <@${executor.id}>.`);
 
        return send_log(guild.id, embed);
      });      
 
    // Channel Create
 
    client.on("channelCreate", async (channel) => {
        const auditLogs = await channel.guild.fetchAuditLogs({
          limit: 1,
          type: 10 
        });
 
        const entry = auditLogs.entries.first();
        if (!entry) return;
 
        const user = entry.executor;
 
        const embed = new EmbedBuilder()
          .setTitle('Channel Created')
          .setColor('Green')
          .setDescription(`${channel.name} has been created by ${user}.`);
 
        return send_log(channel.guild.id, embed);
    });
 
    // Channel Delete
 
    client.on("channelDelete", async (channel) => {
        const auditLogs = await channel.guild.fetchAuditLogs({
          limit: 1,
          type: 12
        });
 
        const entry = auditLogs.entries.first();
        if (!entry) return;
 
        const user = entry.executor;
 
        const embed = new EmbedBuilder()
          .setTitle('Channel Deleted')
          .setColor('Red')
          .setDescription(`${channel.name} has been deleted by ${user}.`);
 
        return send_log(channel.guild.id, embed);
    });
}
 
module.exports = { logHandler };