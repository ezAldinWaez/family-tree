// class AppError extends Error {
//   constructor(message, statusCode) {
//     super(message);
//     this.statusCode = statusCode;
//     this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
//     Error.captureStackTrace(this, this.constructor);
//   }
// }

// class NotFoundError extends AppError {
//   constructor(message) {
//     super(message || "Resource not found", 404);
//   }
// }

// class ValidationError extends AppError {
//   constructor(message) {
//     super(message || "Validation failed", 400);
//   }
// }

// module.exports = {
//   AppError,
//   NotFoundError,
//   ValidationError,
// };
