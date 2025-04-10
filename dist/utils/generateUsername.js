import User from "../models/User.js";
const clean = (str) => {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 15);
};
export const generateUniqueUsername = async (firstName, lastName) => {
    const base = clean(firstName + lastName || "user");
    let username = "";
    let isTaken = true;
    while (isTaken) {
        const random = Math.floor(Math.random() * 10000);
        username = `${base}${random}`;
        const exists = await User.findOne({ username });
        if (!exists)
            isTaken = false;
    }
    return username;
};
