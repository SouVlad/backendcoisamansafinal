export const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
export const REFRESH_SECRET = process.env.REFRESH_SECRET || "refreshsecret";
export const JWT_EXPIRES_IN = "1d";
export const REFRESH_EXPIRES_IN = "7d";

export const SCHEDULE_OFFSET_DAYS = 3;
export const WINDOW_MINUTES = 60;

export const SMTP_CONFIG = {
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
};

export const GOOGLE_OAUTH_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  redirectUri: process.env.GOOGLE_REDIRECT_URI || "https://developers.google.com/oauthplayground",
};
