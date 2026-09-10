const fs = require('fs');
const key = JSON.parse(fs.readFileSync('service-account.json')).private_key;
console.log(Buffer.from(key).toString('base64'));
