export const DESKTOP_PROJECT_IDS_KEY = 'shiftos_desktop_project_ids';
export const FAVORITE_PROJECT_IDS_KEY = 'shiftos_favorite_project_ids';
export const DOCK_PROJECT_IDS_KEY = 'shiftos_dock_project_ids';
export const PROJECT_SHORTCUTS_EVENT = 'shiftos:project-shortcuts-updated';
export const OPEN_PROJECT_EVENT = 'shiftos:open-project';

export const readStoredProjectIds = (key: string): string[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
};

export const writeStoredProjectIds = (key: string, ids: string[]) => {
  localStorage.setItem(key, JSON.stringify(Array.from(new Set(ids))));
  window.dispatchEvent(new Event(PROJECT_SHORTCUTS_EVENT));
};

export const dispatchOpenProject = (projectId: string) => {
  window.dispatchEvent(new CustomEvent(OPEN_PROJECT_EVENT, { detail: { projectId } }));
};
