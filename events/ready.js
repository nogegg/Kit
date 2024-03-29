const fs = require('fs');
let config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
const axios = require('axios');
const cron = require('node-cron');

exports.run = async (deletedMessage, pool, client) => {

	var altStatus = client.config.prefix + 'help';
	client.user.setPresence({ activities: [{ name: client.data.status }], status: 'dnd' });

	(async function setStatus() {
		while (true) {
			await new Promise(resolve => setTimeout(resolve, 600000));

			var currentStatus = client.user.presence.activities[0].name;

			if(currentStatus === client.data.status){
				client.user.setPresence({ activities: [{ name: altStatus }], status: 'dnd' });
			} else {
				client.user.setPresence({ activities: [{ name: client.data.status }], status: 'dnd' });
			}
		}
	})();

	var guildCount = 0;

	client.guilds.fetch().then(g=>{
		var guildPile = g.map(e=>e.id);
		guildPile.forEach(e=>{
			client.guilds.fetch(e).then(fetchedGuild=>{
				fetchedGuild.members.fetch()
				guildCount = guildCount + 1;
			})
		})
	})

	/*
	var reactCount = 0;

	row = await pool.query(`select * from reactionroles`);
		row = row.rows;
		console.log(row);
		row.forEach(entry => {
			console.log('entry: ' + JSON.stringify(entry))
			var guildID = entry.serverid;
			var channelID = JSON.parse(entry.messageid).channelid;
			var messageID = JSON.parse(entry.messageid).messageid;

			client.guilds.fetch(guildID).then(guild=>{
				guild.channels.fetch(channelID).then(channel=>{
					channel.messages.fetch(messageID);
					reactCount = reactCount+1;
				}).catch(err=>{})
			}).catch(err=>{})
		})

	console.log(`Loaded ${reactCount} reaction messages`)
*/
	var current = 0
	current = await axios.get('https://raw.githubusercontent.com/2tuu/Kit/master/plugins/data.json');
	current = current.data.version;

	client.currentVersion = current;

	let version = require("./../plugins/data.json");
	client.version = version.version;
	client.codename = version.codename;

	console.log(`Loaded ${client.totalCommands} modules - ${client.failedCommands.length} failed`);
	console.log("============================");
	if ((current > client.version) && parseInt(client.version) !== 0) {
		console.error('Your framework is out of date - To update, download and overwrite the contents of my folder');
		console.error(`The current Github version is: ` + current + '\n');
		console.error(`Your version is: ` + client.version + '\n');
		console.error('\n To disable this notice, set your version number in /plugins/data.json to 0');
		console.log("============================");
	} else if (client.version == '0') {
		//disable version report
	} else {
		console.log(`Version: ` + client.version + ' - ' + client.codename);
	}
	console.log(`${client.channels.cache.size} channels\n${client.guilds.cache.size} guilds`);
	console.log("=============log============");

	client.emojiPile = client.emojis.cache.toJSON().map(e=>e).map(e=>e.id)
	console.log('Loaded local emote cache')

	const logChannel = client.channels.resolve(config.logChannel);
	logChannel.send(`\`\`\`js
	Log-in Success:
	Version: ${client.version}

	User Cache: ${client.users.cache.size}
	Server Count: ${client.guilds.cache.size}
	\`\`\``)
	if (client.failedCommands.length > 0) {
		logChannel.send(`\`\`\`js
		ERROR LOADING COMMANDS: ${client.failedCommands}
		\`\`\``)
	}

	cron.schedule("*/30 * * * * *", async function () {

		var currenttime = Date.now();
		var remind = await pool.query(`SELECT * FROM timer`);
		remind = remind.rows;

		remind.forEach(e => {
			var status = '';
			if (e.endtime < currenttime) {

				if (currenttime - e.endtime > 300000) {
					status = ' (delayed)';
				}

				client.channels.fetch(e.channelcreated)
					.then(channel => {
						pool.query(`DELETE FROM timer WHERE "endtime" ='${e.endtime}'`);
						try {
							channel.send(`<@${e.user}>, earlier you reminded me to tell you \`${e.message.replace(/[`]/g, '')}\`` + status);
						} catch (err) {
							client.logChannel.send('```Error sending a reminder (' + channel.id + ')')
						}
					})
					.catch(console.error);
			}
		});

	});

	client.logChannel = client.channels.resolve(config.logChannel);

}
