import { Client, Databases, Storage } from 'appwrite';

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
  throw new Error('Missing Appwrite configuration in environment variables');
}

export const client = new Client();

client
  .setEndpoint(endpoint)
  .setProject(projectId);

export const databases = new Databases(client);
export const storage = new Storage(client);

export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const PROJECTS_COLLECTION_ID = import.meta.env.VITE_PROJECTS_COLLECTION_ID;
export const COLLECTION_CV_EXPORTS_ID =
  import.meta.env.VITE_APPWRITE_CV_EXPORTS_COLLECTION_ID || 'cv_exports';
export const PROJECT_IMAGES_BUCKET_ID =
  import.meta.env.VITE_PROJECT_IMAGES_BUCKET_ID ||
  import.meta.env.VITE_APPWRITE_PROJECT_IMAGES_BUCKET_ID ||
  '69f560c10024e23d036e';
