require("dotenv").config();
const { Telegraf, Scenes } = require("telegraf");
const { session } = require("telegraf/session");
const User = require("./models/User");
const { default: mongoose } = require("mongoose");
const { starterMessage } = require("./utils/messages");

const mailer = require("./services/mailing");
const keepAlive = require("./services/online");
const actions = require("./utils/actions");

const ChatInfoScene = require("./scenes/ChatInfoScene");
const { sendMenu, sendOnlineSettings } = require("./utils/markups");
const stage = new Scenes.Stage([ChatInfoScene]);

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());
bot.use(stage.middleware());

mailer(bot);
keepAlive();
actions(bot);

bot.start(async (ctx) => {
    try {
        await ctx.replyWithHTML(starterMessage);

        const { id: chat_id } = ctx.chat;
        const existingChat = await User.findOne({ chat_id });

        if (!existingChat) {
            await User.create({
                chat_id,
            });
        }
    } catch (error) {
        console.log(error);
    }
});

bot.command("menu", async (ctx) => {
    await sendMenu(ctx);
});

const start = async () => {
    try {
        mongoose.connect(process.env.MONGO_URI);

        bot.launch();
        console.log("Bot is up and listening!");
    } catch (error) {
        console.log(error);
    }
};

start();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
