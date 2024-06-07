const { Scenes } = require("telegraf");
const { getMe } = require("../utils/queries");
const User = require("../models/User");

const ChatInfoScene = new Scenes.WizardScene(
    "CHAT_INFO_GATHERING",
    (ctx) => {
        ctx.reply("Обновление информации об аккаунте рокет чата...");
        ctx.reply("Введите ваш токен");
        ctx.wizard.state.chat_info_data = {};
        return ctx.wizard.next();
    },
    (ctx) => {
        const token = ctx.message.text;

        if (!token) {
            ctx.reply("Пожалуйста, введите токен!");
            return;
        }

        ctx.wizard.state.chat_info_data.token = token;
        ctx.reply("Теперь отпрвьте свой user id из рокета");
        return ctx.wizard.next();
    },
    (ctx) => {
        const user_id = ctx.message.text;

        if (!user_id) {
            ctx.reply("Пожалуйста, введите user id!");
            return;
        }

        ctx.wizard.state.chat_info_data.user_id = user_id;
        ctx.reply(
            "Отлично! Последний шаг - введите домен вашего чата (без https://, например example.chat.ru)"
        );
        return ctx.wizard.next();
    },
    async (ctx) => {
        try {
            const domain = ctx.message.text;

            if (!domain) {
                ctx.reply("Пожалуйста, введите домен чата!");
                return;
            }

            ctx.wizard.state.chat_info_data.domain = domain;
            const { token, user_id } = ctx.wizard.state.chat_info_data;

            ctx.reply("Проверяем корректность введёных данных...");
            const res = await getMe(token, user_id, domain);

            if (!res.username) {
                ctx.reply("Введены некорректные данные! Попробуйте снова");
                return ctx.scene.leave();
            }

            ctx.reply(
                `Выполнен вход под пользователем ${res.username}! Уже начинаем получать сообщения...`
            );
            await User.updateOne(
                { chat_id: ctx.chat.id },
                {
                    rocket_domain: domain,
                    rocket_token: token,
                    rocket_user_id: user_id,
                }
            );
            ctx.scene.leave();
        } catch (error) {
            ctx.reply("Неизвестная ошибка...");
            ctx.scene.leave();
        }
    }
);

module.exports = ChatInfoScene;
