const { model, Schema } = require("mongoose");

const DmRocketChatSchema = new Schema({
    room_id: {
        type: String,
        required: true,
    },
    usernames: [String],
    lastMessage: {
        id: String,
        msg: String,
        from: {
            id: String,
            username: String,
            name: String,
        },
    },
});

const UserSchema = new Schema({
    chat_id: {
        type: String,
        required: true,
    },
    rocket_token: {
        type: String,
    },
    rocket_user_id: {
        type: String,
    },
    rocket_domain: {
        type: String,
    },
    dm_chat_list: [DmRocketChatSchema],
});

module.exports = model("User", UserSchema);
