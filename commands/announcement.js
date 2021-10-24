const Discord = require("discord.js");

//temporary (?) accouncement command

exports.run = (client, message, args) => {
    const embed = new Discord.MessageEmbed()
        .setDescription("Development announcements/news can be found [here](https://github.com/2tuu/Kit/blob/master/docs/news.md)")
    message.channel.send({embed});
}

exports.conf = {
    name: "Announcement",
    help: "Temporary announcement command",
    format: "n/a",
    DM: true,
    OwnerOnly: false,
    alias: []
}