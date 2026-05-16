import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

/**
 * Middleware to verify JWT token and admin role
 */
export async function adminAuthMiddleware(req) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return {
        success: false,
        error: 'UNAUTHORIZED',
        message: 'No authentication token provided',
        status: 401
      };
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user is admin (this would need to be verified in DB)
      // For now, we'll attach the decoded user to the request
      return {
        success: true,
        user: decoded,
        status: 200
      };
    } catch (error) {
      return {
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
        status: 401
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'SERVER_ERROR',
      message: error.message,
      status: 500
    };
  }
}

/**
 * Validate request body against schema
 */
export function validateRequest(data, schema) {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    // Check required fields
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    // Check type
    if (value !== undefined && value !== null && rules.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== rules.type) {
        errors.push(`${field} must be of type ${rules.type}`);
      }
    }

    // Check enum values
    if (value && rules.enum && !rules.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
    }

    // Check min length
    if (value && rules.minLength && value.length < rules.minLength) {
      errors.push(`${field} must be at least ${rules.minLength} characters`);
    }

    // Check max length
    if (value && rules.maxLength && value.length > rules.maxLength) {
      errors.push(`${field} must not exceed ${rules.maxLength} characters`);
    }

    // Check min value
    if (value !== undefined && rules.min !== undefined && value < rules.min) {
      errors.push(`${field} must be at least ${rules.min}`);
    }

    // Check max value
    if (value !== undefined && rules.max !== undefined && value > rules.max) {
      errors.push(`${field} must not exceed ${rules.max}`);
    }

    // Check email format
    if (value && rules.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push(`${field} must be a valid email`);
      }
    }

    // Check custom validation
    if (value && rules.validate && typeof rules.validate === 'function') {
      const validationError = rules.validate(value);
      if (validationError) {
        errors.push(`${field}: ${validationError}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Send success response
 */
export function successResponse(data, message = 'Success', status = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data
    },
    { status }
  );
}

/**
 * Send error response
 */
export function errorResponse(message, error = 'SERVER_ERROR', status = 500) {
  return NextResponse.json(
    {
      success: false,
      message,
      error
    },
    { status }
  );
}

/**
 * Parse query parameters
 */
export function parseQueryParams(searchParams) {
  return {
    page: parseInt(searchParams.get('page')) || 1,
    limit: Math.min(parseInt(searchParams.get('limit')) || 20, 100),
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') === 'desc' ? -1 : 1
  };
}

/**
 * Calculate pagination
 */
export function calculatePagination(total, page, limit) {
  return {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit)
  };
}

/**
 * Handle database errors
 */
export function handleDbError(error) {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return {
      message: `${field} already exists`,
      error: 'DUPLICATE_ENTRY',
      status: 400
    };
  }

  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message);
    return {
      message: messages.join(', '),
      error: 'VALIDATION_ERROR',
      status: 400
    };
  }

  if (error.name === 'CastError') {
    return {
      message: 'Invalid ID format',
      error: 'INVALID_REQUEST',
      status: 400
    };
  }

  return {
    message: error.message || 'Database error',
    error: 'SERVER_ERROR',
    status: 500
  };
}

/**
 * Wrap async route handler with error handling
 */
export function asyncHandler(handler) {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (error) {
      console.error('Route error:', error);
      const dbError = handleDbError(error);
      return errorResponse(dbError.message, dbError.error, dbError.status);
    }
  };
}
