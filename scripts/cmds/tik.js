const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "tik",
    aliases: [],
    version: "1.0",
    author: "Arafat Da",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Search and get videos from TikTok"
    },
    longDescription: {
      en: "Search TikTok videos based on keywords and get downloadable videos"
    },
    category: "media",
    guide: {
      en: "#tik <keyword>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const keyword = args.join(" ");
    if (!keyword) return api.sendMessage("দয়া করে একটি কীওয়ার্ড দিন, যেমনঃ #tik funny cat", event.threadID);

    try {
      const response = await axios.get(`https://tiktok-video-no-watermark2.p.rapidapi.com/feed/search`, {
        params: {
          keyword,
          count: 5
        },
        headers: {
          'x-rapidapi-host': 'tiktok-video-no-watermark2.p.rapidapi.com',
          'x-rapidapi-key': '53fda6446fmshd999012aafb9fc7p190286jsn894094d3d656'
        }
      });

      const videos = response.data?.data;
      if (!videos || videos.length === 0) return api.sendMessage("কোনো ভিডিও পাওয়া যায়নি!", event.threadID);

      const firstVideo = videos[0];
      const videoUrl = firstVideo.play; // No watermark video URL
      const fileName = path.join(__dirname, "cache", `tiktok_${Date.now()}.mp4`);

      const videoStream = (await axios.get(videoUrl, { responseType: "stream" })).data;
      videoStream.pipe(fs.createWriteStream(fileName));
      videoStream.on("end", () => {
        api.sendMessage(
          {
            body: `এই নে তোর TikTok ভিডিও!`,
            attachment: fs.createReadStream(fileName)
          },
          event.threadID,
          () => fs.unlinkSync(fileName)
        );
      });
    } catch (err) {
      console.error(err);
      api.sendMessage("ভিডিও আনতে সমস্যা হচ্ছে! আবার চেষ্টা করো।", event.threadID);
    }
  }
};
