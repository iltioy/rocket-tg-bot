const starterMessage = `
<b>🚀 Rocket  Bot 🤖 </b>

Бот предназначен для получения уведомлений с рокет чата прямо в телеграмм

/menu - открыть меню со всеми возможностями

Версия бота: 0.3
`;

const getNotificationMessage = ({ from_name, msg }) => {
    return `Новое сообщение в чате с ${from_name}:\n"${msg}"`;
};

module.exports = { starterMessage, getNotificationMessage };
