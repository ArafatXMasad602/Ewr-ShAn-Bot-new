const axios = require("axios");

module.exports = {
  config: {
    name: "funvideo",
    version: "1.0",
    hasPermssion: 0,
    credits: "Arafat",
    description: "টিকটক থেকে ফানি ভিডিও ডাউনলোড করে দেয়",
    category: "media",
    usages: "#funvideo",
    cooldowns: 5
  },

  onStart: async function ({ message }) {
    try {
      const res = await axios.get(`https://api.tikwm.com/feed/search?keyword=funny&count=1`);
      const video = res.data.data.videos[0];

      if (!video || !video.play) {
        return message.reply("দুঃখিত, ভিডিও আনতে সমস্যা হয়েছে। পরে আবার চেষ্টা করো!");
      }

      const videoUrl = video.play;

      return message.reply({
        body: "এই নে তোর ফানি ভিডিও 🙂🙏🏻",
        attachment: await global.utils.getStreamFromURL(videoUrl)
      });

    } catch (err) {
      console.error(err);
      return message.reply("ভাই, একটা সমস্যা হইছে ভিডিও আনতে গিয়ে। আবার চেষ্টা করো!");
    }
  }
};
