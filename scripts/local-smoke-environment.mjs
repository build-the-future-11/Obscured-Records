/** Empty values prevent Next's dotenv loader from restoring production intake
 * credentials from .env.local. Synthetic browser/server tests must fail closed.
 * Workers persistence tests use their separate, explicitly local D1 binding.
 */
export function localSmokeEnvironment(environment, revision) {
  return {
    ...environment,
    NODE_ENV: 'production',
    VERCEL: '1',
    VERCEL_GIT_COMMIT_SHA: revision ?? '',
    CLOUDFLARE_ACCOUNT_ID: '',
    CLOUDFLARE_D1_DATABASE_ID: '',
    CLOUDFLARE_D1_API_TOKEN: '',
    NEXT_TELEMETRY_DISABLED: '1',
  };
}
