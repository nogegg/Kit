const Discord = require("discord.js");
const config = require('./../config.json');

const reportedRecently = new Set();

exports.run = (client, message, args) => {

    if (reportedRecently.has(message.author.id)) {
        let embedVar = new Discord.MessageEmbed()
        .setColor(`0x${client.colors.bad}`)
        .setTitle("Please wait at least 4 hours before reporting another error")
        return message.channel.send({embed: embedVar});
      } else {
        reportedRecently.add(message.author.id);
        setTimeout(() => {
        reportedRecently.delete(message.author.id);
        }, 14400000);
      }

    if(!args[0]) return;
    // get client from message's channel
	let clientVar = message.channel.client;

	// fetch user via given user id
	let user = client.users.fetch(config.owner)
	    .then(user => {
            var letterAR = ["A", "B", "C", "D"];
            var rand = letterAR[Math.floor(Math.random() * letterAR.length)];

            var errID = `${rand}-${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}-1`;

            const embed1 = new Discord.MessageEmbed()
                .setTitle("Error ID: " + errID)
                .setColor(`0x${client.colors.bad}`)
                .setThumbnail(message.author.avatarURL)
                .addField("From", message.author.id + " (" + message.author.username + "#" + message.author.discriminator + ")")
                .addField("Sent in", message.guild.name + " (" + message.guild.id + ")")
                .addField("Report", args.join(' '))
                .setTimestamp()
                .setFooter("Error reported")
                user.send({embed: embed1}).then().catch(console.error);
                

                var chan = client.channels.cache.get(config.reports);

                const embed2 = new Discord.MessageEmbed()
                .setTitle("Error ID: " + errID)
                .setThumbnail(message.author.avatarURL)
                .addField("From", message.author.username)
                .addField("Sent in", message.guild.name)
                .addField("Report", args.join(' '))
                .setTimestamp()
                .setFooter("Error reported")
                chan.send({embed: embed2}).then().catch(console.error);
        
        let embedVar = new Discord.MessageEmbed()
        .setColor(`0x${client.colors.good}`)
        .setTitle("Error has been reported, make sure to enable DMs on this server so that a follow-up message can be sent.")
        message.channel.send({embed: embedVar});
        
        }).then().catch(console.error);

}

exports.conf = {
    category: "Utility",
    name: "N/A (dev command)",
    help: "Report a bug to the bot; please include a detailed description of what triggered said bug",
    format: "k?reportbug [description]",
    DM: false,
    OwnerOnly: false,
    alias: []
}