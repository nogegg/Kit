//tag.read(taggerContent,message,args);

/*
K-Tag v1.3
Avery W. 2018 (Github: 2tuu)
Last revision: 3/24/2022

Changelog:
    - Added more-than and less-than statements
*/

exports.read = (taggerContent, message, args) => {
    //{set;;}; and {var.*};
    var variables = {}; //Object for variable saving

    var setAr = taggerContent.match(/{set;(.*?)};/g);   
    if(setAr){
        var g = 0;
        setAr.forEach(a => {
            var array = setAr[g].replace('{set;', '').replace('};', '');
            taggerContent = taggerContent.replace(new RegExp(setAr[g], 'g'), '');
            array = array.split(';');
            if(array && array[1]){
                variables[array[0]] = array[1];
            }
        });
    }


    for (var key in variables) {
        taggerContent = taggerContent.replace(new RegExp("{var." + key + "};", 'g'), variables[key]);
    }


    //mention removers
    taggerContent = taggerContent.replace(new RegExp("@everyone", 'g'), 'everyone');
    taggerContent = taggerContent.replace(new RegExp("@here", 'g'), 'here');


    //{time.*}
    var d = new Date();
    var time = {
        hour: d.getHours(),
        minute: d.getMinutes(),
        year: d.getFullYear(),
        day: d.getDay()
    };

    for (var key in time) {
        taggerContent = taggerContent.replace(new RegExp("{time." + key + "}", 'g'), time[key]);
    }


    //{caller.*}
    var caller = message.author;
    delete caller.lastMessage;
        caller.discrim = caller.discriminator;
        caller.uname = caller.username;

    for (var key in caller) {
        taggerContent = taggerContent.replace(new RegExp("{caller." + key + "}", 'g'), caller[key]);
    }



    //{message.*.*}
    for (var key in message) {
        var secKey = key;
        for(var key in secKey){
            taggerContent = taggerContent.replace(new RegExp("{message." + `${secKey}.${key}` + "}", 'g'), secKey[key]);
        }
        taggerContent = taggerContent.replace(new RegExp("{message." + key + "}", 'g'), message[key]);
    }


    //{channel.*}
    var chan = message.channel;
    delete chan.lastMessage;
    delete chan.permissionOverwrites;

    for (var key in chan) {
        taggerContent = taggerContent.replace(new RegExp("{channel." + key + "}", 'g'), chan[key]);
    }


    //{guild.*}
    var guild = message.guild;

    //remove objects that can't be used/shouldn't be accessed
    delete guild.features;
    delete guild.applicationID;
    delete guild.systemChannelID;
    delete guild._rawVoiceStates;
    delete guild.emojis;

    for (var key in guild) {
        taggerContent = taggerContent.replace(new RegExp("{guild." + key + "}", 'g'), guild[key]);
    }


    //{num;*}
    var argAr = taggerContent.match(/{num;(.*?)}/g);
    if(argAr){
        var g = 0;
        argAr.forEach(a => {
            var array = argAr[g].replace('{num;', '').replace('}', '');
            array = array.split(';');
            if(array){
                if(array[1]){
                    taggerContent = taggerContent.replace(new RegExp(argAr[g]),  parseInt(array[0]) + Math.floor(Math.random()*(parseInt(array[0]) - parseInt(array[1]))));
                } else {
                    taggerContent = taggerContent.replace(new RegExp(argAr[g]), Math.floor(Math.random()*parseInt(array[0])));
                }
            }
        });
    }


    //misc (newline, tag, space, arguments)
    taggerContent = taggerContent.replace(new RegExp("{n}", 'g'), "\n");
    taggerContent = taggerContent.replace(new RegExp("{t}", 'g'), "\t");
    taggerContent = taggerContent.replace(new RegExp("{space}", 'g'), " ");
    taggerContent = taggerContent.replace(new RegExp("{args}", 'g'), args.slice(1).join(' '));

    var i = 0;


    //arguments {arg#}
    args.forEach(a => {
        taggerContent = taggerContent.replace(new RegExp("{arg" + i + "}", 'g'), args[i]);
        i = i+1;
    });


    //c-arguments {carg#}
    var f = 1;
    while(f < 1000){
        var argF;

        if(!args[f]){
            argF = message.author.username;
        } else {
            argF = args[f];
        }

        taggerContent = taggerContent.replace(new RegExp("{carg" + f + "}", 'g'), argF);
        f = f + 1;
    }



    //{choose;*}
    var argAr = taggerContent.match(/{choose;(.*?)}/g);
    if(argAr){
        var g = 0;
        argAr.forEach(a => {
            var array = argAr[g].replace('{choose;', '').replace('}', '');
            array = array.split(';');
            taggerContent = taggerContent.replace(new RegExp(argAr[g]), array[Math.floor(Math.random() * array.length)]);
        });
    }



    //{repeat;*;}
    var repAr = taggerContent.match(/{repeat;(.*?)}/g);
    if(repAr){
        var g = 0;
        repAr.forEach(a => {
            var array = repAr[g].replace('{repeat;', '').replace('}', '');
            var split = array.split(';');
            if(split){
                if(isNaN(split[0])){
                    taggerContent = taggerContent.replace(new RegExp(repAr[g], 'g'), '<[0] is NaN>');
                } else {
                    if(split[1]){
                        taggerContent = taggerContent.replace(new RegExp(repAr[g], 'g'), split[1].repeat(parseInt(split[0])));
                    } else {
                        taggerContent = taggerContent.replace(new RegExp(repAr[g], 'g'), '<No replace arg>');
                    }
                }
            }
        });
    }


    //if statements

    //equals ==
    var ifEqualsVar = taggerContent.match(/{if;(.*?)==(.*?);(.*?)};/g);
    if(ifEqualsVar && ifEqualsVar[0]){
        ifEqualsVar.forEach(e=>{
            var logic = e.match(/{if;(.*?);/); //{if;a=b;
            var toEval = e.replace(logic[0], '') //<eval>};

            if(toEval[0] && logic[0]){
                logic = logic[0].replace('{if;','').slice(0,-1).split('=='); // ['a','b']
                toEval = toEval.slice(0,-2); //<eval>

                if(logic[0] == logic[1]){
                    taggerContent = taggerContent.replace(e,toEval);
                } else {
                    taggerContent = taggerContent.replace(e,'');
                }
            }
        })
    }

    //does not equal =!
    ifEqualsVar = taggerContent.match(/{if;(.*?)=!(.*?);(.*?)};/g);
    if(ifEqualsVar && ifEqualsVar[0]){
        ifEqualsVar.forEach(e=>{
            var logic = e.match(/{if;(.*?);/); //{if;a=b;
            var toEval = e.replace(logic[0], '') //<eval>};

            if(toEval[0] && logic[0]){
                logic = logic[0].replace('{if;','').slice(0,-1).split('=!'); // ['a','b']
                toEval = toEval.slice(0,-2); //<eval>

                if(logic[0] !== logic[1]){
                    taggerContent = taggerContent.replace(e,toEval);
                } else {
                    taggerContent = taggerContent.replace(e,'');
                }
            }
        })
    }

    //less than <
    ifEqualsVar = taggerContent.match(/{if;(.*?)=!(.*?);(.*?)};/g);
    if(ifEqualsVar && ifEqualsVar[0]){
        ifEqualsVar.forEach(e=>{
            var logic = e.match(/{if;(.*?);/); //{if;a<b;
            var toEval = e.replace(logic[0], '') //<eval>};

            if(toEval[0] && logic[0]){
                logic = logic[0].replace('{if;','').slice(0,-1).split('<'); // ['a','b']
                toEval = toEval.slice(0,-2); //<eval>

                if(logic[0] < logic[1]){
                    taggerContent = taggerContent.replace(e,toEval);
                } else {
                    taggerContent = taggerContent.replace(e,'');
                }
            }
        })
    }

    //more than >
    ifEqualsVar = taggerContent.match(/{if;(.*?)=!(.*?);(.*?)};/g);
    if(ifEqualsVar && ifEqualsVar[0]){
        ifEqualsVar.forEach(e=>{
            var logic = e.match(/{if;(.*?);/); //{if;a>b;
            var toEval = e.replace(logic[0], '') //<eval>};

            if(toEval[0] && logic[0]){
                logic = logic[0].replace('{if;','').slice(0,-1).split('>'); // ['a','b']
                toEval = toEval.slice(0,-2); //<eval>

                if(logic[0] > logic[1]){
                    taggerContent = taggerContent.replace(e,toEval);
                } else {
                    taggerContent = taggerContent.replace(e,'');
                }
            }
        })
    }

    return taggerContent.replace(new RegExp('@everyone', 'g'), '[REMOVED]');
}