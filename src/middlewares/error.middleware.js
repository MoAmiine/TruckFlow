const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'unexpected error';

    // Gestion propre des erreurs JWT
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Token invalide, veuillez vous reconnecter';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Votre session a expiré, veuillez vous reconnecter';
    } else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Format d’identifiant invalide';
    }

    res.status(statusCode).json({
        status: statusCode >= 500 ? 'error' : 'fail',
        statusCode: statusCode,
        message: message
    });
};

module.exports = errorHandler;
