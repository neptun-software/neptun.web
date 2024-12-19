export const localStorageBaseKey = '@neptunai-tool'
export function localStorageTopicKey(topic: string) {
  return `${localStorageBaseKey}/${topic}`
}
