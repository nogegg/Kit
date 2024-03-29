const Discord = require(`discord.js`);
exports.run = async (client, message, args, deletedMessage, sql) => {

    if (!args[0]) {
        const embed = new Discord.MessageEmbed()
            .addField("Description", client.help['remind'].help)
            .addField("Usage", '```' + client.help['remind'].format + '```')
        return client.messageHandler(message, client.isInteraction, { embeds: [embed] });
    }

    var user = message.author.id;
    var channel = message.channel.id;

    if (args[0].toLowerCase() === 'list' && !args[1]) {
        var row = await sql.query(`SELECT * FROM timer WHERE "user" ='${user}'`);
        row = row.rows;

        if (row.length < 1) {
            const embed = new Discord.MessageEmbed()
                .setColor(`0x${client.colors.bad}`)
                .setDescription('No reminders found')
            return client.messageHandler(message, client.isInteraction, { embeds: [embed] });
        }

        var list = [];

        row.forEach(e => {
            list.push(`${e.message} - <t:${Math.round(e.endtime / 1000)}:R>`)
        });

        const embed = new Discord.MessageEmbed()
            .setDescription(list.join('\n').toString())
        return client.messageHandler(message, client.isInteraction, { embeds: [embed] });
    }

    if (args.join(' ').match(/-t (.*)/g)) {

        function getSeconds(str) {
            str = str.toLowerCase();

            var days = str.match(/(\d+)\s*d/);
            if (days) str = str.replace(days[0], '');

            var hours = str.match(/(\d+)\s*h/);
            if (hours) str = str.replace(hours[0], '');

            var minutes = str.match(/(\d+)\s*m/);
            if (minutes) str = str.replace(minutes[0], '');

            str.replace(new RegExp(' ', 'g'), '');

            if (!hours) hours = ['0h'];
            if (!minutes) minutes = ['0m'];
            if (!days) days = ['0d'];

            if (str.length > 0) {
                return null;
            } else {
                return {
                    m: minutes[0].replace('m', ''),
                    h: hours[0].replace('h', ''),
                    d: days[0].replace('d', '')
                }
            }
        }

        var num = args.join(' ').match(/-t (.*)/g)[0].replace('-t ', '');
        num = getSeconds(num.toString());
    } else {
        return client.messageHandler(message, client.isInteraction, "The time wasn't set correctly, please refer to `k?help remind` for proper format")
    }

    if (!num) {
        return client.messageHandler(message, client.isInteraction, "The time wasn't set correctly, please refer to `k?help remind` for proper format")
    } else {

        var minutes = num.m * 60000;
        var hours = num.h * 3600000;
        var days = num.d * 86400000;

        var time = minutes + hours + days;

        if (time < 59999 || time > 1209600000) {
            return client.messageHandler(message, client.isInteraction, "Please enter a time between 1 minute and 14 days");
        }

        var endtime = Date.now() + time;
        var timerMessage;

        timerMessage = args.join(' ').split('-t')[0];
        timerMessage = timerMessage.substring(0, timerMessage.length - 1);
        timerMessage = timerMessage.replace(/(')/g, "’");

        if (timerMessage.length > 200) {
            return client.messageHandler(message, client.isInteraction, "Please give me a message below 200 characters");
        }

        //sql
        var row = await sql.query(`SELECT * FROM timer WHERE "user" ='${user}'`);
        row = row.rows;

        if (row.length > 14) {
            return client.messageHandler(message, client.isInteraction, 'Sorry, you have too many reminders (Limit 15)');
        }

        if (timerMessage.length < 1) {
            timerMessage = '[No Label]';
            client.messageHandler(message, client.isInteraction, `I will remind you <t:${Math.round(endtime / 1000)}:R>`);
        } else {
            timerMessage = timerMessage.replace(/(`)/g, "’")
            client.messageHandler(message, client.isInteraction, `I will tell you: \`${timerMessage}\` <t:${Math.round(endtime / 1000)}:R>`);
        }

        sql.query(`INSERT INTO timer (endtime, "user", channelcreated, message) VALUES ('${endtime}', '${user}', '${channel}', '${timerMessage}')`);

    }
}

exports.conf = {
    name: "Remind",
    help: "Remind yourself of something in the future",
    format: "k?remind [message] -t [time]\nie. k?remind get groceries -t 1d 17h\n\nNote: Reminder may be innacurate by ~1 minute",
    DM: true,
    ownerOnly: false,
    alias: [],
    slashCommand: true,
    data: {
        name: "remind",
        description: "Set a reminder",
        options: [
            {
                choices: undefined,
                autocomplete: undefined,
                type: 3,
                name: 'arguments',
                description: 'Arguments',
                required: true
            }
        ],
        dm_permission: true
    }
}