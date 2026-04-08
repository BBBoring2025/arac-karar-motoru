/**
 * /api/build-info — Build Metadata Endpoint
 *
 * Döndürür:
 *   - commit / commitShort / branch — Vercel auto-injected git metadata
 *   - env: production | preview | development | local
 *   - builtAt: module init ISO timestamp (lambda cold start ~ deploy time)
 *   - nextVersion: Next.js version from package.json
 *   - nodeVersion: process.versions.node
 *   - deploymentId / region: Vercel runtime info
 *
 * Kaynak: Vercel auto env vars (hiçbir custom build script gerektirmez)
 *   - VERCEL_GIT_COMMIT_SHA
 *   - VERCEL_GIT_COMMIT_REF
 *   - VERCEL_GIT_COMMIT_MESSAGE
 *   - VERCEL_ENV
 *   - VERCEL_DEPLOYMENT_ID
 *   - VERCEL_REGION
 *
 * Local dev: "unknown" / "local-dev" döner, asla crash etmez.
 */

import nextPkg from 'next/package.json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Module init time — lambda cold start'ta set edilir, deploy zamanını yakalar
const BUILT_AT = new Date().toISOString();

interface BuildInfo {
  commit: string;
  commitShort: string;
  commitMessage: string;
  branch: string;
  env: string;
  builtAt: string;
  nextVersion: string;
  nodeVersion: string;
  deploymentId: string;
  region: string;
}

export async function GET() {
  const commit = process.env.VERCEL_GIT_COMMIT_SHA || 'local-dev';
  const commitShort = commit !== 'local-dev' ? commit.substring(0, 7) : 'local-dev';

  const info: BuildInfo = {
    commit,
    commitShort,
    commitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE || 'local development',
    branch: process.env.VERCEL_GIT_COMMIT_REF || 'main',
    env: process.env.VERCEL_ENV || 'development',
    builtAt: BUILT_AT,
    nextVersion: nextPkg.version,
    nodeVersion: process.versions.node,
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'local',
    region: process.env.VERCEL_REGION || 'local',
  };

  return Response.json(info, { status: 200 });
}
