import ActivityLog from '@/models/ActivityLog';

export async function logActivity({ userId, role, action, target, ipAddress }) {
  try {
    await ActivityLog.create({
      user: userId,
      role,
      action,
      target: target || '',
      ipAddress: ipAddress || '',
    });
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
}
