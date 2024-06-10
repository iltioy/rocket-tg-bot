const { Markup } = require("telegraf");
const User = require("../models/User");

const sendMenu = async (ctx) => {
    try {
        if (!ctx) return;

        const fields = [
            [
                Markup.button.callback(
                    "Установить настройки рокета",
                    "start_info"
                ),
            ],
            [Markup.button.callback("Информация об аккаунте", "me_info")],
            [
                Markup.button.callback(
                    "Информация об просматриваемых дм чатах",
                    "dm_chats_info"
                ),
            ],
            [Markup.button.callback("Настройка онлайн статуса", "me_status")],
        ];

        await ctx.replyWithHTML(
            "Выберите действие",
            Markup.inlineKeyboard(fields)
        );
    } catch (error) {
        console.log(error);
    }
};

const sendOnlineSettings = async (ctx) => {
    try {
        if (!ctx) return;

        await ctx.deleteMessage();

        const user = await User.findOne({ chat_id: ctx.chat.id });
        if (!user) {
            return;
        }

        const activeMessage = user.keep_alive?.active
            ? "Поддержание онлайна: включено"
            : "Поддержание онлайна: выключено";

        const fields = [
            [Markup.button.callback(activeMessage, "me_toggle_keep_alive")],
            [
                Markup.button.callback(
                    "Установить онлайн статус",
                    "me_set_status"
                ),
            ],
            [Markup.button.callback("<< Назад", "send_menu")],
        ];

        await ctx.replyWithHTML(
            "Выберите настройку",
            Markup.inlineKeyboard(fields)
        );
    } catch (error) {
        console.log(error);
    }
};

const sendOnlineStatuses = async (ctx) => {
    try {
        if (!ctx) return;

        await ctx.deleteMessage();

        const fields = [
            [
                Markup.button.callback("Online 🟢", "me_set_status online"),
                Markup.button.callback("Away 🟡", "me_set_status away"),
            ],

            [
                Markup.button.callback("Busy 🔴", "me_set_status busy"),
                Markup.button.callback("Offline ⚪", "me_set_status offline"),
            ],
            [Markup.button.callback("<< Назад", "me_status")],
        ];

        await ctx.replyWithHTML(
            "Выберите статус для установки",
            Markup.inlineKeyboard(fields)
        );
    } catch (error) {
        console.log(error);
    }
};

module.exports = { sendMenu, sendOnlineSettings, sendOnlineStatuses };
