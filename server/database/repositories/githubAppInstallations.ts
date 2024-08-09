import { chat_github_app_installation, type ReadUser, type NewGithubAppInstallation } from "~/lib/types/database.tables/schema"
import { eq } from "drizzle-orm";

export const createGithubAppInstallation = async (installationToCreate: NewGithubAppInstallation) => {
    const createdGithubAppInstallation = await db
        .insert(chat_github_app_installation)
        .values(installationToCreate)
        .returning()
        .catch((err) => {
            if (LOG_BACKEND)
                console.error(
                    'Failed to create github app installation in database',
                    err
                );
            return null;
        });

    if (!createdGithubAppInstallation) return null;

    return createdGithubAppInstallation[0];
}

export const readAllGithubAppInstallationsOfUser = async (userId: ReadUser['id']) => {
    const fetchedGithubAppInstallations = await db
        .select()
        .from(chat_github_app_installation)
        .where(eq(chat_github_app_installation.chat_user_id, userId))
        .catch((err) => {
            if (LOG_BACKEND)
                console.error(
                    'Failed to fetch github app installations from database',
                    err
                );
            return null;
        });

    if (!fetchedGithubAppInstallations) return null;

    return fetchedGithubAppInstallations;
}
