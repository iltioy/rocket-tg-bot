const { Scenes } = require("telegraf");
const { getMe, getRooms } = require("../utils/queries");
const User = require("../models/User");
const { dmExctractor } = require("../utils/extractors");
const Crypto = require("crypto-js");

const ChatInfoScene = new Scenes.WizardScene(
    "CHAT_INFO_GATHERING",
    async (ctx) => {
        try {
            await ctx.reply("Обновление информации об аккаунте рокет чата...");
            await ctx.reply("Введите ваш токен");
            ctx.wizard.state.chat_info_data = {};
            return ctx.wizard.next();
        } catch (error) {
            ctx.scene.leave();
            console.log(error);
        }
    },
    async (ctx) => {
        try {
            const token = ctx.message.text;

            if (!token) {
                ctx.reply("Пожалуйста, введите токен!");
                return;
            }

            ctx.wizard.state.chat_info_data.token = token;
            await ctx.reply("Теперь отпрвьте свой user id из рокета");
            return ctx.wizard.next();
        } catch (error) {
            console.log(error);
            ctx.scene.leave();
        }
    },
    async (ctx) => {
        try {
            const user_id = ctx.message.text;

            if (!user_id) {
                ctx.reply("Пожалуйста, введите user id!");
                return;
            }

            ctx.wizard.state.chat_info_data.user_id = user_id;
            await ctx.reply(
                "Отлично! Последний шаг - введите домен вашего чата (без https://, например example.chat.ru)"
            );
            return ctx.wizard.next();
        } catch (error) {
            console.log(error);
            ctx.scene.leave();
        }
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

            await ctx.reply("Проверяем данные...");
            const me = await getMe({ token, user_id, domain });

            if (!me.username) {
                await ctx.reply(
                    "Введены некорректные данные! Попробуйте снова"
                );
                return ctx.scene.leave();
            }

            await ctx.reply(
                `Выполнен вход под пользователем ${me.username}! Уже начинаем получать сообщения...`
            );

            const rooms = await getRooms({ token, user_id, domain });
            const dmRooms = dmExctractor(rooms.update);
            const encryptedToken = Crypto.AES.encrypt(
                token,
                process.env.ENCRYPTION_TOKEN
            ).toString();

            await User.updateOne(
                { chat_id: ctx.chat.id },
                {
                    rocket_domain: domain,
                    rocket_token: encryptedToken,
                    rocket_user_id: user_id,
                    dm_chat_list: dmRooms,
                }
            );
            await ctx.scene.leave();
        } catch (error) {
            ctx.reply(
                `Неизвестная ошибка...\nПроверьте корректность введённых данных и повторите снова`
            );
            await ctx.scene.leave();
        }
    }
);

module.exports = ChatInfoScene;
