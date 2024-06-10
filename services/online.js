const User = require("../models/User");
const { keepOnline, getMe } = require("../utils/queries");

module.exports = () => {
    const keepMeAlive = async () => {
        try {
            console.log("keep!");
            const keepUsers = await User.find({ "keep_alive.active": true });

            keepUsers.map(handleKeepAlive);
        } catch (error) {
            console.log(error);
        }
    };

    const handleKeepAlive = async (user) => {
        try {
            console.log("keeping user");
            const me = await getMe({
                token: user.rocket_token,
                user_id: user.rocket_user_id,
                domain: user.rocket_domain,
            });

            if (!me.username) return;

            await keepOnline({
                token: user.rocket_token,
                user_id: user.rocket_user_id,
                domain: user.rocket_domain,
                status: user.keep_alive.status || "online",
            });
        } catch (error) {
            console.log(error);
        }
    };

    setInterval(keepMeAlive, 10000);
};
