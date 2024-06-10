const { Markup } = require("telegraf");

const sendMenu = (ctx) => {
    if (!ctx) return;

    const fields = [
        [Markup.button.callback("Установить настройки рокета", "start_info")],
        [Markup.button.callback("Информация об аккаунте", "me_info")],
        [
            Markup.button.callback(
                "Информация об просматриваемых дм чатах",
                "dm_chats_info"
            ),
        ],
    ];

    ctx.replyWithHTML("Выберите действие", Markup.inlineKeyboard(fields));
};

module.exports = { sendMenu };
