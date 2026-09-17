declare module 'vue-dndrop' {
  export interface DropResult<T = any> {
    removedIndex: number | null
    addedIndex: number | null
    payload: T
    element: HTMLElement
  }

  export interface DragEvent<T = any> {
    payload: T
    isSource: boolean
    willAcceptDrop: boolean
  }

  export type Payload = any

  export interface NodeDescription {
    value: string
    props: Record<string, unknown>
  }

  export interface DraggableProps {
    dragNotAllowed?: boolean
    tag?: string | NodeDescription
  }

  export interface ContainerProps {
    dragStart?: (dragEvent: DragEvent) => void
    dragEnd?: (dragEvent: DragEvent) => void
    dragEnter?: () => void
    dragLeave?: () => void
    dragReady?: (dropResult: DropResult) => void
    drop?: (dropResult: DropResult) => void
    dropNotAllowed?: (dropResult: { payload: unknown, container: unknown }) => void

    getChildPayload?: (index: number) => unknown
    shouldAnimateDrop?: (
      sourceContainerOptions: ContainerProps,
      payload: unknown
    ) => boolean
    shouldAcceptDrop?: (
      sourceContainerOptions: ContainerProps,
      payload: unknown
    ) => boolean
    getGhostParent?: () => HTMLElement

    orientation?: 'horizontal' | 'vertical'
    behavior?: 'move' | 'copy' | 'drop-zone' | 'contain'
    tag?: string | NodeDescription
    groupName?: string
    lockAxis?: 'x' | 'y'
    dragHandleSelector?: string
    nonDragAreaSelector?: string
    dragBeginDelay?: number
    animationDuration?: number
    autoScrollEnabled?: boolean
    dragClass?: string
    dropClass?: string
    removeOnDropOut?: boolean
    dropPlaceholder?:
      | boolean
      | {
        className: string
        animationDuration: number
        showOnTop: boolean
      }
    fireRelatedEventsOnly?: boolean
  }

  export const Draggable: import('vue').DefineComponent<DraggableProps>
  export const Container: import('vue').DefineComponent<ContainerProps>
}
