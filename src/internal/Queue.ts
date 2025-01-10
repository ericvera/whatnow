export class Queue<T> {
  private items: T[] = []
  private _current: T | undefined
  private onUpdate: () => void

  /**
   * Creates a new Queue instance
   * @param onUpdate - Callback to notify when queue updates
   */
  constructor(onUpdate: () => void) {
    this.onUpdate = onUpdate
  }

  /**
   * Gets the current item being processed
   */
  get current(): T | undefined {
    return this._current
  }

  /**
   * Adds an item to the queue and processes it if queue is empty
   */
  enqueue(item: T): void {
    this.items.push(item)

    if (!this._current) {
      this.next()
    }
  }

  /**
   * Clears all items and resets current
   */
  clear(): void {
    this.items = []
    this._current = undefined
  }

  /**
   * Processes next item if available and queue is idle
   */
  private next(): void {
    if (this._current !== undefined || this.items.length === 0) {
      return
    }

    this._current = this.items.shift()
    this.onUpdate()
  }

  /**
   * Marks current item as complete and processes next item
   */
  done(): void {
    this._current = undefined
    this.next()
  }
}
