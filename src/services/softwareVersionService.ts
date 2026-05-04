import ApiService from './apiClient';

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * All software identifiers recognised by GET /api/software/{identifier}/versions.
 *
 * Backend source map:
 *  paper      → https://api.papermc.io/v2/projects/paper                              (JSON .versions[])
 *  velocity   → https://api.papermc.io/v2/projects/velocity                           (JSON .versions[])
 *  folia      → https://api.papermc.io/v2/projects/folia                              (JSON .versions[])
 *  purpur     → https://api.purpurmc.org/v2/purpur                                    (JSON .versions[])
 *  vanilla    → https://launchermeta.mojang.com/mc/game/version_manifest.json         (JSON .versions[] filtered type=release)
 *  bedrock    → same as vanilla (Bedrock naming matches Java releases)
 *  fabric     → https://meta.fabricmc.net/v1/versions/game                            (JSON[].version)
 *  quilt      → https://meta.quiltmc.org/v3/versions/game                             (JSON[].version)
 *  forge      → https://maven.minecraftforge.net/.../maven-metadata.xml               (XML versioning>versions>version)
 *  neoforge   → https://maven.neoforged.net/.../maven-metadata.xml                   (XML versioning>versions>version)
 *  arclight   → https://maven.islight.cc/.../arclight-forge/maven-metadata.xml       (XML versioning>versions>version)
 *  sponge     → https://repo.spongepowered.org/.../spongevanilla/maven-metadata.xml  (XML versioning>versions>version)
 *  spigot     → https://api.spiget.org/v2/resources/1/versions                       (JSON[].name)
 *  bungeecord → https://api.spiget.org/v2/resources/2/versions                       (JSON[].name)
 *  nukkit     → https://ci.opencollab.io/job/NukkitProject/.../api/json              (builds list)
 */
export type SoftwareIdentifier =
  // PaperMC family
  | 'paper'
  | 'velocity'
  | 'folia'
  // Purpur family
  | 'purpur'
  // Vanilla / Mojang
  | 'vanilla'
  | 'bedrock'
  // Modded — Fabric-based
  | 'fabric'
  | 'quilt'
  // Modded — Forge/Maven
  | 'forge'
  | 'neoforge'
  | 'arclight'
  | 'sponge'
  // Spigot / BungeeCord (Spiget API)
  | 'spigot'
  | 'bungeecord'
  // Nukkit (Bedrock server)
  | 'nukkit';

export interface SoftwareVersionsResponse {
  success:    boolean;
  identifier: string;
  /** Primary field — API returns versions here */
  data:       string[];
  /** Legacy field — kept for backward compat */
  versions?:  string[];
  cached:     boolean;
  source?:    string;
  message?:   string;
}

// ── Egg name → identifier mapping ────────────────────────────────────────────
// Exact matches (lowercase) have priority, then fuzzy keyword scan.

const EXACT_MAP: Record<string, SoftwareIdentifier> = {
  // Paper family
  'paper':              'paper',
  'paper mc':           'paper',
  'folia':              'folia',
  'velocity':           'velocity',

  // Purpur family (purpur-geyser uses same upstream API)
  'purpur':             'purpur',
  'purpur mc':          'purpur',
  'purpur-geyser':      'purpur',
  'purpur geyser':      'purpur',
  'purpur geyser floodgate': 'purpur',
  'purpur-geyser-floodgate': 'purpur',

  // Fabric / Quilt
  'fabric':             'fabric',
  'fabric mc':          'fabric',
  'quilt':              'quilt',
  'quilt mc':           'quilt',

  // Forge / Maven-based
  'forge':              'forge',
  'minecraft forge':    'forge',
  'forge mc':           'forge',
  'neoforge':           'neoforge',
  'neo forge':          'neoforge',
  'arclight':           'arclight',
  'sponge':             'sponge',
  'spongevanilla':      'sponge',
  'sponge vanilla':     'sponge',

  // Vanilla Java
  'vanilla':            'vanilla',
  'vanilla java':       'vanilla',
  'java':               'vanilla',

  // Bedrock
  'bedrock':            'bedrock',
  'vanilla bedrock':    'bedrock',

  // Spigot / BungeeCord
  'spigot':             'spigot',
  'bungeecord':         'bungeecord',
  'bungee':             'bungeecord',
  'bungee cord':        'bungeecord',

  // Nukkit
  'nukkit':             'nukkit',
};

// Fuzzy keyword scan — more specific first to avoid false matches
const FUZZY_KEYWORDS: [string, SoftwareIdentifier][] = [
  ['neoforge',    'neoforge'],
  ['neo forge',   'neoforge'],
  ['arclight',    'arclight'],
  ['sponge',      'sponge'],
  ['purpur',      'purpur'],
  ['folia',       'folia'],
  ['velocity',    'velocity'],
  ['quilt',       'quilt'],
  ['fabric',      'fabric'],
  ['forge',       'forge'],
  ['bungeecord',  'bungeecord'],
  ['bungee',      'bungeecord'],
  ['spigot',      'spigot'],
  ['nukkit',      'nukkit'],
  ['bedrock',     'bedrock'],
  ['paper',       'paper'],
  ['vanilla',     'vanilla'],
  ['java',        'vanilla'],
];

/**
 * Returns the SoftwareIdentifier for a given egg name (case-insensitive).
 * Tries exact match first, then fuzzy keyword scan.
 * Returns null if no match found.
 */
export const eggNameToIdentifier = (eggName: string): SoftwareIdentifier | null => {
  if (!eggName) return null;
  const key = eggName.trim().toLowerCase();

  // 1. Exact match
  if (EXACT_MAP[key]) return EXACT_MAP[key];

  // 2. Fuzzy: check if the name contains a known keyword
  for (const [keyword, id] of FUZZY_KEYWORDS) {
    if (key.includes(keyword)) return id;
  }

  return null;
};

// ── Service ───────────────────────────────────────────────────────────────────

const softwareVersionService = {
  /**
   * GET /api/software/{identifier}/versions
   * Falls back to ["latest"] on any error — never throws.
   */
  getVersions: async (identifier: SoftwareIdentifier): Promise<string[]> => {
    try {
      const res  = await ApiService.get(`/software/${identifier}/versions`);
      const body = res.data as SoftwareVersionsResponse;

      // API returns list under "data"; fall back to "versions" for compat
      const raw = Array.isArray(body.data) && body.data.length > 0
        ? body.data
        : Array.isArray(body.versions) && (body.versions?.length ?? 0) > 0
          ? body.versions!
          : null;

      return body.success && raw ? raw : ['latest'];
    } catch {
      return ['latest'];
    }
  },
};

export default softwareVersionService;

// ── Java version utilities ────────────────────────────────────────────────────

/**
 * Compares two semver strings (e.g. "1.20.5" vs "1.17").
 * Returns positive if a > b, negative if a < b, 0 if equal.
 */
function compareSemver(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/**
 * Returns the Java version (8 | 17 | 21 | 25) required by a given Minecraft version string.
 *
 * Thresholds (must stay in sync with config/minecraft.php java_thresholds):
 *   >= 1.22   → Java 25
 *   >= 1.20.5 → Java 21
 *   >= 1.17   → Java 17
 *   < 1.17    → Java 8  (shown as 17 since that's our minimum supported)
 *
 * Non-semver strings ("latest", "build-673") are treated as Java 21 (modern default).
 */
export function getRequiredJavaVersion(version: string): 8 | 17 | 21 | 25 {
  if (!version || version === 'latest') return 21;

  const match = version.match(/^(\d+\.\d+(?:\.\d+)?)/);
  if (!match) return 21; // non-semver → modern default

  const semver = match[1];

  if (compareSemver(semver, '1.22') >= 0)   return 25;
  if (compareSemver(semver, '1.20.5') >= 0)  return 21;
  if (compareSemver(semver, '1.17') >= 0)    return 17;
  return 8;
}
