const config = require(`./../../config.json`);
const Discord = require(`discord.js`);

exports.run = (client, message, args, deletedMessage, sql) => {
  async function evalCMD() {

    function clean(text) {
      if (typeof (text) === "string")
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
      else
        return text;
    }

    if (config.evalAllow.includes(message.author.id)) {

      try {
        const code = args.join(" ");
        let evaled = eval(code);

        if (typeof evaled !== "string")
          evaled = require("util").inspect(evaled);

        var res = clean(evaled);
        res = res.replace(new RegExp(config.token_prod, 'g'), '[TOKEN]');
        res = res.replace(new RegExp(config.token_beta, 'g'), '[TOKEN]');

        res = res.replace(new RegExp(config.dbpass, 'g'), '[REDACTED]');
        res = res.replace(new RegExp(config.dbuser, 'g'), '[REDACTED]');
        res = res.replace(new RegExp(config.kitk_token, 'g'), '[REDACTED]');
        res = res.replace(new RegExp(config.youtube, 'g'), '[REDACTED]');
        
        if(`\`\`\`\n${res}\n\`\`\``.length > 2000){
          var buf = Buffer.from(res, 'utf8');

          const embed = new Discord.MessageEmbed()
          .setColor(`0x${client.colors.bad}`)
          .setDescription("```diff\n-Output too long:\n```")
          message.channel.send({ embeds: [embed] });
          message.channel.send({
            files: [
              {
                attachment: buf,
                name: 'log.txt'
              }
            ]
          });
        } else {
          client.messageHandler(message, client.isInteraction, `\`\`\`\n${res}\n\`\`\``);
        }
      } catch (err) {
        client.messageHandler(message, client.isInteraction, `\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
      }

    } else {
      const embed = new Discord.MessageEmbed()
        .setColor(`0x${client.colors.bad}`)
        .setTitle("You do not have permission to do this. (Bot Owner required)")
      client.messageHandler(message, client.isInteraction, { embeds: [embed] });
    }
  }

  evalCMD();
}

exports.conf = {
  name: "N/A (dev command)",
  help: "You can't use this",
  format: "N/A",
  DM: true,
  ownerOnly: true,
  alias: []
}