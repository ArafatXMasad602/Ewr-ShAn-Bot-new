const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "surah",
    aliases: [],
    version: "1.0",
    author: "Arafat",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Play a Quran Surah"
    },
    longDescription: {
      en: "Play an audio file of a Quranic Surah"
    },
    category: "media",
    guide: {
      en: "{pn} <surahName>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const surahName = args.join(" ") || "al-fatiha";
    const audioURL = `https://verses.quran.com/${surahName}.mp3`; // Example URL; replace with a valid one

    const filePath = path.join(__dirname, "tmp", `${surahName}.mp3`);

    try {
      const response = await axios({
        method: "GET",
        url: audioURL,
        responseType: "stream"
      });

      response.data.pipe(fs.createWriteStream(filePath));

      response.data.on("end", () => {
        api.sendMessage({
          body: `Now playing Surah: ${surahName}`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath));
      });
    } catch (err) {
      api.sendMessage("❌ Failed to play the Surah. Make sure the name is correct or try again later.", event.threadID);
    }
  }
};
