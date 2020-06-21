require('dotenv').config();
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const discordToken = process.env.DISCORD_TOKEN;
const phoneBook = JSON.parse(process.env.PHONE_BOOK);
const twilioNumber = process.env.TWILIO_NUMBER;
const messageService = process.env.TWILIO_MESSAGING_SERVICE_SID;

const Discord = require('discord.js');
var twilio = require('twilio');
const bot = new Discord.Client();
var client = new twilio(accountSid, authToken);

bot.on('message', (message) => {
  if(message.author.bot) return;
  if (message.content[0] === '!') {
    const messageContent = message.content.slice(1);
    const splitContent = messageContent.split(",");

    if (splitContent[0] === 'smsbot') {
      let recipient = splitContent[1].trim();
      let sms = splitContent[2].trim();
      let raiderRole = message.guild.roles.cache.find(role => role.name === recipient);

      if (recipient === undefined || sms === undefined) return;

      if (raiderRole === undefined) {
        if (phoneBook[recipient] !== undefined) {
          callGuildie(recipient, sms);
        }
      } else {
        message.guild.members.fetch().then(fetchedMembers => {
          let raiders = [];
          raiderNamesByRole(raiders, fetchedMembers, raiderRole);
          callRaiders(raiders, sms)
        })
      };
    } else if (splitContent[0] === 'smsbot-help') {
      message.channel.send('SMSBot responds to the following:');
      message.channel.send('!SMSBot, DISCORD_ROLE_HERE , SMS_MESSAGE_HERE');
      message.channel.send('*OR*');
      message.channel.send('!SMSBot, DISCORD_MEMBER_HERE , SMS_MESSAGE_HERE');
    }
  }
});

let callGuildie = (recipient, sms) => {
  client.messages
  .create({
     body: sms,
     from: twilioNumber,
     to: phoneBook[recipient]
   })
  .then(message => console.log(message.sid))
  .catch(err => console.log(err));
};

let callRaiders = (raiders, sms) => {
  // Promise.all(
  //   raiders.map(raider => {
  //     return twilio.messages.create({
  //       to: phoneBook[raider],
  //       from: messageService,
  //       body: sms
  //     });
  //   })
  // )
  //   .then(messages => {
  //     console.log('Messages sent!');
  //   })
  //   .catch(err => console.error(err));
};

let raiderNamesByRole = (accum, fetchedMembers, raiderRole) => {
  // Start a collection of raiders
  fetchedMembers.forEach(gmember => {
    if (gmember.roles.cache.has(raiderRole.id)) {
      accum.push(gmember.nickname.toLowerCase());
    };
  });
}

bot.login(discordToken)
