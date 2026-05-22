const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const getEnvFilePath = () => path.join(process.cwd(), '.env.local');

const readEnvFile = (envFilePath) => {
  if (!fs.existsSync(envFilePath)) {
    throw new Error(`Missing .env.local at ${envFilePath}`);
  }

  return fs.readFileSync(envFilePath, 'utf8');
};

const parseEnvValue = (envFileContent, key) => {
  const lines = envFileContent.split(/\r?\n/);
  const matchingLine = lines.find((line) => {
    const trimmedLine = line.trim();

    if (trimmedLine.length === 0 || trimmedLine.startsWith('#')) {
      return false;
    }

    return trimmedLine.startsWith(`${key}=`);
  });

  if (matchingLine === undefined) {
    throw new Error(`Missing ${key} in .env.local`);
  }

  const rawValue = matchingLine.slice(matchingLine.indexOf('=') + 1).trim();

  if (rawValue.length === 0) {
    throw new Error(`${key} in .env.local is empty`);
  }

  const hasDoubleQuotes = rawValue.startsWith('"') && rawValue.endsWith('"');
  const hasSingleQuotes = rawValue.startsWith("'") && rawValue.endsWith("'");

  if (hasDoubleQuotes || hasSingleQuotes) {
    return rawValue.slice(1, -1);
  }

  return rawValue;
};

const runDbmate = (args, databaseUrl) => {
  const dbmateExecutablePath = process.platform === 'win32'
    ? path.join(os.homedir(), 'scoop', 'shims', 'dbmate.exe')
    : 'dbmate';

  const result = spawnSync(dbmateExecutablePath, args, {
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
    stdio: 'inherit',
  });

  if (result.error !== undefined) {
    throw result.error;
  }

  if (typeof result.status !== 'number') {
    throw new Error('dbmate exited without a status code');
  }

  process.exit(result.status);
};

const main = () => {
  const envFilePath = getEnvFilePath();
  const envFileContent = readEnvFile(envFilePath);
  const databaseUrl = parseEnvValue(envFileContent, 'DATABASE_URL');
  const args = process.argv.slice(2);

  runDbmate(args, databaseUrl);
};

main();
