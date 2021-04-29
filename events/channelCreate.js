const Discord = require(`discord.js`);

exports.run = async (deletedMessage, sql, client, channel) => {

    var channelID = channel.id;
    try{
    var guildID = channel.guild.id;
    } catch(err){
        return; //return on dm
    }

    var row = sql.get(`SELECT * FROM modlog WHERE serverId ="${guildID}"`);

        if(!row) return;

        if(row.enabled === "yes" && row.logChannels === "yes"){
            var ch = client.guilds.cache.get(guildID).channels.cache.get(row.channel);
            ch.send("```diff\n+Channel Created\n" + channel.name + " (" + channel.id + ")\n```")
        }

   
}