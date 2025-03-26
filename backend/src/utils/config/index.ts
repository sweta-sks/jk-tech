export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  host: {
    url: process.env.HOST_URL || 'http://localhost:4000',
  },
  database: {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USERNAME || 'jk_user',
    password: process.env.DATABASE_PASSWORD || 'jk_password',
    name: process.env.DATABASE_NAME || 'jk_db',
    sync: process.env.DATABASE_SYNC || 'true',
    logging: process.env.DATABASE_LOGGING === 'true',
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@jkTech.com',
    password:
      process.env.ADMIN_PASSWORD ||
      '$2b$10$YHBNVu6Qgkk0JriIzumaxuC4uMfCPg/SmyHsXZSgtPey0r1MiyW9C',
    name: process.env.ADMIN_NAME || 'Admin',
  },
  token: {
    jwt: {
      secret: process.env.JWT_SECRET || 'jwtSecretKey',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
        issuer: process.env.JWT_ISSUER || 'jk-tech',
      },
    },
  },
  bcrypt: {
    salt: parseInt(process.env.BCRYPT_SALT, 10) || 10,
  },
});
