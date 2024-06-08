const User = require("../models/User");
const { getMe } = require("./queries");

module.exports = (bot) => {
    bot.action("start_info", (ctx) => {
        ctx.deleteMessage();
        ctx.scene.enter("CHAT_INFO_GATHERING");
    });

    bot.action("me_info", async (ctx) => {
        try {
            ctx.deleteMessage();
            const user = await User.findOne({ chat_id: ctx.chat.id });

            const me = await getMe({
                token: user.rocket_token,
                user_id: user.rocket_user_id,
                domain: user.rocket_domain,
            });

            if (!me.username) {
                await ctx.reply("К чату не привязан аккаунт рокета!");
                return;
            }

            await ctx.reply(
                `Привязанный к чату аккаунт рокета:\n\nusername: ${me.username}\nname: ${me.name}`
            );
        } catch (error) {
            await ctx.reply(
                "Ошибка при полученнии данных об аккаунте\nПроверьте корректность привязанных данных"
            );
            console.log(error);
        }
    });

    bot.action("dm_chats_info", async (ctx) => {
        try {
            ctx.deleteMessage();
            const user = await User.findOne({ chat_id: ctx.chat.id });

            const me = await getMe({
                token: user.rocket_token,
                user_id: user.rocket_user_id,
                domain: user.rocket_domain,
            });

            if (!me.username) {
                await ctx.reply("К чату не привязан аккаунт рокета!");
                return;
            }

            if (!user.dm_chat_list || user.dm_chat_list?.length === 0) {
                await ctx.reply("У пользователя не добавлены личные чаты");
                return;
            }

            let chatListMessage = "";
            let countChats = 0;

            for (let i = 0; i < user.dm_chat_list.length; i++) {
                const chat = user.dm_chat_list[i];
                const username = chat?.usernames.filter(
                    (u) => u !== me.username
                );
                if (username.length === 0) continue;

                countChats++;
                chatListMessage += `${countChats}. ${username[0]}\n`;
            }

            if (!chatListMessage) {
                await ctx.reply(
                    "Не удалось собрать данные об чатах пользователя\nПопробуйте обновить данные рокета"
                );
                return;
            }

            await ctx.reply("Список ваших чатов:");
            await ctx.reply(chatListMessage);
        } catch (error) {
            await ctx.reply(
                "Ошибка при полученнии данных об аккаунте\nПроверьте корректность привязанных данных"
            );
            console.log(error);
        }
    });
};
