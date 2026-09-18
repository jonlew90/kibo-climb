// tests/setup.js
// Ensure mock environment variables exist for test runner environments where .env is not committed (e.g. GitHub Actions CI)
if (!process.env.VITE_FIREBASE_API_KEY) {
  process.env.VITE_FIREBASE_API_KEY = 'mock_firebase_api_key_for_ci_tests';
  process.env.VITE_FIREBASE_AUTH_DOMAIN = 'mock-app.firebaseapp.com';
  process.env.VITE_FIREBASE_PROJECT_ID = 'mock-project';
  process.env.VITE_FIREBASE_STORAGE_BUCKET = 'mock-app.firebasestorage.app';
  process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = '123456789';
  process.env.VITE_FIREBASE_APP_ID = '1:123456789:web:abcdef123456';
  process.env.VITE_FIREBASE_MEASUREMENT_ID = 'G-MOCKMEASURE';
}
