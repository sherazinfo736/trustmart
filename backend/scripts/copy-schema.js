// Cross-platform replacement for `cp src/db/schema.sql dist/db/schema.sql`.
// Windows doesn't have a `cp` command by default, so the build script calls
// this instead — works identically on Windows, macOS, and Linux.
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'src', 'db', 'schema.sql');
const destDir = path.join(__dirname, '..', 'dist', 'db');
const dest = path.join(destDir, 'schema.sql');

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log('Copied schema.sql -> dist/db/schema.sql');
