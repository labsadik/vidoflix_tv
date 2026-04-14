const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* LOGIN */
exports.login = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user.password !== password) {
            return res.status(400).json({ message: "Wrong password" });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role   // 🔥 IMPORTANT
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            role: user.role
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* REGISTER */
exports.register = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        const user = await User.create({
            name,
            email,
            password,
            role: "user"
        });

        res.json({ message: "User created" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};