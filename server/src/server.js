import cluster from 'node:cluster';
import os from 'node:os';
import { config } from './config/env.js';
import { logger, prisma, redis } from './lib/core.js';

/**
 * Process model
 *  • CLUSTER=true runs one worker per CPU core (or WEB_CONCURRENCY). A crashed worker is replaced
 *    immediately, so a single bad request can never take the whole API down.
 *  • SIGTERM/SIGINT → graceful shutdown: readiness turns 503 so the load balancer stops sending
 *    traffic, in-flight requests finish, then DB/Redis connections close. Rolling deploys therefore
 *    have no downtime.
 */
const workers = config.WEB_CONCURRENCY || os.availableParallelism();

if (config.CLUSTER && cluster.isPrimary) {
  logger.info({ workers }, 'starting API cluster');
  for (let i = 0; i < workers; i += 1) cluster.fork();
  let stopping = false;
  cluster.on('exit', (w, code, signal) => {
    if (stopping) return;
    logger.error({ pid: w.process.pid, code, signal }, 'worker died — starting a replacement');
    cluster.fork();
  });
  const stop = (sig) => { stopping = true; logger.info({ sig }, 'stopping cluster'); for (const w of Object.values(cluster.workers)) w?.process.kill(sig); };
  process.on('SIGTERM', () => stop('SIGTERM'));
  process.on('SIGINT', () => stop('SIGINT'));
} else {
  const { createApp } = await import('./app.js');
  const app = createApp();
  const server = app.listen(config.PORT, () => logger.info({ port: config.PORT, pid: process.pid, env: config.NODE_ENV }, 'API listening'));
  // Keep-alive longer than typical load-balancer idle timeouts (avoids 502s on reused sockets).
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;
  server.requestTimeout = 30_000;

  let closing = false;
  const shutdown = async (sig) => {
    if (closing) return; closing = true;
    app.locals.shuttingDown = true;
    logger.info({ sig }, 'draining connections');
    const force = setTimeout(() => { logger.error('forced shutdown after timeout'); process.exit(1); }, 25_000).unref();
    server.close(async () => {
      await Promise.allSettled([prisma.$disconnect(), redis?.quit()]);
      clearTimeout(force);
      logger.info('shutdown complete');
      process.exit(0);
    });
    server.closeIdleConnections?.();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (e) => logger.error({ err: e }, 'unhandled rejection'));
  process.on('uncaughtException', (e) => { logger.fatal({ err: e }, 'uncaught exception — restarting'); shutdown('uncaughtException'); });
}
