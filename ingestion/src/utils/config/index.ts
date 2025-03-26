export default () => ({
  rabbit: {
    url: process.env.RABBITMQ_URI,
    queue: process.env.RABBITMQ_QUEUE || 'ingestion-queue',
  },
});
