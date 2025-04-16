const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "sura",
  version: "1.0",
  hasPermssion: 0,
  credits: "Arafat Fix",
  description: "Listen to Surah from Quran",
  commandCategory: "islamic",
  usages: "[reply with number]",
  cooldowns: 2
};

const surahList = {
  "Al-Fatiha": {
    title: "The Opening - Surah Al-Fatiha",
    url: "https://server8.mp3quran.net/afs/001.mp3"
  },
  "Al-Ikhlas": {
    title: "Sincerity - Surah Al-Ikhlas",
    url: "https://server8.mp3quran.net/afs/112.mp3"
  },
  "Al-Falaq": {
    title: "The Daybreak - Surah Al-Falaq",
    url: "https://server8.mp3quran.net/afs/113.mp3"
  },
  "An-Nas": {
    title: "Mankind - Surah An-Nas",
    url: "https://server8.mp3quran.net/afs/114.mp3"
  }
};

module.exports.run = async function ({ api, event }) {
  const keys = Object.keys(surahList);
  let msg = "📖 Select a Surah to play:\n\n";
  keys.forEach((name, index) => {
    msg += `${index + 1}. ${name}\n`;
  });

  return api.sendMessage(msg, event.threadID, (err, info) => {
    global.client.handleReply.push({
      name: module.exports.config.name,
      messageID: info.messageID,
      author: event.senderID,
      keys
    });
  }, event.messageID);
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { author, messageID, keys } = handleReply;
  if (event.senderID != author) return;

  const choice = parseInt(event.body) - 1;
  if (isNaN(choice) || choice < 0 || choice >= keys.length) {
    return api.sendMessage("❌ Invalid selection. Please enter a valid number.", event.threadID, event.messageID);
  }

  const name = keys[choice];
  const surah = surahList[name];

  const filePath = path.join(__dirname, "sura.mp3");

  try {
    const response = await axios.get(surah.url, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, Buffer.from(response.data, "utf-8"));

    api.sendMessage({
      body: `▶️ Now playing: ${name}\n${surah.title}`,
      attachment: fs.createReadStream(filePath)
    }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ Couldn't fetch the Surah audio. Try again later.", event.threadID);
  }
};
