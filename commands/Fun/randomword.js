exports.run = (client, message) => {
    var v = ["a", "e", "i", "o", "u"];
    var c = ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "x", "z"];

    var words = ["vcv", "cvcv", "cvccv", "vccv", "vcvcvc"];

    var word = words[Math.floor(Math.random() * words.length)];
    var finalWord = [];

    for (var i = 0; i < word.length; i++) {
        let letter = word.charAt(i);

        if (letter === "c") {
            finalWord[i] = c[Math.floor(Math.random() * c.length)];
        } else {
            finalWord[i] = v[Math.floor(Math.random() * v.length)];
        }

    }

    finalWord = finalWord.join('');
    client.messageHandler(message, client.isInteraction, finalWord);
}

exports.conf = {
    name: "Randomword",
    help: "Generate something that's technically a word",
    format: "k?randomword",
    DM: false,
    ownerOnly: false,
    alias: ['word'],
    slashCommand: true,
    data: {
        name: "randomword",
        description: "Generate a \"word\"",
        options: [],
        dm_permission: false
    }
}