const User = require("../models/User");
const { dmExctractor } = require("../utils/extractors");
const { getNotificationMessage } = require("../utils/messages");
const { getRooms } = require("../utils/queries");

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

            if (!rooms) {
                return;
            }

            const dmRooms = dmExctractor(rooms.update);
            const oldDmChatList = user.dm_chat_list || [];
            const oldLastMessageIds = [];
            oldDmChatList.forEach((room) => {
                oldLastMessageIds.push(room.lastMessage.id);
            });
            const mailableRooms = dmRooms.filter(
                (room) => !oldLastMessageIds.includes(room.lastMessage.id)
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

    mailer();
};
