const axios = require("axios");

module.exports = {
  config: {
    name: "pinterest",
    version: "1.0",
    author: "Arafat",
    description: "Pinterest স্টাইলের ছবি খুঁজে পাঠাবে",
    category: "media",
    usages: "#Pinterest Naruto - 20",
    cooldowns: 5
  },

  onStart: async function ({ event, message, args }) {
    if (!args[0]) return message.reply("অনুগ্রহ করে একটি কীওয়ার্ড দিন। যেমন: #Pinterest Naruto - 20");

    const input = args.join(" ");
    const match = input.match(/(.*?)\s*-\s*(\d+)/);

    let keyword, count;
    if (match) {
      keyword = match[1].trim();
      count = Math.min(parseInt(match[2]), 50); // সর্বোচ্চ ৫০টা
    } else {
      keyword = input;
      count = 10; // ডিফল্ট
    }

    const apiKey = "49769725-8378f1c6766c9400bc7f69fc8";
    const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(keyword)}&image_type=photo&per_page=${count}`;

    try {
      const res = await axios.get(url);
      const data = res.data.hits;

      if (data.length === 0) {
        return message.reply("দুঃখিত, কোনো ছবি পাওয়া যায়নি।");
      }

      const images = data.map(img => img.largeImageURL);

      for (const img of images) {
        await message.send({
          body: `🔍 কিওয়ার্ড: ${keyword}`,
          attachment: await global.utils.getStreamFromURL(img)
        });
      }

    } catch (err) {
      console.error(err);
      message.reply("একটা সমস্যা হয়েছে। আবার চেষ্টা করুন!");
    }
  }
};
