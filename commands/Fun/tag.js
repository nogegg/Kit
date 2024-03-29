const Discord = require("discord.js");
const tagReader = require('./../../plugins/tag.js');

exports.run = async (client, message, args, deletedMessage, sql) => {

    if (!args[0]) {
        const embed = new Discord.MessageEmbed()
            .addField("Description", client.help['tag'].help)
            .addField("Usage", '```' + client.help['tag'].format + '```')
        return message.channel.send({ embeds: [embed] });
    }

    //get all tags for appropriate server
    var tags = await sql.query(`SELECT * FROM tags WHERE serverId ='${message.guild.id}'`);

    tags = tags.rows;

    tagnames = tags.map(g => g.tagname);
    //structure {serverid:'', tagname: '', tagcontent: '', ownerid: '', selfdelete: ''}

    if (!args[0]) {
        const embed = new Discord.MessageEmbed()
            .setColor(`0x${client.colors.bad}`)
            .setTitle("This command needs at least 1 argument")
        return message.channel.send({ embeds: [embed] });
    }

    var arg = args[0].toLowerCase();

    switch (arg) {
        case 'create':
            if (!args[1]) return;
            var tagContentVar = args.slice(2).join(' ');
            var Attachment = (message.attachments).map(e => e);
            tagContentVar = tagContentVar + Attachment.map(r => r.url).join(', ');

            if (tagContentVar.length < 1) {
                const embed = new Discord.MessageEmbed()
                    .setColor(`0x${client.colors.bad}`)
                    .setTitle("Give me something to put in the tag")
                return message.channel.send({ embeds: [embed] });
            }

            var tag = await sql.query(`SELECT * FROM tags WHERE serverid ='${message.guild.id}' AND tagname = '${args[1].toLowerCase()}'`);
            if (!tag.rows[0]) {
                sql.query(`INSERT INTO tags (serverId, tagName, tagContent, ownerID, selfDelete) VALUES (${message.guild.id}, '${args[1].toLowerCase()}', '${tagContentVar}', '${message.author.id}', 'false')`);

                const embed = new Discord.MessageEmbed()
                    .setTitle(`Tag '${args[1].toLowerCase()}' created`)
                return message.channel.send({ embeds: [embed] });
            } else {
                const embed = new Discord.MessageEmbed()
                    .setColor(`0x${client.colors.bad}`)
                    .setTitle("This tag already exists")
                return message.channel.send({ embeds: [embed] });
            }
            return;
        case 'edit':
            if (!args[1]) return;
            var tag = await sql.query(`SELECT * FROM tags WHERE serverid ='${message.guild.id}' AND tagname = '${args[1].toLowerCase()}'`);
            if (!tag.rows[0]) {
                const embed = new Discord.MessageEmbed()
                    .setColor(`0x${client.colors.bad}`)
                    .setTitle("This tag doesn't exist")
                return message.channel.send({ embeds: [embed] });
            } else {
                if (tag.rows[0].ownerid !== message.author.id) {
                    const embed = new Discord.MessageEmbed()
                        .setColor(`0x${client.colors.bad}`)
                        .setTitle("This tag doesn't belong to you")
                    return message.channel.send({ embeds: [embed] });
                }
                if (args.slice(2).join(' ').length < 1) {
                    const embed = new Discord.MessageEmbed()
                        .setColor(`0x${client.colors.bad}`)
                        .setTitle("Your tag can't be empty")
                    return message.channel.send({ embeds: [embed] });
                }
                sql.query(`UPDATE tags SET tagContent = '${args.slice(2).join(' ')}' WHERE serverId ='${message.guild.id}' AND tagName = '${args[1].toLowerCase()}'`);
                const embed = new Discord.MessageEmbed()
                    .setTitle("Your tag was edited")
                return message.channel.send({ embeds: [embed] });
            }
            return;
        case 'delete':
            if (!args[1]) return;
            var tag = await sql.query(`SELECT * FROM tags WHERE serverid ='${message.guild.id}' AND tagname = '${args[1].toLowerCase()}'`);
            if (!tag.rows[0]) {
                const embed = new Discord.MessageEmbed()
                    .setColor(`0x${client.colors.bad}`)
                    .setTitle("This doesn't exist")
                return message.channel.send({ embeds: [embed] });
            } else {
                if (tag.rows[0].ownerid !== message.author.id) {
                    const embed = new Discord.MessageEmbed()
                        .setColor(`0x${client.colors.bad}`)
                        .setTitle("This tag doesn't belong to you")
                    return message.channel.send({ embeds: [embed] });
                }
                sql.query(`DELETE FROM tags WHERE serverId ='${message.guild.id}' AND tagName = '${args[1].toLowerCase()}'`);
                const embed = new Discord.MessageEmbed()
                    .setColor(`0x${client.colors.bad}`)
                    .setTitle("This tag has been deleted")
                return message.channel.send({ embeds: [embed] });
            }
            return;
        case 'search':
            if (!args[1]) return;
            var tag = await sql.query(`SELECT * FROM tags WHERE serverId = '${message.guild.id}' AND tagName LIKE '%${args[1]}%' `);

            if (!tag.rows[0]) {
                const embed = new Discord.MessageEmbed()
                    .setColor(`0x${client.colors.bad}`)
                    .setTitle("No tags were found")
                return message.channel.send({ embeds: [embed] });
            } else {
                var results = tag.rows.map(g => g.tagname);
                client.messageHandler(message, client.isInteraction, 'Results:\n```' +
                    results.join(', ')
                    + '```');
            }
            return;
        case 'random':
            if (!args[0]) return;
            var tag = await sql.query(`SELECT * FROM tags WHERE serverId ='${message.guild.id}' ORDER BY RANDOM() LIMIT 1`);
            if (!tag.rows[0]) {
                const embed = new Discord.MessageEmbed()
                    .setColor(`0x${client.colors.bad}`)
                    .setTitle("No tags were found")
                return message.channel.send({ embeds: [embed] });
            } else {
                var result = tag.rows[0].tagcontent;
                var t = tagReader.read(result, message, []);

                client.messageHandler(message, client.isInteraction, t).catch((err) => {
                    client.messageHandler(message, client.isInteraction, `There was an error loading this tag (${tag.rows[0].tagname})`)
                });
            }
            return;
        case 'list':
            var results = await sql.query(`SELECT * FROM tags WHERE serverId ='${message.guild.id}' AND ownerid = '${message.author.id}'`);
            results = results.rows;

            if (results.length < 1) {
                const embed = new Discord.MessageEmbed()
                    .setColor(`0x${client.colors.bad}`)
                    .setTitle("You don't have any tags")
                return message.channel.send({ embeds: [embed] });
            }

            function chunkArray(myArray, chunk_size) {
                var index = 0;
                var arrayLength = myArray.length;
                var tempArray = [];

                for (index = 0; index < arrayLength; index += chunk_size) {
                    myChunk = myArray.slice(index, index + chunk_size);
                    tempArray.push(myChunk);
                }

                return tempArray;
            }

            results = results.map(g => g.tagname);
            results = chunkArray(results, 30);

            var sendUser = await client.users.fetch(message.author.id);

            sendUser.send('List:').catch((err) => {
                const embed = new Discord.MessageEmbed()
                    .setColor(`0x${client.colors.bad}`)
                    .setTitle("An error occured: `" + err + "`")
                return message.channel.send({ embeds: [embed] });
            });

            var e = 0;
            while (e < results.length) {
                sendUser.send(results[e].join(', ')).catch((err) => { });
                e = e + 1;
            }
            return;
        case 'raw':
            if(!args[1]){
                const embed = new Discord.MessageEmbed()
                    .setColor(`0x${client.colors.bad}`)
                    .setTitle("There is no tag with that name")
                return message.channel.send({ embeds: [embed] });
            }

            if (tagnames.includes(args[1].toLowerCase())) {

                var results = await sql.query(`SELECT * FROM tags WHERE serverId ='${message.guild.id}' AND tagname = '${args[1]}'`);
                results = results.rows[0];

                var t = results.tagcontent;
                var buf = Buffer.from(t, 'utf8');

                const embed = new Discord.MessageEmbed()
                    .setColor(`0x${client.colors.bad}`)
                    .setDescription("```diff\n-Raw Tag Code:\n```")
                message.channel.send({ embeds: [embed] });
                message.channel.send({
                    files: [
                        {
                            attachment: buf,
                            name: 'output.txt'
                        }
                    ]
                });

            } else {
                const embed = new Discord.MessageEmbed()
                    .setColor(`0x${client.colors.bad}`)
                    .setTitle("There is no tag with that name")
                return message.channel.send({ embeds: [embed] });
            }
            return;
        default:
            if (tagnames.includes(args[0].toLowerCase())) {
                var results = await sql.query(`SELECT * FROM tags WHERE serverId ='${message.guild.id}' AND tagname = '${args[0]}'`);
                results = results.rows[0];

                var t = tagReader.read(results.tagcontent, message, args);

                if (t.length > 1500) {
                    var buf = Buffer.from(t, 'utf8');

                    const embed = new Discord.MessageEmbed()
                        .setColor(`0x${client.colors.bad}`)
                        .setDescription("```diff\n-Output too long:\n```")
                    message.channel.send({ embeds: [embed] });
                    message.channel.send({
                        files: [
                            {
                                attachment: buf,
                                name: 'output.txt'
                            }
                        ]
                    });
                } else if (t.length > 3000) {
                    const embed = new Discord.MessageEmbed()
                        .setColor(`0x${client.colors.bad}`)
                        .setDescription("```diff\n-Output is over 3,000 character\n```")
                    message.channel.send({ embeds: [embed] });
                } else if (t.length === 0) {
                    const embed = new Discord.MessageEmbed()
                        .setColor(`0x${client.colors.bad}`)
                        .setDescription("```diff\n-Output is empty\n```")
                    message.channel.send({ embeds: [embed] });
                } else {
                    client.messageHandler(message, client.isInteraction, t).catch((err) => {
                        const embed = new Discord.MessageEmbed()
                            .setColor(`0x${client.colors.bad}`)
                            .setTitle("An error occured: `" + err + "`")
                        return message.channel.send({ embeds: [embed] });
                    });
                }
            } else {
                const embed = new Discord.MessageEmbed()
                    .setColor(`0x${client.colors.bad}`)
                    .setTitle("There is no tag with that name")
                return message.channel.send({ embeds: [embed] });
            }
            return;
    }

}

exports.conf = {
    name: "Tag",
    help: "Create, destroy or edit a tag - For more information on how to structure a tag, click [here](https://github.com/2tuu/Kit/blob/master/docs/tags.md)",
    format: `k?tag [tag-name]
k?tag [create] [tag-name] [tag-contents]
k?tag [edit] [tag-name] [new-contents]
k?tag [delete] [tag-name]
k?tag [search] [search-terms]
k?tag [random]`,
    DM: false,
    ownerOnly: false,
    alias: ['t']
}