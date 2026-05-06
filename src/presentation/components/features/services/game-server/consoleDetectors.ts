const ANSI_REGEX = /\x1b\[[0-9;]*m/g;
const BRACKET_ANSI_REGEX = /\[\d+(?:;\d+)*m/g;

export function stripAnsi(text: string): string {
  return text.replace(ANSI_REGEX, "").replace(BRACKET_ANSI_REGEX, "");
}

/** Java 17 = 61, Java 21 = 65, Java 25 = 69 */
function classFileVersionToJava(classFileVersion: number): number {
  return classFileVersion - 44;
}

export function detectJavaVersionError(line: string): number | null {
  const clean = stripAnsi(line);

  const classFileMatch = clean.match(/class file version (\d+)\.0/i);
  if (classFileMatch) {
    const java = classFileVersionToJava(parseInt(classFileMatch[1], 10));
    if (java > 0 && java <= 99) return java;
  }

  const genericPatterns = [
    /unsupportedclassversionerror/i,
    /has been compiled by a more recent version of the java runtime/i,
    /requires java\s*(se\s*)?\d+/i,
    /incompatible java version/i,
    /the java version running on this system is not supported/i,
    /unsupported java version/i,
  ];

  if (genericPatterns.some((p) => p.test(clean))) {
    return 0;
  }

  return null;
}

const EULA_PATTERNS = [
  /you need to agree to the eula/i,
  /go to eula\.txt for more info/i,
  /eula\.txt/i,
  /eula=false/i,
  /failed to load eula\.txt/i,
];

export function detectEulaRequiredFromLog(line: string): boolean {
  const clean = stripAnsi(line);
  return EULA_PATTERNS.some((p) => p.test(clean));
}
