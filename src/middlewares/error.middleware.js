const errorHandler = (err, req, res, next) =>{
const statusCode = err.statusCode ||500;
res.status(statusCode).json({
    status : 'error',
    statusCode : statusCode,
    message : err.message || 'unexpected error'
});
}

module.exports = errorHandler;