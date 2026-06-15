import { execSync } from 'child_process';

try {
  const output = execSync('netstat -ano').toString();
  const lines = output.split('\n');
  let killed = false;
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 5 && parts[1].endsWith(':3000')) {
      const pid = parseInt(parts[4], 10);
      if (pid && pid !== process.pid) {
        console.log(`Killing process ${pid} using port 3000...`);
        try {
          process.kill(pid, 'SIGKILL');
          console.log(`Successfully killed process ${pid}.`);
          killed = true;
        } catch (err) {
          console.error(`Failed to kill process ${pid}:`, err.message);
        }
      }
    }
  }
  if (!killed) {
    console.log("No other process was found listening on port 3000.");
  }
} catch (e) {
  console.log("Error finding/killing process on port 3000:", e.message);
}
