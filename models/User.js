const { model, Schema } = require("mongoose");

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
});

module.exports = model("User", UserSchema);
