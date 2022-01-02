require('dotenv').config();
const env = process.env;

const firebaseSdk = {
  type: 'service_account',
  project_id: env.FIREBASE_SDK_PROJECT_ID,
  private_key_id: env.FIREBASE_SDK_PRIVATE_KEY_ID,
  private_key: JSON.parse(`"${env.FIREBASE_SDK_PRIVATE_KEY}"`),
  client_email: env.FIREBASE_SDK_CLIENT_EMAIL,
  client_id: env.FIREBASE_SDK_CLIENT_ID,
  auth_uri: env.FIREBASE_SDK_AUTH_URI,
  token_uri: env.FIREBASE_SDK_TOKEN_URI,
  auth_provider_x509_cert_url: env.FIREBASE_SDK_AUTH_X509,
  client_x509_cert_url: env.FIREBASE_SDK_CLIENT_X509,
};

module.exports = firebaseSdk;
