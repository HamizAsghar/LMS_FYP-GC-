import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import User from '@/models/User';

const JWT_SECRET = () => process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production';

export async function authMiddleware(req, allowedRoles = null) {
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

    if (allowedRoles && !allowedRoles.includes(decoded.role)) {
      return {
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied for your role',
        status: 403,
      };
    }

    await dbConnect();
    const user = await User.findById(decoded.id).select('-password');
    if (!user || user.status !== 'Active') {
      return {
        success: false,
        error: 'FORBIDDEN',
        message: 'Account not found or inactive',
        status: 403,
      };
    }

    return {
      success: true,
      user: {
        id: user._id.toString(),
        role: user.role,
        email: user.email,
        name: user.name,
      },
      dbUser: user,
      status: 200,
    };
  } catch {
    return {
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Invalid or expired token',
      status: 401,
    };
  }
}

export function successResponse(data, message = 'Success', status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function errorResponse(message, error = 'SERVER_ERROR', status = 500) {
  return NextResponse.json({ success: false, message, error }, { status });
}
