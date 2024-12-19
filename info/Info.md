# Why not pinia?

I don't have time to learn it properly, and it seems like more work to me than composables do.

## Pinia be like

Generally put every small store in `composables`.
If the store is big enough, put it in `stores`.
Also put the store in `stores` if it only stores UI state, just so that it can be found easier and not be used server-side mistakenly.

**Useful**:

- storeToRefs(piniaStore)

**Example Wrapper:**

```ts:stores/useExampleStore.ts
const useExampleStore = defineStore('example', () => {
  const getSomething = ref(undefined)
  const setSomething = value => getSomething.value = unref(value)

  return {
    getSomething,
    setSomething,
  }
}
```

```ts:composables/useExample.ts
function useExample() {
  const store = useExampleStore()
  const refs = storeToRefs(store)

  return {
    ...store,
    ...refs
  }
}
```
