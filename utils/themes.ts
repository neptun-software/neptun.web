export const themePairs: Record<ThemeName, ThemePair> = {
    'github': { light: 'github-light', dark: 'github-dark' },
    'vscode': { light: 'light-plus', dark: 'dark-plus' },
    'min': { light: 'min-light', dark: 'min-dark' },
    'one': { light: 'one-light', dark: 'one-dark-pro' },
    'slack': { light: 'slack-ochin', dark: 'slack-dark' },
    'snazzy': { light: 'snazzy-light', dark: 'andromeeda' }, // special case: snazzy-light pairs with andromeeda
    'vitesse': { light: 'vitesse-light', dark: 'vitesse-dark' },
}

export const themeOptions = Object.entries(themePairs).map(([key, _]) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1),
    value: key as ThemeName
}))

export type ThemeName = 'github' | 'vscode' | 'min' | 'one' | 'slack' | 'snazzy' | 'vitesse'
export type ThemePair = { light: string; dark: string }
export type ThemeOption = { label: string; value: ThemeName }
