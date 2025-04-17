const { GoatWrapper } = require('fca-liane-utils');
const axios = require('axios');

async function getStreamFromURL(url) {
  const response = await axios.get(url, { responseType: 'stream' });
  return response.data;
}

async function fetchFunnyVideos() {
  try {
    const response = await axios.get(`https://lyric-search-neon.vercel.app/kshitiz?keyword=${encodeURIComponent("funny video")}`);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
}

module.exports = {
  config: {
    name: "funvideo",
    aliases: [],
    author: "𝗔𝗿𝗮𝗳𝗮𝘁",
    version: "1.0",
    shortDescription: {
      en: "get a random funny video",
    },
    longDescription: {
      en: "fetches a funny video from the internet",
    },
    category: "𝗠𝗘𝗗𝗜𝗔",
    guide: {
      en: "{p}{n}",
    },
  },

  onStart: async function ({ api, event }) {
    api.setMessageReaction("🤣", event.messageID, () => {}, true);

    const videos = await fetchFunnyVideos();

    if (!Array.isArray(videos) || videos.length === 0) {
      return api.sendMessage("ফানি ভিডিও খুঁজে পাওয়া যায়নি। একটু পরে আবার চেষ্টা করো!", event.threadID, event.messageID);
    }

    const selectedVideo = videos[Math.floor(Math.random() * videos.length)];
    const videoUrl = selectedVideo.videoUrl;

    if (!videoUrl) {
      return api.sendMessage("দুঃখিত, ভিডিও লিংক পাওয়া যায়নি।", event.threadID, event.messageID);
    }

    try {
      const videoStream = await getStreamFromURL(videoUrl);
      await api.sendMessage({
        body: `নাও ভাই! ফান টাইম শুরু করো!`,
        attachment: videoStream,
      }, event.threadID, event.messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage("ভিডিও পাঠাতে গিয়ে সমস্যা হয়েছে। পরে আবার চেষ্টা করো।", event.threadID, event.messageID);
    }
  },
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
