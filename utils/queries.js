const needle = require("needle");

const getMe = async ({ token, user_id, domain }) => {
    try {
        const res = await needle("get", `https://${domain}/api/v1/me`, {
            headers: {
                "X-Auth-Token": token,
                "X-User-Id": user_id,
            },
        });
        return res.body;
    } catch (error) {
        console.log(error);
    }
};

const getRooms = async ({ token, user_id, domain }) => {
    try {
        const res = await needle("get", `https://${domain}/api/v1/rooms.get`, {
            headers: {
                "X-Auth-Token": token,
                "X-User-Id": user_id,
            },
        });

        return res.body;
    } catch (error) {
        console.log(error);
    }
};

module.exports = { getMe, getRooms };
