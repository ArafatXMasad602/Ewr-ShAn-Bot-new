module.exports.config = {
  name: "leave",
  version: "1.0.0",
  hasPermssion: 1,
  credits: "Arafat",
  description: "Bot leaves the group",
  commandCategory: "system",
  usages: "#leave",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const botID = api.getCurrentUserID();
  const threadID = event.threadID;

  try {
    await api.removeUserFromGroup(botID, threadID);
  } catch (error) {
    api.sendMessage("Failed to leave the group. The bot might not have enough permission.", threadID);
  }
};
