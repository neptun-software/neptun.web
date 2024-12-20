export const dashboardAliases = ['/dashboard', '/chat', '/ai']
export const accountAliases = ['/user', '/self', '/info', '/profile']
export const projectAliases = ['/guide', '/workspace']
export const protectedRoutes = ['/', ...dashboardAliases, ...accountAliases, ...projectAliases]

export const templatesAliasBase = ['/snippets', '/collections', '/starters']
export const templatesAliases = [...templatesAliasBase, ...templatesAliasBase.map(path => `/shared/${path}`)]
