const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    let token;

    // 1️⃣ Check if Authorization header exists
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // 2️⃣ Extract token
            token = req.headers.authorization.split(" ")[1];

            // 3️⃣ Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4️⃣ Get user from DB (exclude password)
            const user = await User.findById(decoded.id).select("-password");

            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }

            // 5️⃣ Attach user to request
            req.user = user;

            return next();

        } catch (error) {
            console.error("JWT Error:", error.message);
            return res.status(401).json({ message: "Not authorized, token invalid" });
        }
    }

    // 6️⃣ If no token provided
    return res.status(401).json({ message: "Not authorized, no token provided" });
};

module.exports = { protect };
