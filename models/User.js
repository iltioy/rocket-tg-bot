const { model, Schema } = require("mongoose");
const Crypto = require("crypto-js");

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
    keep_alive: {
        status: {
            type: String,
            enum: ["online", "away", "busy", "offline"],
            default: "online",
        },
        active: {
            type: Boolean,
            default: false,
        },
    },
    dm_chat_list: [DmRocketChatSchema],
});

UserSchema.methods.getToken = function () {
    if (!this.rocket_token) return "";

    const bytes = Crypto.AES.decrypt(
        this.rocket_token,
        process.env.ENCRYPTION_TOKEN
    );
    const decryptedToken = bytes.toString(Crypto.enc.Utf8);

    return decryptedToken;
};

module.exports = model("User", UserSchema);
