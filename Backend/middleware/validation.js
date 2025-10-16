const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Student validation rules
const validateStudent = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Phone number must not exceed 20 characters'),
  body('student_id')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Student ID must be between 3 and 50 characters'),
  body('class')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Class must not exceed 100 characters'),
  body('section')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Section must not exceed 10 characters'),
  body('date_of_birth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date (YYYY-MM-DD)'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Address must not exceed 1000 characters'),
  body('parent_name')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Parent name must not exceed 255 characters'),
  body('parent_phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Parent phone must not exceed 20 characters'),
  body('parent_email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid parent email is required'),
  handleValidationErrors
];

// Attendance validation rules
const validateAttendance = [
  body('student_id')
    .isInt({ min: 1 })
    .withMessage('Valid student ID is required'),
  body('date')
    .isDate()
    .withMessage('Valid date is required (YYYY-MM-DD)'),
  body('status')
    .isIn(['present', 'absent', 'late'])
    .withMessage('Status must be present, absent, or late'),
  body('marked_by')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Marked by must not exceed 100 characters'),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Remarks must not exceed 500 characters'),
  handleValidationErrors
];

// Activity validation rules
const validateActivity = [
  body('student_id')
    .isInt({ min: 1 })
    .withMessage('Valid student ID is required'),
  body('activity_name')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Activity name must be between 3 and 200 characters'),
  body('activity_type')
    .isIn(['academic', 'sports', 'cultural', 'technical', 'other'])
    .withMessage('Activity type must be academic, sports, cultural, technical, or other'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('activity_date')
    .isDate()
    .withMessage('Valid activity date is required (YYYY-MM-DD)'),
  body('points')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Points must be between 0 and 100'),
  body('status')
    .optional()
    .isIn(['participated', 'won', 'completed', 'pending'])
    .withMessage('Status must be participated, won, completed, or pending'),
  body('recorded_by')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Recorded by must not exceed 100 characters'),
  handleValidationErrors
];

// ID parameter validation
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid ID is required'),
  handleValidationErrors
];

// Date range validation
const validateDateRange = [
  query('start_date')
    .optional()
    .isDate()
    .withMessage('Valid start date is required (YYYY-MM-DD)'),
  query('end_date')
    .optional()
    .isDate()
    .withMessage('Valid end date is required (YYYY-MM-DD)'),
  handleValidationErrors
];

module.exports = {
  validateStudent,
  validateAttendance,
  validateActivity,
  validateId,
  validateDateRange,
  handleValidationErrors
};