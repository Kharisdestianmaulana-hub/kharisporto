import { Query } from 'appwrite';
import { databases, storage, DATABASE_ID, PROJECTS_COLLECTION_ID, PROJECT_IMAGES_BUCKET_ID } from './appwrite';
import type { Bio, Project, TechStack, Service, SocialLink, Experience, Article, ChangelogEntry, Roadmap, GalleryItem } from '../types';

export interface ProjectImageAsset {
  id: string;
  name: string;
  url: string | null;
}

export const fetchBio = async (): Promise<Bio | null> => {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'public_bio');
    return (response.documents[0] as unknown) as Bio;
  } catch (error) {
    console.error('Failed to fetch bio:', error);
    return null;
  }
};

export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const response = await databases.listDocuments(DATABASE_ID, PROJECTS_COLLECTION_ID, [
      Query.orderDesc('$createdAt')
    ]);
    return (response.documents as unknown) as Project[];
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }
};

export const getProjectImageUrl = (project: Project): string | null => {
  const directUrl = project.cover_image_url || project.image_url;
  if (directUrl) return directUrl;
  if (!project.cover_image_id) return null;
  return getProjectImageUrlByValue(project.cover_image_id);
};

const getProjectImageUrlByValue = (value: string): string | null => {
  if (!value) return null;
  if (value.startsWith('http') || value.startsWith('/')) return value;
  if (!PROJECT_IMAGES_BUCKET_ID) return null;
  return storage.getFileView(PROJECT_IMAGES_BUCKET_ID, value).toString();
};

const collectStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return collectStringArray(parsed);
    } catch {
      return value.split(',').map(item => item.trim()).filter(Boolean);
    }
  }

  return [];
};

export const getProjectImageFiles = (project: Project): ProjectImageAsset[] => {
  const imageValues = [
    project.cover_image_id,
    ...collectStringArray(project.image_ids),
    project.cover_image_url,
    project.image_url,
    ...collectStringArray(project.image_urls),
  ].filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

  const uniqueImageValues = Array.from(new Set(imageValues));

  return uniqueImageValues.map((value, index) => ({
    id: value,
    name: `${project.title || 'Project'} Image ${index + 1}`,
    url: getProjectImageUrlByValue(value),
  }));
};

export const fetchSkills = async (): Promise<TechStack[]> => {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'public_techstack', [
      Query.limit(100),
      Query.orderDesc('proficiency')
    ]);
    return (response.documents as unknown) as TechStack[];
  } catch (error) {
    console.error('Failed to fetch skills:', error);
    return [];
  }
};

export const fetchServices = async (): Promise<Service[]> => {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'public_services', [
      Query.equal('is_active', true),
      Query.orderDesc('$createdAt')
    ]);
    return (response.documents as unknown) as Service[];
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return [];
  }
};

export const fetchSocialLinks = async (): Promise<SocialLink[]> => {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'public_social_links', [
      Query.orderAsc('order_index'),
      Query.limit(50)
    ]);
    return (response.documents as unknown) as SocialLink[];
  } catch (error) {
    console.error('Failed to fetch social links:', error);
    return [];
  }
};

export const fetchGalleryItems = async (): Promise<GalleryItem[]> => {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'public_gallery', [
      Query.orderDesc('$createdAt'),
      Query.limit(100)
    ]);
    return (response.documents as unknown) as GalleryItem[];
  } catch (error) {
    console.error('Failed to fetch gallery items:', error);
    return [];
  }
};

export const fetchExperiences = async (): Promise<Experience[]> => {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'public_experiences', [
      Query.limit(100)
    ]);
    return (response.documents as unknown) as Experience[];
  } catch (error) {
    console.error('Failed to fetch experiences:', error);
    return [];
  }
};

export const fetchArticles = async (): Promise<Article[]> => {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'public_articles', [
      Query.equal('is_published', true),
      Query.orderDesc('$createdAt')
    ]);
    return (response.documents as unknown) as Article[];
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return [];
  }
};

export const fetchChangelogs = async (): Promise<ChangelogEntry[]> => {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'changelogs', [
      Query.orderDesc('$createdAt')
    ]);
    return (response.documents as unknown) as ChangelogEntry[];
  } catch (error) {
    console.error('Failed to fetch changelogs:', error);
    return [];
  }
};

export const fetchActiveRoadmap = async (): Promise<Roadmap | null> => {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'roadmaps', [
      Query.equal('is_active', true),
      Query.limit(1)
    ]);
    if (response.documents.length > 0) {
      return (response.documents[0] as unknown) as Roadmap;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch roadmap:', error);
    return null;
  }
};
