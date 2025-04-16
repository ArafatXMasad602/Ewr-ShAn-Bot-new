const axios = require("axios");
const fs = require("fs");

module.exports.config = {
  name: "sura",
  version: "1.0",
  credits: "Arafat Edit",
  hasPermssion: 0,
  commandCategory: "Islamic",
  description: "Play selected Surah audio",
  usages: "[sura]",
  cooldowns: 5
};

const surahList = {
  "Al-Fatiha": {
    title: "The Opening - Al-Fatiha",
    url: "https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/001.mp3"
  },
  "Al-Ikhlas": {
    title: "Sincerity - Al-Ikhlas",
    url: "https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/112.mp3"
  },
  "An-Nas": {
    title: "Mankind - An-Nas",
    url: "https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/114.mp3"
  },
  "Al-Falaq": {
    title: "The Daybreak - Al-Falaq",
    url: "https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/113.mp3"
  }
};

module.exports.run = async ({ api, event }) => {
  let msg = "🕋 Please choose a Surah:\n";
  const keys = Object.keys(surahList);
  keys.forEach((key, i) => {
    msg += `${i + 1}. ${key}\n`;
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

module.exports.handleReply = async ({ api, event, handleReply }) => {
  const { author, keys } = handleReply;
  if (event.senderID != author) return;

  const index = parseInt(event.body) - 1;
  if (isNaN(index) || index < 0 || index >= keys.length) {
    return api.sendMessage("❌ Invalid choice. Try again.", event.threadID, event.messageID);
  }

  const name = keys[index];
  const info = surahList[name];

  try {
    const audio = (await axios.get(info.url, { responseType: "arraybuffer" })).data;
    const filePath = __dirname + "/sura.mp3";
    fs.writeFileSync(filePath, Buffer.from(audio, "utf-8"));

    return api.sendMessage({
      body: `▶️ Surah: ${name}\n📖 ${info.title}`,
      attachment: fs.createReadStream(filePath)
    }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);

  } catch (e) {
    console.log(e);
    return api.sendMessage("❌ Failed to load surah audio.", event.threadID, event.messageID);
  }
};
