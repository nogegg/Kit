const fs = require('fs');
let data = JSON.parse(fs.readFileSync("./JSON/data.json", "utf8"));
let config = JSON.parse(fs.readFileSync("./config.json", "utf8"));

exports.run = async (deletedMessage, pool, client, message) => {

  pool.query(`SELECT * FROM xban WHERE serverid ='${message.guild.id}'`).then(row => {
    row = row.rows[0];
    if(!row) return;

    var bannedUsers = row.userarray.split(',');

    if(bannedUsers.includes(message.author.id)){
      console.log(`auto-banning ${message.author.username} (${message.author.id})`);
      message.member.ban({reason: `Automated ban by ${client.user.tag}`}).catch(error => {});// don't clog u the log if improper permissions were set

    }

  });

      if(!message.guild) return;
      pool.query(`SELECT * FROM prefixes WHERE serverId ='${message.guild.id}'`).then(row => {
        if(!row.rows[0]){
          pool.query(`INSERT INTO prefixes (prefix, welcomeMessage, welcomeChannel, shouldWelcome, serverId) VALUES ('${config.prefix}', 'This is a placeholder welcome message', 'null', 'false', '${message.guild.id}')`);
        }
      });
      pool.query(`SELECT * FROM giverole WHERE serverid ='${message.guild.id}'`).then(row => {
        if(!row.rows[0]){
          pool.query(`INSERT INTO giverole (serverid, rolearray) VALUES ('${message.guild.id}', '')`);
          console.log(`Added ${message.guild.id} (${message.guild.name}) to giverole`)
        }
      });
      pool.query(`SELECT * FROM xban WHERE serverid ='${message.guild.id}'`).then(row => {
        if(!row.rows[0]){
          pool.query(`INSERT INTO xban (serverid, userarray) VALUES ('${message.guild.id}', '')`);
          console.log(`Added ${message.guild.id} (${message.guild.name}) to xban`)
        }
      });

      pool.query(`SELECT * FROM announce WHERE guild ='${message.guild.id}'`).then(row => {
        if(!row.rows[0]){
          pool.query(`INSERT INTO announce (guild, channel) VALUES ('${message.guild.id}', null)`);
        }
      });

      var currentStatus = await client.presence.activities;
      if(!currentStatus[0]){
        client.user.setActivity(data.status);
        console.log('\x1b[32m','Automatically set status to: ' + data.status);
      }

  }
