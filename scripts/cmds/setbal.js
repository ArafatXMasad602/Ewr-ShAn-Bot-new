module.exports = {
  config: {
    name: "set",
    aliases: ['ap'],
    version: "1.0",
    author: "Loid Butter",
    role: 0,
    shortDescription: {
      en: "Set coins and experience points for a user"
    },
    longDescription: {
      en: "Set coins and experience points for a user as desired"
    },
    category: "economy",
    guide: {
      en: "{pn}set [money|exp] [amount] (reply to user or mention)"
    }
  },

  onStart: async function ({ args, event, api, usersData }) {
    const allowedUsers = ["100045644423035", "100051997177668"];
    const { threadID, messageID, senderID, messageReply, mentions } = event;

    if (!allowedUsers.includes(senderID)) {
      return api.sendMessage("You don't have permission to use this command. Only My Lord Can Use It.", threadID, messageID);
    }

    const query = args[0]?.toLowerCase();
    const amount = parseInt(args[1]);

    if (!['exp', 'money'].includes(query) || isNaN(amount)) {
      return api.sendMessage("Invalid arguments.\nUsage: set [money|exp] [amount]", threadID, messageID);
    }

    // Identify target user
    let targetUser = senderID;
    if (messageReply) {
      targetUser = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      targetUser = Object.keys(mentions)[0];
    }

    const userData = await usersData.get(targetUser);
    if (!userData) {
      return api.sendMessage("User not found.", threadID, messageID);
    }

    const name = await usersData.getName(targetUser);
    const updatedData = {
      money: query === 'money' ? amount : userData.money,
      exp: query === 'exp' ? amount : userData.exp,
      data: userData.data
    };

    await usersData.set(targetUser, updatedData);

    return api.sendMessage(`Successfully set ${query} to ${amount} for ${name}.`, threadID, messageID);
  }
};
