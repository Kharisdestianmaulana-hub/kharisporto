export interface Bio {
  $id: string;
  name: string;
  tagline: string;
  about: string;
  avatar_url: string;
  email: string;
  github_url: string;
  linkedin_url: string;
}

export interface Experience {
  $id: string;
  company: string;
  role: string;
  period: string;
  address: string;
  description: string;
  type: 'Work' | 'Education' | 'Certification' | 'Internship' | 'Volunteer';
  $createdAt: string;
}

export interface Article {
  $id: string;
  title: string;
  content: string;
  cover_image: string;
  tags: string;
  is_published: boolean;
  target_website: string;
  $createdAt: string;
}

export interface TechStack {
  $id: string;
  name: string;
  category: string;
  proficiency: number;
}

export interface Project {
  $id: string;
  title: string;
  category: string;
  tech_stack: string;
  status: 'Planning' | 'In-Progress' | 'Completed' | 'Archived';
  visibility: boolean;
  content_body: string;
  cover_image_id: string;
  image_ids?: string[];
  cover_image_url?: string;
  image_url?: string;
  image_urls?: string[];
  $createdAt: string;
}

export interface GalleryItem {
  $id: string;
  title: string;
  image_url: string;
  category: string;
  link_url?: string;
}

export interface Testimonial {
  $id: string;
  author_name: string;
  author_role: string;
  content: string;
  author_image?: string;
}

export interface Service {
  $id: string;
  service_name: string;
  description: string;
  base_price: string;
  is_active: boolean;
}

export interface SocialLink {
  $id: string;
  platform: string;
  url: string;
  username: string;
  order_index: number;
}

export interface ChangelogEntry {
  $id: string;
  project_id: string;
  project_name: string;
  version: string;
  release_date: string;
  type: 'Release' | 'Feature' | 'Bugfix' | 'Improvement' | 'Breaking Change';
  description: string;
  $createdAt: string;
}

export interface Roadmap {
  $id: string;
  year: string;
  title: string;
  is_active: boolean;
  tasks: string[];
  $createdAt: string;
}
