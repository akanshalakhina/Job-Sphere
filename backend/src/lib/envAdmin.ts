export const ENV_ADMIN_USER_ID = "env-admin";

export const getEnvAdminProfile = () => ({
  _id: ENV_ADMIN_USER_ID,
  clerkId: ENV_ADMIN_USER_ID,
  email: process.env.ADMIN_EMAIL || "admin@jobsphere.local",
  role: "admin",
  name: "Admin",
  title: "Platform Administrator",
  onboarded: true,
  savedJobs: [],
  skills: [],
  profileViews: 0,
  postImpressions: 0,
});

export const isEnvAdminLogin = (identifier: string, password: string): boolean => {
  const username = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  return Boolean(
    username &&
    adminPassword &&
    identifier.trim().toLowerCase() === username.toLowerCase() &&
    password === adminPassword,
  );
};

export const isEnvAdminUserId = (userId: string | null | undefined): boolean =>
  userId === ENV_ADMIN_USER_ID;
