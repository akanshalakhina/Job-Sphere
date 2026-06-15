import fs from 'fs';
const log = fs.readFileSync('C:\\Users\\sukri\\.gemini\\antigravity\\brain\\4e383441-6248-4cbe-91f3-89f50a5ca006\\.system_generated\\tasks\\task-444.log', 'utf8');
const lines = log.split('\n');
const matches = lines.filter(line => line.includes('DEBUG getRequestUserId') || line.includes('x-mock-user-id'));
console.log('Matches:', matches.slice(-20));
