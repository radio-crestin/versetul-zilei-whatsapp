const fs = require('fs');

const content = fs.readFileSync('.prod.vars', 'utf8');
const secrets = {};

content.trim().split('\n').forEach(line => {
  if (!line || line.startsWith('#')) return;
  const i = line.indexOf('=');
  if (i > 0) {
    const key = line.slice(0, i);
    const value = line.slice(i + 1).replace(/^"|"$/g, '');
    secrets[key] = value;
  }
});

console.log(JSON.stringify(secrets));
