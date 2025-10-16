// API Response standardization
class ApiResponse {
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      status: 'success',
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
    const response = {
      status: 'error',
      message,
      timestamp: new Date().toISOString()
    };

    if (errors) {
      response.errors = errors;
    }

    if (process.env.NODE_ENV === 'development' && errors?.stack) {
      response.stack = errors.stack;
    }

    return res.status(statusCode).json(response);
  }

  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      status: 'success',
      message,
      data,
      pagination,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = ApiResponse;