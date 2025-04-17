const axios = require("axios");

module.exports = {
  config: {
    name: "funvideo",
    version: "1.0",
    hasPermssion: 0,
    credits: "Arafat",
    description: "রেন্ডম ফানি TikTok ভিডিও দেয়",
    category: "media",
    usages: "#funvideo",
    cooldowns: 5
  },

  onStart: async function ({ message }) {
    try {
      // ফানি ভিডিওর কিওয়ার্ড ইউজ করে রেন্ডম ভিডিও খোঁজা
      const query = "funny tiktok";
      const res = await axios.get(`https://api.tiklydown.com/api/search?keywords=${encodeURIComponent(query)}`);
      const videos = res.data?.videos || [];

      if (videos.length === 0) {
        return message.reply("দুঃখিত, এখন কোনো ফানি ভিডিও পাওয়া যায়নি!");
      }

      // রেন্ডম ভিডিও সিলেক্ট
      const randomVideo = videos[Math.floor(Math.random() * videos.length)];

      const videoLink = randomVideo.video_url || randomVideo.download_url;

      if (!videoLink) return message.reply("ভিডিও লিংক খুঁজে পাইনি!");

      return message.reply({
        body: "এই নে তোর ফানি ভিডিও 🙂🙏🏻",
        attachment: await global.utils.getStreamFromURL(videoLink)
      });
    } catch (err) {
      console.error(err);
      return message.reply("টিকটক থেকে ভিডিও আনতে সমস্যা হয়েছে, একটু পর আবার চেষ্টা করো।");
    }
  }
};
