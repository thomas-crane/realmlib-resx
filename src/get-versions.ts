import { Endpoints } from './endpoints';
import { get } from './http-client';

/**
 * Information about the local version of the assets.
 */
interface VersionInfo {
  clientVersion: string;
  assetVersion: string;
}

/**
 * Gets the latest client version.
 */
export async function getClientVersion(): Promise<string> {
  const result = await get(Endpoints.VERSION);
  return result.toString();
}

/**
 * Gets the latest asset version.
 */
export async function getAssetVersion(): Promise<string> {
  const result = await get(Endpoints.STATIC_DRIPS + '/current/version.txt');
  return result.toString();
}

/**
 * Gets the latest version of both the client and the assets.
 */
export async function getVersions(): Promise<VersionInfo> {
  const [clientVersion, assetVersion] = await Promise.all([
    getClientVersion(),
    getAssetVersion(),
  ]);
  return { clientVersion, assetVersion };
}
