const User = require("../models/User");
const {
    sendOnlineSettings,
    sendOnlineStatuses,
    sendMenu,
} = require("./markups");
const { getMe } = require("./queries");

module.exports = (bot) => {
    bot.action("start_info", (ctx) => {
        ctx.deleteMessage();
        ctx.scene.enter("CHAT_INFO_GATHERING");
    });

    bot.action("me_info", async (ctx) => {
        try {
            ctx.deleteMessage();
            const { user, me } = await checkUser(ctx);

            if (!me?.username) {
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
            const { user, me } = await checkUser(ctx);

            if (!me?.username) {
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

    bot.action(/me_set_status \w*/g, async (ctx) => {
        try {
            await ctx.deleteMessage();

            const { me, user } = await checkUser(ctx);

            if (!me?.username) {
                await ctx.reply("К чату не привязан аккаунт рокета!");
                return;
            }

            const availableStatuses = ["online", "away", "busy", "offline"];

            const query = ctx.match[0];
            if (query.split(" ").length !== 2) {
                await ctx.reply("Не указан статус для установки!");
                return;
            }

            const status = query.split(" ")[1];

            if (!availableStatuses.includes(status)) {
                await ctx.reply("Неверный статус для установки!");
                return;
            }

            await User.updateOne(
                {
                    chat_id: user.chat_id,
                },
                {
                    keep_alive: {
                        status,
                        active: user.keep_alive?.active,
                    },
                }
            );

            await ctx.reply(`Статус успешно установлен на ${status}!`);
        } catch (error) {
            await ctx.reply(
                "Ошибка при полученнии данных об аккаунте\nПроверьте корректность привязанных данных"
            );
            console.log(error);
        }
    });

    bot.action("me_toggle_keep_alive", async (ctx) => {
        try {
            const { me, user } = await checkUser(ctx);

            if (!me?.username) {
                await ctx.reply("К чату не привязан аккаунт рокета!");
                return;
            }

            await User.updateOne(
                { chat_id: user.chat_id },
                {
                    keep_alive: {
                        active: !user.keep_alive?.active,
                        status: user.keep_alive?.status,
                    },
                }
            );

            await sendOnlineSettings(ctx);
        } catch (error) {
            await ctx.reply(
                "Ошибка при полученнии данных об аккаунте\nПроверьте корректность привязанных данных"
            );
            console.log(error);
        }
    });

    const checkUser = async (ctx) => {
        const user = await User.findOne({ chat_id: ctx.chat.id });

        const me = await getMe({
            token: user.getToken(),
            user_id: user.rocket_user_id,
            domain: user.rocket_domain,
        });

        return { user, me };
    };

    bot.action("me_status", async (ctx) => {
        await sendOnlineSettings(ctx);
    });

    bot.action("me_set_status", async (ctx) => {
        await sendOnlineStatuses(ctx);
    });

    bot.action("send_menu", async (ctx) => {
        await ctx.deleteMessage();
        await sendMenu(ctx);
    });
};
