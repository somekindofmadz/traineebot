import * as Discord from "discord.js";
import { Player } from "./interfaces";

const commands = `**Player Commands:** \n` +
`> **!j**, **!join **- joins the queue. \n` + 
`> **!l**, **!leave** - leaves the queue. \n` + 
`> **!q**, **!queue** - shows the amount of players in queue. \n` +
"> **!p**, **!pick** [*number*] - captain pick command, you pick a player by the number beside his name. `ex: 5. hellpepega` - the number will be 5. \n" +
`> **!h**, **!help** - displays all available commands \n`; 


const admincommands = `**Admin Commands: ** \n` +
`> **!ah**, **!adminhelp** - displays all available commands.  \n` + 
`> **!init** [ *random* | *captains* ] - inititates the game with mode in input.  \n` + 
`> **!start** - opens/closes the possibility of joining the queue.  \n` + 
`> **!fill **- fills the current game with the players in queue. \n` +
`> **!close** - closes the current game. \n`+
`> **!bq**, **!blockqueue** - blocks players from getting in queue. (toggle, default: false) \n`+
`> **!nqb**, **!noqueueblock** - lets you join multiple times in the queue (for test purposes mainly). (toggle, default: false) \n`+
`> **!mp**, **!maxplayers** [*player amount*] - changes the amount of players that can be joined. (value, default: 10) \n`;


// this shit is used for the race tourney/admin
const client = new Discord.Client();

//drafting
var maxPlayers = 10;
var queue: Player[] = [];
var isOpened = false;
var team1: Player[] = [];
var team2: Player[] = [];
var draft: Player[] = [];
var canPick = false;
var noQueueBlock = false;
var queueBlock = false;
var turn = true;
var playerList = '';
const draftChannel = '910208237851275344';
const adminChannel = '910208237851275344';
const organizer_role = '909563810183008296';
// 910835938622599169 - #draft-queue
// 910208237851275344 - #draft-tests

client.once('ready', () =>{
    console.log('Started');
})

client.on('message', (message) => {
    const channel = message.channel;
    const pref = '!';
    if(message.author.bot && message.embeds){
        for (let embed of message.embeds){
            if(embed.author.name === 'Draft Player List' || embed.author.name === 'Teams List'){
                playerList = message.id;
                console.log(playerList);
            }
        }
    }
    if(message.content.startsWith(pref)){
        const args = message.content.slice(pref.length).trim().split(' ');
        const command = args.shift().toLowerCase();
        switch(command){
            case 'start':
                if(!isAdmin(message)) return;
                isOpened = !isOpened;
                if(isOpened)
                client.channels.fetch(draftChannel).then(c => {
                    (c as Discord.TextChannel).send("@everyon the draft starts! You can now register by typing `!join` in "+`<#${draftChannel}> channel.`);
                }); //close/open drafts command
                message.react("👍");
                return;
            case 'close':
                if(!isAdmin(message)) return;
                queue = [];
                draft = [];
                team1 = [];
                team2 = [];
                canPick = false;
                message.react("👍");
                return;
            case 'j':
            case 'join':
                if (queue.length >= maxPlayers) {
                    message.reply(`The queue is already full.`);
                    return;
                }
                if (queueBlock) {
                    message.reply(`Queue is temporarly blocked.`);
                    return;
                }
                if(queue.includes(!noQueueBlock && queue.filter(p => p.user === message.author.username)[0]) || message.channel.id !== draftChannel){
                    message.reply(`You are already in queue.`);
                    return;
                }
                queue.push(getPlayer(message));
                message.channel.send(`${message.author.toString()} registered, ${queue.length}/${maxPlayers}`);
                if (queue.length == maxPlayers) {
                    getDrafters(queue);
                    queue = [];
                    const [c1, c2] = getCaptains(draft);
                    team1.push(c1);
                    team2.push(c2);
                    let c1name = client.users.cache.find(u => u.username === c1.user);
                    let c2name = client.users.cache.find(u => u.username === c2.user);
                    message.channel.send(`${c1name.toString()} and ${c2name.toString()} are your captains!\n` + `${c1name.toString()} gets pick first.`);
                    canPick = true;
                    console.log(c1, c2);
                    //gives some time before the list pop up cuz why not
                    setTimeout(() => {message.channel.send(createDraftEmbed(draft))}, 6000);
                }
                return;
            case 'l':
            case 'leave':
                const p = queue.filter(p => p.user === message.author.username)[0];
                if(queue.includes(p) && (message.channel.id == draftChannel || message.channel.id == adminChannel)){
                    queue.splice(queue.indexOf(p), 1);
                    message.channel.send(`${message.author.toString()} left, ${queue.length}/${maxPlayers}`);
                }
                return;
            case 'fill':
                if(!isAdmin(message)) return;
                if(queue.length < 1){
                    message.channel.send(`Queue is empty`);
                }
                client.channels.fetch(adminChannel).then(c => {(c as Discord.TextChannel).messages.fetch(playerList).then(m => {
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
                message.react("👍");
                return;
            case 'queue':
            case 'q':
                message.channel.send(`${queue.length}/${maxPlayers}`);
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
                    let c1name = client.users.cache.find(u => u.username === c1.user);
                    let c2name = client.users.cache.find(u => u.username === c2.user);
                    message.channel.send(`${c1name.toString()} and ${c2name.toString()} are your captains!\n` + `${c1name.toString()} gets pick first.`);
                    canPick = true;
                    console.log(c1, c2);
                    //gives some time before the list pop up cuz why not
                    setTimeout(() => {message.channel.send(createDraftEmbed(draft))}, 6000);
                }
                message.react("👍");
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
            case 'help':
            case 'h':
                message.channel.send(commands);
                return;
            case 'adminhelp':
            case 'ah':
                if(!isAdmin(message)) return;
                message.channel.send(admincommands);
                return;
            case 'maxplayers':
            case 'mp':
                if(!isAdmin(message)) return;
                maxPlayers = parseInt(args[0]);
                message.react("👍");
                return;
            case 'noqueueblock':
            case 'nqb':
                if(!isAdmin(message)) return;
                if (noQueueBlock) {
                    noQueueBlock = false;
                } else {
                    noQueueBlock = true;
                }
                message.react("👍");
                return;
            case 'blockqueue':
            case 'bq':
                if(!isAdmin(message)) return;
                if (queueBlock) {
                    queueBlock = false;
                } else {
                    queueBlock = true;
                }
                message.react("👍");
                return;
            default:
                return;
        }
    }
})

function getDrafters(players: Player[]){
    for(let i = 0; players.length > i; i++){
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

function sample<T>(arr: Array<T>){
    return arr[Math.floor(Math.random() * arr.length)];
}

function isAdmin(message: Discord.Message){
    return message.member.roles.cache.has(organizer_role);
}

function createTeamsEmbed(team1: Player[], team2: Player[]){
    let names1 = [];
    let names2 = [];
    let team1name = 'Team 1';
    let team2name = 'Team 2';
    for(const player1 of team1){
        if(player1.captain) team1name = `Team ${player1.user}:`;
        names1.push(player1.captain ? player1.user + ` - **Captain**` : player1.user);
    }
    for(const player2 of team2){
        if(player2.captain) team2name = `Team ${player2.user}:`;
        names2.push(player2.captain ? player2.user + ` - **Captain**` : player2.user);
    }
    const list = new Discord.MessageEmbed()
    .setAuthor('Teams List:')
    .setColor('#6464CC')
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
    .setAuthor('Draft Player List')
    .setColor('#6464CC')
    .setDescription('Remaining Players:')
    .setTimestamp()
    for(const player of players){
        if(!player.captain)
        list.addField(`\u200B`, `${player.id}.${player.user}`);
    }
    return list;
}

client.login('ODQ2MzI5NTYxNjYyMjI2NDc0.YKt70w.NI-KuuWqW4j_zY8PFBpbgpF8F6Y');