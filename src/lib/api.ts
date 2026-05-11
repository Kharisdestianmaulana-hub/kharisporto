import { Query } from 'appwrite';
import { databases, DATABASE_ID, PROJECTS_COLLECTION_ID } from './appwrite';
import type { Bio, Project, TechStack, Service, SocialLink, Experience, Article, ChangelogEntry, Roadmap } from '../types';

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
