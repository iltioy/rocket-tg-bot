const starterMessage = `
<b>🚀 Rocket  Bot 🤖 </b>

Бот предназначен для получения уведомлений с рокет чата прямо в телеграмм
Версия бота: 0.1
`;

const getNotificationMessage = ({ from_name, msg }) => {
    return `
    Новое сообщение в чате с ${from_name}!
    "${msg}"
    `;
};

module.exports = { starterMessage, getNotificationMessage };
