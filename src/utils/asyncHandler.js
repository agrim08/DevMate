/**
 * A wrapper function to handle asynchronous route handlers and middleware.
 * It catches any errors and passes them to the next error-handling middleware.
 * 
 * @param {Function} requestHandler - The asynchronous function to wrap.
 * @returns {Function} - A function that executes the request handler and catches errors.
 */
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};

export { asyncHandler };
