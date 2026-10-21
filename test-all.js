import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scriptPath = path.join(__dirname, 'backend', 'tests', 'system-test.js');
const child = spawn(process.execPath, [scriptPath], {
  stdio: 'inherit',
  cwd: __dirname,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
