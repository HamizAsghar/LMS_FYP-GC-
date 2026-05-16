import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import User from '@/models/User';

const JWT_SECRET = () => process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production';

export async function adminAuthMiddleware(req) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return {
        success: false,
        error: 'UNAUTHORIZED',
        message: 'No authentication token provided',
        status: 401,
      };
    }

    const decoded = jwt.verify(token, JWT_SECRET());

    if (decoded.role !== 'Admin') {
      return {
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied. Admin role required.',
        status: 403,
      };
    }

    await dbConnect();
    const user = await User.findById(decoded.id).select('-password');
    if (!user || user.role !== 'Admin' || user.status !== 'Active') {
      return {
        success: false,
        error: 'FORBIDDEN',
        message: 'Invalid admin account',
        status: 403,
      };
    }

    return {
      success: true,
      user: { id: user._id.toString(), role: user.role, email: user.email },
      status: 200,
    };
  } catch (error) {
    return {
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Invalid or expired token',
      status: 401,
    };
  }
}

export function validateRequest(data, schema) {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    if (value !== undefined && value !== null && rules.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== rules.type) {
        errors.push(`${field} must be of type ${rules.type}`);
      }
    }

    if (value && rules.enum && !rules.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
    }

    if (value && rules.minLength && String(value).length < rules.minLength) {
      errors.push(`${field} must be at least ${rules.minLength} characters`);
    }

    if (value && rules.maxLength && String(value).length > rules.maxLength) {
      errors.push(`${field} must not exceed ${rules.maxLength} characters`);
    }

    if (value !== undefined && rules.min !== undefined && value < rules.min) {
      errors.push(`${field} must be at least ${rules.min}`);
    }

    if (value && rules.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push(`${field} must be a valid email`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function successResponse(data, message = 'Success', status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function errorResponse(message, error = 'SERVER_ERROR', status = 500) {
  return NextResponse.json({ success: false, message, error }, { status });
}

export function parseQueryParams(searchParams) {
  return {
    page: parseInt(searchParams.get('page')) || 1,
    limit: Math.min(parseInt(searchParams.get('limit')) || 20, 100),
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') === 'asc' ? 1 : -1,
  };
}

export function calculatePagination(total, page, limit) {
  return { total, page, limit, pages: Math.ceil(total / limit) || 1 };
}

export function handleDbError(error) {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'field';
    return { message: `${field} already exists`, error: 'DUPLICATE_ENTRY', status: 400 };
  }
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((err) => err.message);
    return { message: messages.join(', '), error: 'VALIDATION_ERROR', status: 400 };
  }
  if (error.name === 'CastError') {
    return { message: 'Invalid ID format', error: 'INVALID_REQUEST', status: 400 };
  }
  return { message: error.message || 'Database error', error: 'SERVER_ERROR', status: 500 };
}
