const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET'];

const OPTIONAL_ENV = [
  'FRONTEND_URL',
  'GOOGLE_MAPS_API_KEY',
  'GOOGLE_MAPS_BROWSER_KEY',
  'GOOGLE_OAUTH_CLIENT_ID',
  'GOOGLE_OAUTH_CLIENT_SECRET',
  'GOOGLE_OAUTH_CALLBACK_URL',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'EMAIL_FROM',
  'ANTHROPIC_API_KEY',
  'PRICE_ALERT_CRON',
  'API_RATE_LIMIT_MAX',
  'GENERATION_RATE_LIMIT_MAX',
  'CAB_BASE_FARE',
  'CAB_PER_KM_FARE',
  'BUS_NON_AC_PER_KM',
  'BUS_AC_PER_KM',
  'FLIGHT_BASE_FARE',
  'FLIGHT_PER_KM',
];

export const validateEnv = () => {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET === 'your-jwt-secret-change-this-in-production') {
      throw new Error('JWT_SECRET must be changed for production');
    }
    const requiredProdEnv = ['GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_OAUTH_CLIENT_SECRET', 'GOOGLE_OAUTH_CALLBACK_URL'];
    const missingProd = requiredProdEnv.filter((name) => !process.env[name]);
    if (missingProd.length > 0) {
      throw new Error(`Missing required production environment variables: ${missingProd.join(', ')}`);
    }
  }

  const disabled = OPTIONAL_ENV.filter((name) => !process.env[name]);
  if (disabled.length > 0 && process.env.NODE_ENV !== 'test') {
    console.warn(`Optional environment variables not set: ${disabled.join(', ')}`);
  }
};
