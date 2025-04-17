module.exports = {
  config: {
    name: "animequiz",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Arafat",
    description: "এনিমে ভিত্তিক কুইজ",
    category: "game",
    usages: "animequiz",
    cooldowns: 5,
  },

  onStart: async function ({ message, event, api }) {
    const quizzes = [
      {
        question: "নারুতোর বাবার নাম কী?",
        options: ["কাকাশি", "মিনাতো", "ইরুকা", "জিরায়া"],
        answer: 1
      },
      {
        question: "লাফি কোন এনিমের চরিত্র?",
        options: ["Naruto", "One Piece", "Bleach", "Dragon Ball"],
        answer: 1
      },
      {
        question: "গোকু কতটা শক্তিশালী?",
        options: ["Power level 9000", "Power level 500", "Power level 10000", "Power level 3000"],
        answer: 0
      }
    ];

    const random = quizzes[Math.floor(Math.random() * quizzes.length)];

    let optionsText = "";
    random.options.forEach((opt, i) => {
      optionsText += `${i + 1}. ${opt}\n`;
    });

    return message.reply(
      `প্রশ্নঃ ${random.question}\n\n${optionsText}\nউত্তর দিন: 1, 2, 3 অথবা 4`
    );
  }
};
