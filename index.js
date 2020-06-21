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
  if (message.content[0] === '!') {
    const messageContent = message.content.slice(1).toLowerCase();
    const splitContent = messageContent.split(",");

    if (splitContent[0] === 'SMSBot') {
      let recipient = splitContent[1].trim();
      let message = splitContent[2].trim();
      let raiderRole = message.guild.roles.cache.find(role => role.name === recipient);

      if (recipient === undefined || message === undefined) return;

      if (raiderRole === undefined) {
        if (phoneBook[recipient] !== undefined) {
          callGuildie(recipient, message);
        }
      } else {
        message.guild.members.fetch().then(fetchedMembers => {
          let raiders = [];
          raiderNamesByRole(raiders, fetchedMembers);
          callRaiders(raiders, message)
        }
      });
    }
  } else if (splitContent[0] === 'SMSBot-help') {
    message.channel.sendMessage('SMSBot responds to the following:');
    message.channel.sendMessage('!SMSBot,DISCORD_ROLE_HERE,SMS_MESSAGE_HERE');
    message.channel.sendMessage('*OR*');
    message.channel.sendMessage('!SMSBot,DISCORD_MEMBER_HERE,SMS_MESSAGE_HERE');
  }
});

let callGuildie = (recipient, message) => {
  client.messages
  .create({
     body: message,
     from: twilioNumber,
     to: phoneBook[recipient]
   })
  .then(message => console.log(message.sid))
  .catch(err => console.log(err));
};

let callRaiders = (raiders, message) => {
  Promise.all(
    raiders.map(raider => {
      return twilio.messages.create({
        to: phoneBook[raider],
        from: messageService,
        body: message
      });
    })
  )
    .then(messages => {
      console.log('Messages sent!');
    })
    .catch(err => console.error(err));
};

let raiderNamesByRole = (accum, fetchedMembers) => {
  // Start a collection of raiders
  fetchedMembers.forEach(gmember => {
    if (gmember.roles.cache.has(raiderRole.id)) {
      accum.push(gmember.nickname.toLowerCase());
    };
  });
}

bot.login(discordToken)
