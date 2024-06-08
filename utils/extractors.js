/**
 * Gets rooms as input and returns only personal rooms with their last messages
 */

const dmExctractor = (rooms) => {
    const extractedRooms = [];

    if (!rooms) {
        return extractedRooms;
    }

    for (let i = 0; i < rooms.length; i++) {
        let room = rooms[i];
        let lastMessage;

        if (room.usersCount > 2) {
            continue;
        }

        if (!room.lastMessage) {
            lastMessage = {
                id: null,
                msg: null,
                from: {
                    id: null,
                    name: null,
                },
            };
        } else {
            lastMessage = {
                id: room.lastMessage._id,
                msg: room.lastMessage.msg,
                from: {
                    id: room.lastMessage.u._id,
                    username: room.lastMessage.u.username,
                    name: room.lastMessage.u.name,
                },
            };
        }

        let extractedRoom = {
            room_id: room._id,
            lastMessage,
        };

        extractedRooms.push(extractedRoom);
    }

    return extractedRooms;
};

module.exports = { dmExctractor };
