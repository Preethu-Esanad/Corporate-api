exports.sendSuccessResponse = (res, message = "Success", status = 200, flag = true) => {
  const response = { ...(typeof message === "object" ? message : { message }) };
  return res.status(status).json({ ...(flag ? { success: true } : {}), ...response });
};

exports.sendErrorResponse = (res, message = "Internal Server Error", status = 500, flag = true, customError = false) => {
  let response;
  if (customError === true) {
    response = { ...(typeof message === "object" ? message : { message }) };
  } else {
    const detail = typeof message === "object" ? message?.message || JSON.stringify(message) : message;
    console.error("Unhandled error:", detail);
    response = { message: "An error occurred. Please contact support or try again later." };
  }
  return res.status(status).json({ ...(flag ? { success: false } : {}), ...response });
};
