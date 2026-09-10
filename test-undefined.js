const { cert } = require('firebase-admin/app');
try {
  cert({ projectId: 'civlens', clientEmail: 'test@example.com', privateKey: undefined });
  console.log("SUCCESS!");
} catch (e) {
  console.error("FAILED WITH UNDEFINED:", e.message);
}
try {
  cert({ projectId: 'civlens', clientEmail: 'test@example.com', privateKey: '' });
  console.log("SUCCESS!");
} catch (e) {
  console.error("FAILED WITH EMPTY STRING:", e.message);
}
