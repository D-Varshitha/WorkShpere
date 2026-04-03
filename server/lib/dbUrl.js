import dns from 'dns';

/**
 * Prefer IPv4 when resolving hostnames (common fix for ECONNRESET on Windows + Supabase).
 */
export function preferIpv4First() {
  if (process.env.DB_FORCE_IPV4 === 'false') return;
  try {
    dns.setDefaultResultOrder('ipv4first');
  } catch {
    /* Node < 17 or unsupported */
  }
}

/**
 * Remove sslmode/ssl query params so `pg` does not fight with Sequelize `dialectOptions.ssl`.
 */
export function normalizePostgresUrl(url) {
  if (!url || typeof url !== 'string') return url;
  try {
    const u = new URL(url.replace(/^postgresql:/i, 'http:').replace(/^postgres:/i, 'http:'));
    u.searchParams.delete('sslmode');
    u.searchParams.delete('ssl');

    // Supabase "transaction pooler" host (pooler.*) can cause issues for some clients.
    // Prefer direct connection host (db.*) and default port 5432.
    if (/pooler\./i.test(u.hostname) && /\.supabase\.co$/i.test(u.hostname)) {
      u.hostname = u.hostname.replace(/^pooler\./i, 'db.');
      if (u.port === '6543') u.port = '5432';
    }

    return u.toString().replace(/^http:/i, 'postgres:');
  } catch {
    return url;
  }
}

export function parseConnectionInfoFromUrl(url) {
  if (!url) return { host: null, port: null, database: null, isTransactionPooler: false };
  try {
    const u = new URL(url.replace(/^postgresql:/i, 'http:').replace(/^postgres:/i, 'http:'));
    const port = u.port || '5432';
    const isTransactionPooler =
      /pooler\.supabase\.com/i.test(u.hostname) && port === '6543';
    return {
      host: u.hostname,
      port,
      database: (u.pathname || '').replace(/^\//, '').split('/')[0] || null,
      isTransactionPooler
    };
  } catch {
    return { host: null, port: null, database: null, isTransactionPooler: false };
  }
}
