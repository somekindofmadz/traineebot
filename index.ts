import * as Discord from "discord.js";
import * as fs from 'fs';
import { clearInterval } from "timers";
import { Map, Team, User } from "./interfaces";


const client = new Discord.Client();
const channelID = '870404179980591205';
const admins = ['297634729342009354', '404387695205548065', '870043075819487233'];
var maxPlayers = 14;
var wordsmode = false;
var words = [];
var listID = '';
var embedFound = false;
var registered = [];
var tags = [];
var timeout = [];
var suttonmode = false;
const list = new Discord.MessageEmbed()
    .setAuthor('Турнир будет проводиться в N-noe время на N-nom режиме')
    .setColor('#6464CC')
    .setTitle('Карта')
    .setDescription('Список участников:')
    .setTimestamp()
    .setFooter('Регистрация доступна до 4252');

client.once('ready', () =>{
    console.log('Started');
    //const channel = client.channels.cache.get(channelID);
    //(channel as Discord.TextChannel).send(createEmbed('Spin Race', 'среду', '17:00', '15:00'));
})

client.on('message', (message) => {
    //if(message.channel.id !== channelID) return;
    //const channel = client.channels.cache.get(channelID);
    const channel = message.channel;
    if(message.author.bot && message.embeds && !embedFound){
        for (let embed of message.embeds){
            if(embed.color === list.color){
                listID = message.id;
                embedFound = true;
                console.log(listID);
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
    if(isInSystem(message.author)){
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
                if(!isAdmin(message.author.id)) return;
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
                if(!isAdmin(message.author.id)) return;
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
                if(!isAdmin(message.author.id)) return;
                embedFound = false;
                const map = `${args[0]} ` + args[1];
                const day = args[2];
                const time = args[3];
                const expires = args[4];
                (channel as Discord.TextChannel).send(createEmbed(map, day, time, expires));
                registered = [];
                return; 
            case 'extend':
                if(!isAdmin(message.author.id)) return;
                maxPlayers+= parseInt(args[0]);
                (channel as Discord.TextChannel).send('Допустимое количество участников повышено');
                console.log(`extended to ${maxPlayers}`);
                return;
            case 'whoami':
                (channel as Discord.TextChannel).send(isAdmin(message.author.id) ? 'admin' : 'user');
                return;
            case 'remind':
                if(!isAdmin(message.author.id)) return;
                const msg = tags.join(' ');
                (channel as Discord.TextChannel).send(msg + ` скоро начало турнира`);
                return;
            case 'addadmin':
                if(!isAdmin(message.author.id)) return;
                admins.push(args[0]);
                return;
            case 'lvlup':
                if(!isAdmin(message.author.id)) return;
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
                    if(!isAdmin(message.author.id)) return;
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
                    if(!isAdmin(message.author.id)) return;
                    suttonmode = !suttonmode;
                    (channel as Discord.TextChannel).send(`Suttonmode ${suttonmode ? `enabled` : `disabled`}`);
                    return;
            case 'addteam':
                    if(!isAdmin(message.author.id)) return;
                    addTeam(args[0], parseInt(args[1]));
                    (channel as Discord.TextChannel).send(`Команда добавлена`);
                    return;
            case 'getscrim':
                    if(!isAdmin(message.author.id)) return;
                    (channel as Discord.TextChannel).send(getRandomTeam(parseInt(args[0]), args[1]));
                    return;
            case 'teamlist':
                    (channel as Discord.TextChannel).send(getTeamList());
                    return;
            case 'changetier':
                if(!isAdmin(message.author.id)) return;
                changeTeamTier(args[0], parseInt(args[1]));
                (channel as Discord.TextChannel).send(`Тир изменён`);
                return;
            case 'troopic':
                if(!isAdmin(message.author.id)) return;
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
                if(!isAdmin(message.author.id)) return;
                addPoints(args[0], parseInt(args[1]), message);
                message.reply(`Succesfully add ${args[1]} SRG social points to ${args[0]}`);
                return;
            case 'wordsmode':
                wordsmode = !wordsmode;
                words = [];
                (channel as Discord.TextChannel).send(`Игра началась`);
                return;
            default:
                return;
        }
    }
})

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

function sample(arr: Array<any>){
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomTeam(tier?: number, randomMode?: string){
    const json = fs.readFileSync('./teams.json').toString();
    const obj = JSON.parse(json);
    const modes = ["Team Elim", "Regicide", "Domination"];
    var team = "SRG";
    var mode = 'Team Elim';
    while(team === "SRG"){
    if(tier){
        const [t1, t2, t3] = getArrays(obj);
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
        team = sample(obj).name;
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

function isAdmin(id:string){
    return admins.includes(id);
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