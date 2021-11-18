import * as Discord from "discord.js";
import * as fs from 'fs';
import { clearInterval } from "timers";
import { Map, Player, Team, User } from "./interfaces";

// this shit is used for the race tourney/admin
const client = new Discord.Client();
const channelID = '870404179980591205';
const admins = ['297634729342009354', '404387695205548065', '870043075819487233'];
var listID = '';
var maxPlayers = 14;
var tags = [];
var embedFound = false;
var registered = [];

const list = new Discord.MessageEmbed()
    .setAuthor('Турнир будет проводиться в N-noe время на N-nom режиме')
    .setColor('#6464CC')
    .setTitle('Карта')
    .setDescription('Список участников:')
    .setTimestamp()
    .setFooter('Регистрация доступна до 4252');

//wordsgame/suttonmode
var words = [];
var suttonmode = false;
var wordsmode = false;

//credit system
var timeout = [];
var creditSystem = false;

//drafting
var queue: Player[] = [];
var isOpened = false;
var team1: Player[] = [];
var team2: Player[] = [];
var draft: Player[] = [];
var canPick = false;
var turn = true;
var playerList = '';
const draftChannel = '910208237851275344';

client.once('ready', () =>{
    console.log('Started');
    //const channel = client.channels.cache.get(channelID);
    //(channel as Discord.TextChannel).send(createEmbed('Spin Race', 'среду', '17:00', '15:00'));
})

client.on('message', (message) => {
    //if(message.channel.id !== channelID) return;
    //const channel = client.channels.cache.get(channelID);
    const channel = message.channel;
    if(message.author.bot && message.embeds){
        for (let embed of message.embeds){
            if(embed.author.name === 'Player List' || embed.author.name === 'Teams List'){
                playerList = message.id;
                console.log(playerList);
            }
        }
    }
    if(wordsmode && !message.author.bot){
        words.includes(message.content) ? (channel as Discord.TextChannel).send(`Слово было`) : (words.push(message.content));
    }
    if(message.author.username === `Sutton` && suttonmode){
        const json = fs.readFileSync('./users.json').toString();
        const obj = JSON.parse(json);
        var lvl = 1;
        for(let i = 0; i < obj.length; i++){
            if(obj[i].name === `Sutton`){
                obj[i].lvl+= 1;
                lvl = obj[i].lvl;
                fs.writeFileSync('users.json', JSON.stringify(obj));
                break;
            }
        }
        (channel as Discord.TextChannel).send(`Поздравляю ` + message.author.toString() + `, ты достиг ${lvl} уровня! :4373crashbandicootthumbsup:`);
    }
    if(isInSystem(message.author) && creditSystem){
        if(timeout.includes(message.author)) return;
        if(message.content.toLowerCase().includes(`srg`) || message.content.toLowerCase().includes(`surge`)){
            if(message.content.toLowerCase().includes(`good`) || message.content.toLowerCase().includes(`amazing`) || message.content.toLowerCase().includes(`cool`) || message.content.toLowerCase().includes(`best`) || (message.content.toLowerCase().includes(`like`) && !message.content.toLowerCase().includes(`don`)) || (message.content.toLowerCase().includes(`love`) && !message.content.toLowerCase().includes(`don`)) || message.content.toLowerCase().includes(`great`) || message.content.toLowerCase().includes(`strong`)){
                addPoints(message.author.username, 15, message);
                message.reply(`Wow! Amazing words! Add 15 SRG credits :thumbsup:`);
            }
            if(message.content.toLowerCase().includes(`fuck`) || message.content.toLowerCase().includes(`cringe`)){
                addPoints(message.author.username, -15, message);
                message.reply(`You talk bullshit, must be cheating, you lose 15 SRG credits :thumbsdown:`);
            }
            timeout.push(message.author);
            setTimeout(() => timeout.splice(timeout.indexOf(message.author), 1), 60000);
        }
        if(message.content.toLowerCase().includes(`139`) || message.content.toLowerCase().includes(`vrt`) || message.content.toLowerCase().includes(`element`) || message.content.toLowerCase().includes(`ocean`) || message.content.toLowerCase().includes(`elmt`) || message.content.toLowerCase().includes(`ex0`) || message.content.toLowerCase().includes(`exo`)){
            if(message.content.toLowerCase().includes(`better`) || message.content.toLowerCase().includes(`best`)){
                addPoints(message.author.username, -15, message);
                message.reply(`You talk bullshit, must be cheating, you lose 15 SRG credits :thumbsdown:`);
            }
            if(message.content.toLowerCase().includes(`fuck`) || message.content.toLowerCase().includes(`cringe`)){
                addPoints(message.author.username, 15, message);
                message.reply(`Wow! Amazing words! Add 15 SRG credits :thumbsup:`);
            }
            timeout.push(message.author);
            setTimeout(() => timeout.splice(timeout.indexOf(message.author), 1), 60000);
        }
    }
/*    if(message.channel.id === '870676617947676753'){
        if(message.content.toLowerCase().includes('lose') && !message.author.bot){
            message.guild.roles.fetch('870650868419166228').then(r => {r.members.map(m => addPoints(m.nickname, -200, message))});
            client.channels.fetch('870676617947676753').then(c => (c as Discord.TextChannel).send(`@SRG Oh my, you lose at scrim! Disgrace! -200 SRG credits`));
        }
        if(message.content.toLowerCase().includes('win') && !message.author.bot){
            message.guild.roles.fetch('870650868419166228').then(r => {r.members.map(m => addPoints(m.nickname, 200, message))});
            client.channels.fetch('870676617947676753').then(c => (c as Discord.TextChannel).send(`@SRG Big win! Strike! Add 200 SRG credits`));
        }
      }*/
    const pref = '/';
    if(message.content.startsWith(pref)){
        const args = message.content.slice(pref.length).trim().split(' ');
        const command = args.shift().toLowerCase();
        switch(command){
            case 'ping':
                const ping = Date.now() - message.createdTimestamp;
                message.channel.send(`Понг! ${ping}ms`);
                return;
            case 'reg':
                if(registered.includes(message.author.id) || registered.length >= maxPlayers) return;
                const name = args[0];
                message.channel.send(`${name} зарегистрирован на турнир`);
                registered.push(message.author.id);
                tags.push(message.author.toString());
                (channel as Discord.TextChannel).messages.fetch(listID)
                .then(message => {
                    const embed = message.embeds[0];
                    embed.addField(name, `Участник`);
                    message.edit(embed);
                })
                return;
            case 'edit':
                if(!isAdmin(message)) return;
                const id = args[0];
                const value = args[1];
                (channel as Discord.TextChannel).messages.fetch(listID)
                .then(message => {
                    const embed = message.embeds[0];
                    embed.fields.find(f => f.name === id).value = value;
                    message.edit(embed);
                })
                return;
            case 'rename':
                if(!isAdmin(message)) return;
                const n = args[0];
                const nn = args[1];
                (channel as Discord.TextChannel).messages.fetch(listID)
                .then(message => {
                    const embed = message.embeds[0];
                    embed.fields.find(f => f.name === n).name = nn;
                    message.edit(embed);
                })
                return;
            case 'nextmap':
                if(!isAdmin(message)) return;
                embedFound = false;
                const map = `${args[0]} ` + args[1];
                const day = args[2];
                const time = args[3];
                const expires = args[4];
                (channel as Discord.TextChannel).send(createEmbed(map, day, time, expires));
                registered = [];
                return; 
            case 'extend':
                if(!isAdmin(message)) return;
                maxPlayers+= parseInt(args[0]);
                (channel as Discord.TextChannel).send('Допустимое количество участников повышено');
                console.log(`extended to ${maxPlayers}`);
                return;
            case 'whoami':
                (channel as Discord.TextChannel).send(isAdmin(message) ? 'admin' : 'user');
                return;
            case 'remind':
                if(!isAdmin(message)) return;
                const msg = tags.join(' ');
                (channel as Discord.TextChannel).send(msg + ` скоро начало турнира`);
                return;
            case 'addadmin':
                if(!isAdmin(message)) return;
                admins.push(args[0]);
                return;
            case 'lvlup':
                if(!isAdmin(message)) return;
                const user = client.users.cache.find(u => u.username === args[0]);
                let found = false;
                let lvl = 1;
                const json = fs.readFileSync('./users.json').toString();
                const obj = JSON.parse(json);
                for(let i = 0; i < obj.length; i++){
                    if(obj[i].name === user.username){
                        obj[i].lvl+= 1;
                        lvl = obj[i].lvl;
                        fs.writeFileSync('users.json', JSON.stringify(obj));
                        found = true;
                        break;
                    }
                }
                if(!found){
                    const data = {
                        name: user.username,
                        lvl: 1
                    }
                    obj.push(data);
                    fs.writeFileSync('users.json', JSON.stringify(obj));
                }
                (channel as Discord.TextChannel).send(`Поздравляю ` + user.toString() + `, ты достиг ${lvl} уровня! :4373crashbandicootthumbsup:`);
                return;
            case 'writescrim':
                    if(!isAdmin(message)) return;
                    const maps: Map[] = [{
                        name: args[2],
                        count: args[3]
                    }];
                    typeof args[4] !== undefined ? maps.push({name: args[4], count: args[5]}) : null;
                    typeof args[6] !== undefined ? maps.push({name: args[6], count: args[7]}) : null;
                    writeScrim(args[0], args[1], maps);
                    return;
            case 'scrims':
                    const scrims = getScrims(args[0]);
                    const messages = getScrimMessages(scrims);
                    for(const message of messages){ 
                        (channel as Discord.TextChannel).send(message);
                    }
                    return;
            case 'suttonmode':
                    if(!isAdmin(message)) return;
                    suttonmode = !suttonmode;
                    (channel as Discord.TextChannel).send(`Suttonmode ${suttonmode ? `enabled` : `disabled`}`);
                    return;
            case 'addteam':
                    if(!isAdmin(message)) return;
                    addTeam(args[0], parseInt(args[1]));
                    (channel as Discord.TextChannel).send(`Команда добавлена`);
                    return;
            case 'getscrim':
                    if(!isAdmin(message)) return;
                    (channel as Discord.TextChannel).send(getRandomTeam(parseInt(args[0]), args[1]));
                    return;
            case 'teamlist':
                    (channel as Discord.TextChannel).send(getTeamList());
                    return;
            case 'changetier':
                if(!isAdmin(message)) return;
                changeTeamTier(args[0], parseInt(args[1]));
                (channel as Discord.TextChannel).send(`Тир изменён`);
                return;
            case 'troopic':
                if(!isAdmin(message)) return;
                var count = 139;
                var lastmsg;
                var interval = setInterval(troopic, 1000);
                function troopic(){
                    (channel as Discord.TextChannel).send(`${count} - 7`);
                    count-=7;
                    lastmsg = channel.lastMessageID;
                    //channel.messages.cache.get(lastmsg).delete({timeout:2000});
                    if(count < 0){
                        clearInterval(interval);
                    }
                }
                return;
            case 'join':
                let founded = false;
                const json1 = fs.readFileSync('./users.json').toString();
                const obj1 = JSON.parse(json1);
                for(let i = 0; i < obj1.length; i++){
                    if(obj1[i].name === message.author.username){
                        founded = true;
                        return;
                    }
                }
                if(!founded){
                    const data = {
                        id: message.author.id,
                        name: message.author.username,
                        points: 100
                    }
                    obj1.push(data);
                    fs.writeFileSync('users.json', JSON.stringify(obj1));
                    //message.member.setNickname(`[${data.points}]${message.author.username}`);
                    message.guild.members.fetch(message.author.id).then(m => {
                        m.setNickname(`[${data.points}]${message.author.username}`)
                    });
                    message.reply(`Welcome to SRG social credit system`);
                }
                return;
            case 'add':
                if(!isAdmin(message)) return;
                addPoints(args[0], parseInt(args[1]), message);
                message.reply(`Succesfully add ${args[1]} SRG social points to ${args[0]}`);
                return;
            case 'wordsmode':
                wordsmode = !wordsmode;
                words = [];
                (channel as Discord.TextChannel).send(`Игра началась`);
                return;
            case 'credits':
                if(!isAdmin(message)) return;
                creditSystem = !creditSystem;
                return;
            case 'start':
                if(!isAdmin(message)) return;
                isOpened = !isOpened;
                if(isOpened)
                client.channels.fetch('910208237851275344').then(c => {
                    (c as Discord.TextChannel).send(`@everyon the draft starts! You can now register by typing /register in channel`);
                }); //close/open drafts command
                return;
            case 'j':
            case 'join':
                //if(queue.includes(queue.filter(p => p.user === message.author.username)[0]) || queue.length >= 10 || message.channel.id !== '910208237851275344'){
               //     message.reply(`You are already in a queue`);
                //    return;
               // }
                queue.push(getPlayer(message));
                message.channel.send(`${message.author.toString()} registered, ${queue.length}/10`);
                return;
            case 'l':
            case 'leave':
                const p = queue.filter(p => p.user === message.author.username)[0];
                if(queue.includes(p) && message.channel.id == '910208237851275344'){
                    queue.splice(queue.indexOf(p), 1);
                    message.channel.send(`${message.author.toString()} left, ${queue.length}/10`);
                }
                return;
            case 'fill':
                if(!isAdmin(message)) return;
                if(queue.length < 1){
                    message.channel.send(`Queue is empty`);
                }
                client.channels.fetch(draftChannel).then(c => {(c as Discord.TextChannel).messages.fetch(playerList).then(m => {
                    const embed = m.embeds[0];
                    if(embed.author.name == 'Player List'){
                        for(const player of queue){
                            player.id = draft.length + 1;
                            embed.addField(`\u200B`, `${player.id}.${player.user}`);
                            draft.push(player);
                        }
                        queue = [];
                    } else if(embed.author.name == 'Teams List'){
                        for(let i = 0; queue.length > 0; i++){
                            if(team1.length <= team2.length){
                                team1.push(getScrimmer(queue));
                            }
                            if(team2.length <= team1.length && queue.length > 0){
                                team2.push(getScrimmer(queue));
                            }
                        }
                        let names1 = [];
                        let names2 = [];
                        for(const player1 of team1){
                            names1.push(player1.user);
                        }
                        for(const player2 of team2){
                            names2.push(player2.user);
                        }
                        team1 = [];
                        team2 = [];
                        console.log(names1);
                        for(let i = 0; i < names1.length; i++){
                            embed.fields[0].value = embed.fields[0].value + `\n ${names1[i]}`;
                        }
                        for(let i = 0; i < names1.length; i++){
                            embed.fields[2].value = embed.fields[2].value + `\n ${names2[i]}`;
                        }
                    }
                    m.edit(embed);
                })})

                return;
            case 'queue':
                message.channel.send(`${queue.length}/10`);
                return;
            case 'init':
                if(!isAdmin(message)) return;
                if(args[0] === 'random'){
                    console.log(queue);
                    //gets 2 equal commands by randomizing players into them 
                    for(let i = 0; queue.length > 0; i++){
                        if(team1.length <= team2.length){
                            team1.push(getScrimmer(queue));
                        }
                        if(team2.length <= team1.length && queue.length > 0){
                            team2.push(getScrimmer(queue));
                        }
                    }
                    console.log(team1, team2);
                    message.channel.send(createTeamsEmbed(team1, team2));
                    team1 = [];
                    team2 = [];
                }
                if(args[0] === 'captains'){
                    getDrafters(queue);
                    queue = [];
                    const [c1, c2] = getCaptains(draft);
                    team1.push(c1);
                    team2.push(c2);
                    message.channel.send(`${c1.user} and ${c2.user} are the captains`);
                    canPick = true;
                    console.log(c1, c2);
                    //gives some time before the list pop up cuz why not
                    setTimeout(() => {message.channel.send(createDraftEmbed(draft))}, 6000);
                }
                return;
            case 'close':
                if(!isAdmin(message)) return;
                queue = [];
                draft = [];
                team1 = [];
                team2 = [];
                canPick = false;
                return;
            case 'pick':
            case 'p':
                if(!canPick) return;
                const playerID = parseInt(args[0]);
                console.log(playerID);
                if(isNaN(playerID)){
                    message.channel.send(`Invalid input, pick by a number`);
                    return;
                }
                const player = draft.indexOf(draft.filter(p => p.id === playerID)[0]) + 1;
                const pl = draft.filter(p => p.id === playerID)[0];
                console.log(player);
                console.log(!draft.includes(draft.filter(p => p.id === playerID)[0]));
                if(player == -1 || !draft.includes(pl)){
                    message.channel.send(`No such user in draft`);
                    return;
                }
                const pick = client.users.cache.find(u => u.username === draft[player-1].user);
                //const player = draft.indexOf(draft.filter(p => p.user === pick.username)[0]);
                //checks if the user is a captain and it's theirs turn to pick
                if(team1.includes(team1.filter(p => (p.user === message.author.username) && p.captain)[0])){
                    if(turn){
                        team1.push(draft[player-1]);
                        message.channel.send(`${message.author.toString()} picked ${pick.toString()}`);
                    } else {
                        message.channel.send(`Not your turn`);
                        return;
                    }
                }else if(team2.includes(team2.filter(p => (p.user === message.author.username) && p.captain)[0])){
                    if(!turn){
                        team2.push(draft[player-1]);
                        message.channel.send(`${message.author.toString()} picked ${pick.toString()}`);
                    } else {
                        message.channel.send(`Not your turn`);
                        return;
                    }
                } else {
                    message.channel.send(`You are not the captain`);
                    return;
                }
                //removes picked player from the list
                client.channels.fetch(draftChannel).then(c => {(c as Discord.TextChannel).messages.fetch(playerList).then(m => {
                    const embed = m.embeds[0];
                    const field = embed.fields.filter(f => f.value === `${playerID}.${pick.username}`);
                    embed.fields.splice(embed.fields.indexOf(field[0]), 1);
                    m.edit(embed);
                })})
                console.log(`team 1` + `${JSON.stringify(team1)}`);
                console.log(`team 2` + `${JSON.stringify(team2)}`);
                console.log(draft[player-1]);
                draft.splice(player-1, 1);
                console.log(draft);
                //changes turn
                turn = !turn;
                console.log(turn);

                if(draft.length === 0){
                    canPick = false;
                    message.channel.send(createTeamsEmbed(team1, team2));
                    team1 = [];
                    team2 = [];
                }
                return;
            default:
                return;
        }
    }
})

function getDrafters(players: Player[]){
    for(let i = 0; players.length > i; i++){
        console.log(`pushed ${i}`);
        players[i].id = i + 1;
        draft.push(players[i]);
    }
}

function getCaptains(players: Player[]){
    return [getScrimmer(players, true), getScrimmer(players, true)];
}

function getScrimmer(players: Player[], captain?: boolean){
    const player = sample(players);
    if(captain){
        draft.splice(draft.indexOf(player), 1);
        player.captain = true;
        console.log(`captain is still here ` + draft.includes(player));
    } else {
        queue.splice(queue.indexOf(player), 1);
    }
    return player;
}

function getPlayer(message: Discord.Message){
    var player: Player = {
        user: message.author.username
    }
    return player;
}

function addPoints(name: string, points: number, message: Discord.Message){
    const user = client.users.cache.find(u => u.username === name);
    const json = fs.readFileSync('./users.json').toString();
    const obj = JSON.parse(json);
    for(let i = 0; i < obj.length; i++){
        if(obj[i].id === user.id){
            obj[i].points+= points;
            message.guild.members.cache.get(user.id).setNickname(`[${obj[i].points}]${user.username}`).catch(err => console.log(err));
            fs.writeFileSync('users.json', JSON.stringify(obj));
            //message.member.setNickname(`[${obj[i].points}]${message.author.username}`);
            
            break;
        }
    }
}

function isInSystem(user: Discord.User){
    const json = fs.readFileSync('./users.json').toString();
    const obj = JSON.parse(json);
    for(let i = 0; i < obj.length; i++){
        if(obj[i].id === user.id){
            return true;
        }
    }
}

function changeTeamTier(name: string, tier: number){
    const json = fs.readFileSync('./teams.json').toString();
    const obj = JSON.parse(json) as Array<any>;
    const team = obj.find(t => t.name === name);
    obj[obj.indexOf(team)].tier = tier;
    fs.writeFileSync('teams.json', JSON.stringify(obj));
}

function getTeamList(){
    const json = fs.readFileSync('./teams.json').toString();
    const obj = JSON.parse(json);
    var text = '';
    for(const team of obj){
        if(team.tier === 1)
        text = text + `**${team.name}** *-* **${team.tier}**\n` + `\n`;
    }
    for(const team of obj){
        if(team.tier === 2)
        text = text + `**${team.name}** *-* **${team.tier}**\n` + `\n`;
    }
    for(const team of obj){
        if(team.tier === 3)
        text = text + `**${team.name}** *-* **${team.tier}**\n` + `\n`;
    }
    return text;
}

function sample<T>(arr: Array<T>){
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomTeam(tier?: number, randomMode?: string){
    const json = fs.readFileSync('./teams.json').toString();
    const obj = JSON.parse(json);
    const modes = ["Team Elim", "Regicide", "Domination"];
    var team = "SRG";
    var mode = 'Team Elim';
    while(team === "SRG"){
    const [t1, t2, t3] = getArrays(obj);
    if(tier){
        switch(tier){
            case 3:
                team = sample(t3).name;
                break;
            case 2:
                team = sample(t2).name;
                break;
            case 1:
                team = sample(t1).name;
                break;
        }
    } else {
        team = sample(sample([t1, t2, t3])).name;
    }
    }
    if(randomMode && randomMode === "true"){
        mode = sample(modes);
    }
    return `SRG vs ${team} 5v5 ${mode}`;
}

function addTeam(name: string, tier: number){
    const json = fs.readFileSync('./teams.json').toString();
    const obj = JSON.parse(json);
    const data = {
        name: name,
        tier: tier,
    }
    obj.push(data);
    fs.writeFileSync('teams.json', JSON.stringify(obj));
}

function getArrays(teams: Team[]){
    var t1: Team[] = [];
    var t2: Team[] = [];
    var t3: Team[] = [];
    for(const team of teams){
        switch(team.tier){
            case 3:
                t3.push(team);
                break;
            case 2:
                t2.push(team);
                break;
            case 1:
                t1.push(team);
                break;   
        }
    }
    return [t1, t2, t3];
}

function getScrimMessages(scrims: any[]){
    let messages = [] as string[];
    for(const scrim of scrims){
        messages.push(`${scrim.name} vs SRG\n` +
        `\n` +
        `Результат: ${scrim.result}\n` +
        `\n` +
        `Карты:\n` +
        `${getMaps(scrim.maps)}`);
    }
    return messages;
}

function getMaps(maps: Map[]){
    var text = '';
    for(const map of maps){
        text = text + 
        `\n` +
        `${map.name} - ${map.count}\n`
    }
    return text;
}

function getScrims(name: string){
    var scrims = [];
    const json = fs.readFileSync('./scrims.json').toString();
    const obj = JSON.parse(json);
    for(let i = 0; i < obj.length; i++){
        if(obj[i].name === name){
            scrims.push(obj[i]);
        }
    }
    return scrims;
}

function writeScrim(name: string, result: string, maps: Map[]){
    const json = fs.readFileSync('./scrims.json').toString();
    const obj = JSON.parse(json);
    const data = {
        name: name,
        result: result,
        maps: maps
    }
    obj.push(data);
    fs.writeFileSync('scrims.json', JSON.stringify(obj));
}

function isAdmin(message: Discord.Message){
    return message.member.roles.cache.has('909563810183008296');
}

function createTeamsEmbed(team1: Player[], team2: Player[]){
    let names1 = [];
    let names2 = [];
    let team1name = 'TEAM 1';
    let team2name = 'TEAM 2';
    for(const player1 of team1){
        if(player1.captain) team1name = `${player1.user}'s team`;
        names1.push(player1.captain ? player1.user + `(captain)` : player1.user);
    }
    for(const player2 of team2){
        if(player2.captain) team2name = `${player2.user}'s team`;
        names2.push(player2.captain ? player2.user + `(captain)` : player2.user);
    }
    const list = new Discord.MessageEmbed()
    .setAuthor('Teams List')
    .setColor('#6464CC')
    .setDescription('Players:')
    .setTimestamp()
    .addFields(
        { name: team1name, value: names1},
        { name: '\u200B', value: '\u200B' },
        { name: team2name, value: names2, inline: true },
        { name: '\u200B', value: '\u200B' }
    )
    return list;
}

function createDraftEmbed(players: Player[]){
    const list = new Discord.MessageEmbed()
    .setAuthor('Player List')
    .setColor('#6464CC')
    .setDescription('REMAINING SCRIMMERS:')
    .setTimestamp()
    for(const player of players){
        if(!player.captain)
        list.addField(`\u200B`, `${player.id}.${player.user}`);
    }
    return list;
}

function createEmbed(map: string, day: string, time: string | number, expires: string | number){
    const list = new Discord.MessageEmbed()
    .setAuthor(`Турнир будет проводиться в ${day} ${time} по МСК`)
    .setColor('#6464CC')
    .setTitle(`Карта ${map}`)
    .setDescription('Список участников:')
    .addField('Madz', `Организатор`)
    .addField('Septim', `Организатор`)
    .setTimestamp()
    .setFooter(`Регистрация доступна до ${expires} по МСК`);
    return list;
}

client.login('ODQ2MzI5NTYxNjYyMjI2NDc0.YKt70w.NI-KuuWqW4j_zY8PFBpbgpF8F6Y');