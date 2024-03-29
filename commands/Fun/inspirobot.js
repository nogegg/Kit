const Discord = require("discord.js");
var axios = require("axios");

exports.run = async (client, message, args) => {
	var request = await axios.get("http://inspirobot.me/api?generate=true");
	const embed = new Discord.MessageEmbed()
		.setImage(request.data)
		.setDescription("Powered by [Inspirobot](https://inspirobot.me/)")
	client.messageHandler(message, client.isInteraction, { embeds: [embed] });
}

exports.conf = {
	name: "Inspirobot",
	help: "Generate an image from insprobot.me",
	format: "k?inspirobot",
	DM: false,
	ownerOnly: false,
	alias: [],
	slashCommand: true,
	data: {
		name: "inspirobot",
		description: "Pull an image from Inspirobot",
		options: [],
		dm_permission: false
	}
}