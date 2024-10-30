export type Import = {
  github_repository_id: number;
  github_repository_name: string;
  github_repository_description: string | null;
  github_repository_size: number;
  github_repository_language: string | null;
  github_repository_license: string | null;
  github_repository_url: string;
  github_repository_website_url: string | null;
  github_repository_default_branch: string;
  github_repository_is_private: boolean;
  github_repository_is_fork: boolean;
  github_repository_is_template: boolean;
  github_repository_is_archived: boolean;
  github_app_installation_id: number;
};
