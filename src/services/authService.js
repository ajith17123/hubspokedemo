/* ==========================================================================
   Auth Service: User Authentication & Role Management
   ========================================================================== */

const AUTH_USER_KEY = 'lims_auth_user';

export const DEMO_USERS = [
  {
    username: 'spoke',
    password: 'spoke123',
    role: 'spoke',
    roleName: 'Spoke Front Desk / Phlebotomist',
    branch: 'CD Spoke',
    location: 'Vijayawada',
    welcomeName: 'cdspoke'
  },
  {
    username: 'hub',
    password: 'hub123',
    role: 'hub',
    roleName: 'Central Hub Laboratory Tech',
    branch: 'Central Hub Laboratory',
    location: 'Vijayawada Central',
    welcomeName: 'hubuser'
  },
  {
    username: 'pathologist',
    password: 'path123',
    role: 'pathologist',
    roleName: 'Senior Pathologist',
    branch: 'Central Hub Laboratory',
    location: 'Vijayawada Central',
    welcomeName: 'pathologist'
  }
];

export const getCurrentUser = () => {
  try {
    const stored = localStorage.getItem(AUTH_USER_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error parsing auth user from storage:', e);
  }
  // Default fallback user (Spoke)
  return DEMO_USERS[0];
};

export const login = (username, password, selectedRole) => {
  const user = DEMO_USERS.find(
    (u) =>
      u.username.toLowerCase() === username.toLowerCase().trim() &&
      u.password === password &&
      (!selectedRole || u.role === selectedRole)
  );

  if (!user) {
    throw new Error('Invalid credentials or role selection.');
  }

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  return user;
};

export const logout = () => {
  localStorage.removeItem(AUTH_USER_KEY);
};

export const switchDemoRole = (role) => {
  const user = DEMO_USERS.find((u) => u.role === role);
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return user;
  }
  return getCurrentUser();
};
