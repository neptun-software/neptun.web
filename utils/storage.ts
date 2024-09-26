export const localStorageBaseKey = '@neptunai-tool';
export const localStorageTopicKey = (topic: string) => {
  return `${localStorageBaseKey}/${topic}`;
}
