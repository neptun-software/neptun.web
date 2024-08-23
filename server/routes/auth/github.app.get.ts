import { App } from 'octokit';
import { createGithubAppInstallation } from '~/server/database/repositories/githubAppInstallations';
import { createGithubAppInstallationRepositories } from '~/server/database/repositories/githubAppInstallationsRepositories';
import { readUserUsingGithubOauthId } from '~/server/database/repositories/users';
import { type GetResponseTypeFromEndpointMethod } from "@octokit/types";

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
                    neptun_user_id: userId
                };

                // console.log('User ID:', installation.account?.id);

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
                    const filteredRepositories = await octokit.paginate(octokit.rest.apps.listReposAccessibleToInstallation, {
                        installation_id: installationId,
                        per_page: 100
                    },
                        (response) => {
                            type Repository = GetResponseTypeFromEndpointMethod<typeof octokit.rest.apps.listReposAccessibleToInstallation>["data"]["repositories"][0];
                            type Repositories = {
                                [key: number]: Repository
                                repository_selection: string;
                                total_count: number;
                            };

                            /**
                             * Contains valid type.
                             * 
                             * ```
                             * // invalid
                             * (parameter) response: NormalizeResponse<OctokitResponse<{
                             *      total_count: number;
                             *      repositories: components["schemas"]["repository"][];
                             *      repository_selection?: string;
                             *  }, 200>>
                             * ```
                             * 
                             * should be typed as
                             * 
                             * ```
                             * // valid
                             *  type Repositories = {
                             *      [key: number]: Repository[0]
                             *      repository_selection: string;
                             *      total_count: number;
                             *  };
                             * ```
                             * 
                             */
                            const repositories = response.data as Repositories;

                            // removes repository_selection and total_count
                            const filteredRepositories = Object.keys(repositories).filter(key => !isNaN(Number(key))).map(key => {
                                return repositories[Number(key)];
                            });

                            if (LOG_BACKEND) console.log("PAGE: ", repositories["repository_selection"], repositories["total_count"], filteredRepositories.map((repository) => repository.name));

                            // should be response.data.repositories, but is response.data[number][]
                            return filteredRepositories.map((repository) => {
                                return {
                                    github_repository_id: repository.id,
                                    github_repository_name: repository.name,
                                    github_repository_description: repository.description,
                                    github_repository_size: repository.size,
                                    github_repository_language: repository.language,
                                    github_repository_license: repository.license?.name ?? null,
                                    github_repository_url: repository.html_url,
                                    github_repository_website_url: repository.homepage,
                                    github_repository_default_branch: repository.default_branch,
                                    github_repository_is_private: repository.private,
                                    github_repository_is_fork: repository.fork,
                                    github_repository_is_template: repository.is_template ?? false,
                                    github_repository_is_archived: repository.archived,
                                    github_app_installation_id: githubAppInstallationId
                                };
                            });
                        }
                    );

                    if (LOG_BACKEND) console.log("PAGES: filteredRepositories", filteredRepositories.length, filteredRepositories.map((repository) => repository.github_repository_name));
                    // console.dir(repositories, { depth: 1 });

                    try {
                        const createdGithubAppInstallationRepositories = await createGithubAppInstallationRepositories(filteredRepositories);
                        if (!createdGithubAppInstallationRepositories) {
                            if (LOG_BACKEND) console.error(3, "Could not create github app installation repositories in database.");
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
                        if (LOG_BACKEND) console.error(2, error);
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
                } catch (error) {
                    if (LOG_BACKEND) console.error(1, error);
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