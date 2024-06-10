const User = require("../models/User");
const { dmExctractor } = require("../utils/extractors");
const { getNotificationMessage } = require("../utils/messages");
const { getRooms, getMe } = require("../utils/queries");

module.exports = (bot) => {
    const mailer = async () => {
        try {
            const mailableUsers = await User.find({
                rocket_token: {
                    $exists: true,
                },
                rocket_user_id: {
                    $exists: true,
                },
                rocket_domain: {
                    $exists: true,
                },
            });

            mailableUsers.map(handleDmMailing);
        } catch (error) {
            console.log(error);
        }
    };

    const handleDmMailing = async (user) => {
        try {
            if (!user) {
                return;
            }

            const rooms = await getRooms({
                token: user.rocket_token,
                user_id: user.rocket_user_id,
                domain: user.rocket_domain,
            });

            const me = await getMe({
                token: user.rocket_token,
                user_id: user.rocket_user_id,
                domain: user.rocket_domain,
            });

            if (!rooms || !me.username) {
                return;
            }

            const dmRooms = dmExctractor(rooms.update);
            const oldDmChatList = user.dm_chat_list || [];
            const oldLastMessageIds = [];
            oldDmChatList.forEach((room) => {
                oldLastMessageIds.push(room.lastMessage.id);
            });
            const mailableRooms = dmRooms.filter(
                (room) =>
                    !oldLastMessageIds.includes(room.lastMessage.id) &&
                    room.lastMessage?.from?.username !== me.username
            );

            await User.updateOne(
                { chat_id: user.chat_id },
                { dm_chat_list: dmRooms }
            );

            mailableRooms.forEach((room) => {
                const message = getNotificationMessage({
                    from_name: room.lastMessage.from.name,
                    msg: room.lastMessage.msg,
                });

                bot.telegram.sendMessage(user.chat_id, message);
            });
        } catch (error) {
            console.log(error);
        }
    };

    setInterval(mailer, 10000);
};
