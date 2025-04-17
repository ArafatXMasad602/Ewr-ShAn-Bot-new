const axios = require("axios");

module.exports.config = {
  name: "pinimg",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Arafat",
  description: "Fetch images from Pinterest using keyword",
  commandCategory: "media", // <-- Fixed!
  usages: "[keyword] [amount]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const cookie = "pina_AMA2QKYXADVGUBAAGDAEODZYRJEEJFQBQBIQCZWAMROQ4KEXUFHHCW74JEUUHKUZI5E4ZWKPB76EJHGATTYNISGMT7KJXDYA";
  const keyword = args.slice(0, -1).join(" ") || args.join(" ");
  const amount = parseInt(args[args.length - 1]) || 5;

  if (!keyword) return api.sendMessage("দয়া করে কীওয়ার্ড দাও! যেমনঃ #pinimg naruto 5", event.threadID, event.messageID);
  if (amount > 20) return api.sendMessage("২০টির বেশি ছবি পাঠানো যাবে না!", event.threadID, event.messageID);

  try {
    const searchUrl = `https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=/search/pins/?q=${encodeURIComponent(keyword)}&data={"options":{"query":"${encodeURIComponent(keyword)}","scope":"pins"},"context":{}}`;

    const res = await axios.get(searchUrl, {
      headers: {
        "Cookie": `pina=${cookie}`,
        "User-Agent": "Mozilla/5.0"
      }
    });

    const pins = res.data?.resource_response?.data?.results;
    if (!pins || !pins.length) return api.sendMessage("কোনও ছবি পাওয়া যায়নি!", event.threadID, event.messageID);

    const selected = pins.slice(0, amount);
    const images = await Promise.all(
      selected.map(async (pin) => {
        const imgUrl = pin.images.orig.url;
        const imgStream = await axios.get(imgUrl, { responseType: "stream" });
        return { attachment: imgStream.data };
      })
    );

    api.sendMessage(images, event.threadID, event.messageID);
  } catch (err) {
    console.log(err.message);
    api.sendMessage("Pinterest থেকে ছবি আনতে সমস্যা হয়েছে!", event.threadID, event.messageID);
  }
};
