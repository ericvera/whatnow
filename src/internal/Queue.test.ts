import { expect, it } from 'vitest'
import { Queue } from './Queue.js'

it('should process items in order', () => {
  const processed: number[] = []
  const queue = new Queue<number>(() => {
    if (queue.current) {
      processed.push(queue.current)
    }
  })

  queue.enqueue(1)
  queue.enqueue(2)
  queue.enqueue(3)

  expect(processed).toEqual([1])
  queue.done()
  expect(processed).toEqual([1, 2])
  queue.done()
  expect(processed).toEqual([1, 2, 3])
  queue.done()
  expect(processed).toEqual([1, 2, 3])
})

it('should handle clear operation', () => {
  const processed: number[] = []
  const queue = new Queue<number>(() => {
    if (queue.current) {
      processed.push(queue.current)
    }
  })

  queue.enqueue(1)
  queue.enqueue(2)
  expect(processed).toEqual([1])

  queue.clear()
  expect(queue.current).toBeUndefined()
  expect(processed).toEqual([1])

  queue.enqueue(3)
  expect(processed).toEqual([1, 3])
})

it('should not process when current item exists', () => {
  const processed: number[] = []
  const queue = new Queue<number>(() => {
    if (queue.current) {
      processed.push(queue.current)
    }
  })

  queue.enqueue(1)
  queue.enqueue(2)
  expect(processed).toEqual([1])
  expect(queue.current).toBe(1)
})
