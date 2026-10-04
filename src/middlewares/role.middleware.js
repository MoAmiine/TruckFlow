const ApiError = require("../utils/apiError")

function restrictTo(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new ApiError("You don't have the permission to do this action", 403)
        }
        next();
    }
}

module.exports = { restrictTo };