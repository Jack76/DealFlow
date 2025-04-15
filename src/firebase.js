import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  // 从Firebase控制台获取
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);