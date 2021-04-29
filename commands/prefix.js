const Discord = require("discord.js");

exports.run = (client, message, args, deletedMessage, sql) => {
       //Check for permissions
       
       //return message.channel.send("Custom prefixes are disabled until the database is reworked.");

       var row = sql.get(`SELECT * FROM prefixes WHERE serverId ="${message.guild.id}"`);
        if(!row){
          sql.run(`INSERT INTO prefixes (prefix, welcomeMessage, welcomeChannel, shouldWelcome, serverId) VALUES ("k?", "This is a placeholder", "null", "false", ${message.guild.id})`);
          console.log("added to prefixes");
        }

        if(message.member.permissions.has('ADMINISTRATOR') || message.author.id === "378769654942007299"){
            row = sql.get(`SELECT * FROM prefixes WHERE serverId ="${message.guild.id}"`);
            if(args.length === 0){
              return message.channel.send("Please enter a valid prefix");
            }
        
                sql.run(`UPDATE prefixes SET prefix = "${args[0].replace("\"", "").replace("\"", "")}" WHERE serverId = ${message.guild.id}`);

                const embed = new Discord.MessageEmbed()
                .setTimestamp()
                .setTitle("Server prefix changed to: \"" + args[0].replace("\"", "").replace("\"", "") + "\"")
                message.channel.send({embed});
            
                console.log('\x1b[36m%s\x1b[0m', "Server prefix for GUILD ID: " + message.guild.id);
                console.log('\x1b[36m%s\x1b[0m', "Changed to: " + args[0]);
              

            } else {
                const embed = new Discord.MessageEmbed()
                .setColor(0xF46242)
                .setTimestamp()
                .setTitle("You do not have permission to do this. (Admin required)")
                message.channel.send({embed});
            
                 }


    
       
}

exports.conf = {
  help: "Set my prefix to be used in this server",
  format: "k?prefix [prefix]",
  DM: false,
  OwnerOnly: false,
  alias: ['setprefix']
}