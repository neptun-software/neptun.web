import { App } from 'octokit';
import { createGithubAppInstallation } from '~/server/database/repositories/githubAppInstallations';
import { createGithubAppInstallationRepositories } from '~/server/database/repositories/githubAppInstallationsRepositories';
import { readUserUsingGithubOauthId } from '~/server/database/repositories/users';
// import { type GetResponseTypeFromEndpointMethod } from "@octokit/types";

export default defineEventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig(event);
    const octokitApp = new App({
        appId: runtimeConfig.github.app.appId,
        privateKey: runtimeConfig.github.app.privateKey,
        oauth: {
            clientId: runtimeConfig.github.app.clientId,
            clientSecret: runtimeConfig.github.app.clientSecret,
        },
        webhooks: {
            secret: runtimeConfig.github.app.webhookSecret,
        },
    });

    const query = getQuery(event);
    const { installation_id } = query;

    if (!installation_id) {
        if (LOG_BACKEND) console.info("Missing installation_id.");
        return sendError(
            event,
            createError({
                statusCode: 400,
                statusMessage: 'Bad Request.',
                message: "Missing installation_id."
            })
        );
    }

    if (Number.isNaN(installation_id)) {
        if (LOG_BACKEND) console.info("Invalid installation_id. Must be a number.");
        return sendError(
            event,
            createError({
                statusCode: 400,
                statusMessage: 'Bad Request.',
                message: "Invalid installation_id. Must be a number."
            })
        );
    }

    const installationId = Number(installation_id);
    try {
        const octokit = await octokitApp.getInstallationOctokit(
            installationId
        );

        try {
            const { data: installation } = await octokit.rest.apps.getInstallation({
                installation_id: installationId,
            });

            const { account } = installation;
            if (account === null) {
                if (LOG_BACKEND) console.info("Invalid installation_id. The installation doesn't belong to any Github App.");
                return sendError(
                    event,
                    createError({
                        statusCode: 400,
                        statusMessage: 'Bad Request.',
                        message: "Invalid installation_id. The installation doesn't belong to any Github App."
                    })
                );
            }

            const { id: githubUserId, name: githubUserName, avatar_url: githubUserAvatarUrl } = account;
            let githubUserAccountType = "";
            if ("type" in account) {
                const { type: githubUserAccountTypeFound } = account;
                githubUserAccountType = githubUserAccountTypeFound;
            }

            try {
                const user = await readUserUsingGithubOauthId(String(githubUserId));
                if (!user) {
                    if (LOG_BACKEND) console.info("User not found. You have to install the app, with a Github Account, that you registered an account on neptun!");
                    return sendError(
                        event,
                        createError({
                            statusCode: 404,
                            statusMessage: 'Not Found.',
                            message: "User not found. You have to install the app, with a Github Account, that you registered an account on neptun!"
                        })
                    );
                }

                const { id: userId } = user;
                const githubAppInstallationToCreate = {
                    github_account_id: githubUserId,
                    github_account_name: githubUserName ?? "",
                    github_account_avatar_url: githubUserAvatarUrl,
                    github_account_type: githubUserAccountType,
                    chat_user_id: userId
                };

                // console.log('User ID:', installation.account?.id);
                // console.dir(repositoryList, { depth: 1 });

                // create github app installation
                const createdGithubAppInstallation = await createGithubAppInstallation(githubAppInstallationToCreate);
                if (!createdGithubAppInstallation) {
                    if (LOG_BACKEND) console.info("Failed to create github app installation in database.");
                    return sendError(
                        event,
                        createError({
                            statusCode: 500,
                            statusMessage: 'Internal Server Error.',
                            message: "Failed to create github app installation in database."
                        })
                    );
                }

                const { id: githubAppInstallationId } = createdGithubAppInstallation;

                // create associated repositories
                try {
                    // TODO: add pagination to get all repositories and not only the first 100
                    const repositories = await octokit.rest.apps.listReposAccessibleToInstallation({
                        installation_id: Number(installation_id),
                        per_page: 100
                    });

                    const { repositories: repositoryList } = repositories.data;
                    const filteredRepositories = repositoryList.map(repo => {
                        return {
                            github_repository_id: repo.id,
                            github_repository_name: repo.name,
                            github_repository_description: repo.description,
                            github_repository_size: repo.size,
                            github_repository_language: repo.language,
                            github_repository_license: repo.license?.name ?? null,
                            github_repository_url: repo.html_url,
                            github_repository_website_url: repo.homepage,
                            github_repository_default_branch: repo.default_branch,
                            github_repository_is_private: repo.private,
                            github_repository_is_fork: repo.fork,
                            github_repository_is_template: repo.is_template ?? false,
                            github_repository_is_archived: repo.archived,
                            chat_github_app_installation_id: githubAppInstallationId
                        };
                    });

                    try {
                        const createdGithubAppInstallationRepositories = await createGithubAppInstallationRepositories(filteredRepositories);
                        if (!createdGithubAppInstallationRepositories) {
                            if (LOG_BACKEND) console.info("Failed to create github app installation repositories in database.");
                            return sendError(
                                event,
                                createError({
                                    statusCode: 500,
                                    statusMessage: 'Internal Server Error.',
                                    message: "Failed to create github app installation repositories in database. There are no repositories connected to this installation."
                                })
                            );
                        }

                        return sendRedirect(
                            event,
                            `/home`
                        )
                    } catch (error) {
                        console.error(error);
                        if (LOG_BACKEND) console.info("Failed to create github app installation repositories in database.");
                        return sendError(
                            event,
                            createError({
                                statusCode: 500,
                                statusMessage: 'Fetch Error.',
                                message: "Failed to fetch repositories connected to this installation."
                            })
                        )
                    }
                } catch {
                    if (LOG_BACKEND) console.info("Failed to create github app installation repositories in database.");
                    return sendError(
                        event,
                        createError({
                            statusCode: 500,
                            statusMessage: 'Fetch Error.',
                            message: "Failed to fetch repositories connected to this installation."
                        })
                    )
                }
            } catch {
                if (LOG_BACKEND) console.info("Failed to find user. You have to install the app, with a Github Account, that you registered an account on neptun!");
                return sendError(
                    event,
                    createError({
                        statusCode: 400,
                        statusMessage: 'Bad Request.',
                        message: "Failed to find user. You have to install the app, with a Github Account, that you registered an account on neptun!"
                    })
                )
            }
        } catch {
            if (LOG_BACKEND) console.info("Invalid installation_id. The installation is not found or the user does not have access to it.");
            return sendError(
                event,
                createError({
                    statusCode: 400,
                    statusMessage: 'Bad Request.',
                    message: "Invalid installation_id. The installation is not found or the user does not have access to it."
                })
            )
        }
    } catch {
        if (LOG_BACKEND) console.info("Invalid installation_id. The installation doesn't belong to any Github App.");
        return sendError(
            event,
            createError({
                statusCode: 400,
                statusMessage: 'Bad Request.',
                message: "Invalid installation_id. The installation doesn't belong to any Github App."
            })
        );
    }
});
