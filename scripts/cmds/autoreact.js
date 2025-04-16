module.exports = {
  config: {
    name: "autoreact",
    version: "2.0",
    author: "Arafat",
    countDown: 0,
    role: 0,
    shortDescription: {
      en: "React with all kinds of emojis randomly"
    },
    longDescription: {
      en: "Auto reacts to every message using a wide range of emojis"
    },
    category: "fun",
    guide: {
      en: "Add to commands, and it will auto-react with random emoji"
    }
  },

  onChat: async function ({ api, event }) {
    const emojis = [
      "❤", "👍", "😆", "😮", "😢", "😠",
      "😂", "🤣", "🥲", "😍", "😘", "😎",
      "🙄", "😒", "😱", "🤯", "🤡", "😴",
      "💩", "🔥", "💯", "✨", "🫶", "😇",
      "👀", "😜", "😏", "🥺", "🙏", "🤔",
      "🙈", "😈", "👑", "💔", "🥳", "😳",
      "🤗", "🎉", "😇", "😬", "😷", "🥶",
      "🤪", "😵", "🤤", "😩", "🫣", "😤",
      "😪", "😹", "🙃", "😅", "🫠", "😚"
    ];

    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    try {
      await api.setMessageReaction(randomEmoji, event.messageID, null, true);
    } catch (err) {
      console.error("Emoji react failed:", err);
    }
  }
};
