import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

/**
 * Middleware to verify JWT token and student role
 */
export async function studentAuthMiddleware(req) {
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
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production'
      );

      if (decoded.role !== 'Student') {
        return {
          success: false,
          error: 'FORBIDDEN',
          message: 'Access denied. Only students are allowed.',
          status: 403
        };
      }

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
