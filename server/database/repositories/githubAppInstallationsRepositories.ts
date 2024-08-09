import { chat_github_app_installation_repository, type NewGithubAppInstallationRepository } from "~/lib/types/database.tables/schema"
import { eq } from "drizzle-orm";

export const createGithubAppInstallationRepositories = async (installationRepositoriesToCreate: NewGithubAppInstallationRepository[]) => {
    const createdGithubAppInstallationRepositories = await db
        .insert(chat_github_app_installation_repository)
        .values(installationRepositoriesToCreate)
        .returning()
        .catch((err) => {
            if (LOG_BACKEND)
                console.error(
                    'Failed to create github app installation repositories in database',
                    err
                );
            return null;
        });

    if (!createdGithubAppInstallationRepositories) return null;

    return createdGithubAppInstallationRepositories;
}

export const readAllGithubAppInstallationRepositoriesOfInstallation = async (installationId: number) => {
    const fetchedGithubAppInstallationRepositories = await db
        .select()
        .from(chat_github_app_installation_repository)
        .where(eq(chat_github_app_installation_repository.chat_github_app_installation_id, installationId))
        .catch((err) => {
            if (LOG_BACKEND)
                console.error(
                    'Failed to fetch github app installation repositories from database',
                    err
                );
            return null;
        });

    if (!fetchedGithubAppInstallationRepositories) return null;

    return fetchedGithubAppInstallationRepositories;
}
