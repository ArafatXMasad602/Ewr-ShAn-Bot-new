const axios = require("axios");

module.exports = {
  config: {
    name: "funvideo",
    version: "1.0",
    author: "Arafat",
    countDown: 5,
    role: 0,
    shortDescription: "ফানি ভিডিও দেখাও",
    longDescription: "টিকটক থেকে রেন্ডম ফানি ভিডিও এনে দেখায়",
    category: "media",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message }) {
    try {
      // রেন্ডম কিওয়ার্ড দিয়ে ফানি ভিডিও খোঁজা
      const keywords = ["funny", "meme", "fail", "comedy", "laugh", "prank"];
      const query = keywords[Math.floor(Math.random() * keywords.length)];

      const options = {
        method: 'GET',
        url: `https://tiktok-video-no-watermark2.p.rapidapi.com/feed/search`,
        params: {
          keywords: query,
          count: '1'
        },
        headers: {
          'x-rapidapi-host': 'tiktok-video-no-watermark2.p.rapidapi.com',
          'x-rapidapi-key': '53fda6446fmshd999012aafb9fc7p190286jsn894094d3d656'
        }
      };

      const res = await axios.request(options);

      if (!res.data.data || res.data.data.length === 0) {
        return message.reply("দুঃখিত, কোনো ফানি ভিডিও খুঁজে পেলাম না।");
      }

      const videoUrl = res.data.data[0].play; // ডাউনলোড লিংক
      const response = await axios.get(videoUrl, { responseType: 'stream' });

      return message.reply({
        body: "এই নে তোর ফানি ভিডিও 🙂🙏🏻",
        attachment: response.data
      });

    } catch (err) {
      console.error(err);
      return message.reply("ভিডিও আনতে সমস্যা হয়েছে। একটু পরে চেষ্টা করো!");
    }
  }
};
