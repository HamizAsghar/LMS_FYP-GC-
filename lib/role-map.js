export function uiRoleToApi(role) {
  const map = {
    student: 'Student',
    instructor: 'Instructor',
    admin: 'Admin',
    Student: 'Student',
    Instructor: 'Instructor',
    Admin: 'Admin',
  };
  return map[role] || role;
}

export function apiRoleToUi(role) {
  const map = {
    Student: 'student',
    Instructor: 'instructor',
    Admin: 'admin',
  };
  return map[role] || 'student';
}

export function dashboardPathForRole(role) {
  const ui = apiRoleToUi(role);
  if (ui === 'admin') return '/admin/dashboard';
  if (ui === 'instructor') return '/instructor/dashboard';
  return '/student/dashboard';
}
