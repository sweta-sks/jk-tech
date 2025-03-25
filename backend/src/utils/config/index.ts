export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
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
});
