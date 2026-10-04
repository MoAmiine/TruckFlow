const ApiError = require("../utils/apiError")

async function verifyAccessToken(req, res, next) {
    try {
        const token = req.headers.authorization;
        if (!token && !token.startsWith('Bearer ')) {
            throw new ApiError('access denied , log in first', 401);
        }
        const jwt = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id)
        if (!user || user.statut === 'suspendu') {
            throw new ApiError('user not found or suspended', 401);
        }
        req.user = user;
        next();
    }
catch (err) {
    next(err);
}
}