//ToDo: implement logging

function errorHandler(err, req, res, next) {
    let resMessage = 'Internal server error:';
    switch (err.statusCode) {
        case 400:
            resMessage = err.userMessage == '' ? 'Bad request:' : err.userMessage;
            res.status(400).send(resMessage);
            break;
        case 401:
            resMessage = err.userMessage == '' ? 'Unauthorized:' : err.userMessage;
            res.status(401).send(resMessage);
            break;
        case 404:
            resMessage = err.userMessage == '' ? 'Not found:' : err.userMessage;
            res.status(404).send(resMessage);
            break;
        case 500:
            res.status(500).send(resMessage);
            break;
        default:
            res.status(500).send(`An unknown error has occured!`);
            break;
    }
}

function handleError(err, req, res) {
    errorHandler(err, req, res, null);
}

function AppError(statusCode, userMessage, internalMessage, innerError) {
    this.statusCode = statusCode;
    this.userMessage = userMessage;
    this.internalMessage = internalMessage;
    this.innerError = innerError;
    this.stack = new Error().stack;
}

module.exports = {
    AppError,
    handleError,
    errorHandler
}