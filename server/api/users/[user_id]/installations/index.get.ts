import { readAllGithubAppInstallationsOfUser } from "~/server/database/repositories/githubAppInstallations";

export default defineEventHandler(async (event) => {
    /* VALIDATE PARAMS */
    const maybeUserId = await validateParamUserId(event);
    if (maybeUserId.statusCode !== 200) {
        return sendError(
            event,
            createError({
                statusCode: maybeUserId.statusCode,
                statusMessage: maybeUserId.statusMessage,
                data: maybeUserId.data,
            })
        );
    }
    const user_id = maybeUserId.data?.user_id;

    const githubAppInstallation = await readAllGithubAppInstallationsOfUser(user_id);

    return githubAppInstallation;
});
