import { expect, it, vi } from 'vitest'
import { WhatNow } from './WhatNow.js'

type TestStep = 'start' | 'middle' | 'end'

interface TestState {
  count: number
}

interface TestPayload {
  increment: number
}

it('should handle basic state transitions', async () => {
  const onChange = vi.fn()

  const machine = new WhatNow<TestStep, TestState, TestPayload>({
    steps: {
      start: async ({ payload }) =>
        Promise.resolve({
          step: 'middle',
          state: { count: payload.increment ?? 1 },
        }),
      middle: async ({ state }) =>
        Promise.resolve({
          step: 'end',
          state: { count: state.count + 1 },
        }),
      end: null,
    },
    initialState: { count: 0 },
    onChange,
    onError: () => {},
  })

  machine.act('start', { increment: 5 })
  expect(machine.state.count).toBe(0)

  await vi.waitFor(() => {
    expect(machine.state.count).toBe(6)
    expect(onChange).toHaveBeenCalledTimes(2)
  })
})

it('should handle errors gracefully', async () => {
  const onError = vi.fn()

  const machine = new WhatNow<TestStep, TestState>({
    steps: {
      start: async () => Promise.reject(new Error('Test error')),
      middle: async () => Promise.resolve({ step: 'end' }),
      end: null,
    },
    initialState: { count: 0 },
    onChange: () => {},
    onError,
  })

  machine.act('start')

  await vi.waitFor(() => {
    expect(onError).toHaveBeenCalledWith(expect.any(Error))
  })
})

it('should handle reset operation', async () => {
  const machine = new WhatNow<TestStep, TestState>({
    steps: {
      start: () => Promise.resolve({ step: 'middle' }),
      middle: () => Promise.resolve({ step: 'end' }),
      end: null,
    },
    initialState: { count: 0 },
    onChange: () => {},
    onError: () => {},
  })

  machine.act('start')
  machine.reset('middle')

  await vi.waitFor(() => {
    expect(machine.state.count).toBe(0)
  })
})

it('should handle context updates', async () => {
  interface TestContext {
    total: number
  }

  const onChange = vi.fn()

  const machine = new WhatNow<TestStep, TestState, TestPayload, TestContext>({
    steps: {
      start: ({ context }) =>
        Promise.resolve({
          step: 'middle',
          context: { total: context.total + 1 },
        }),
      middle: ({ context }) =>
        Promise.resolve({
          step: 'end',
          state: { count: context.total * 2 },
        }),
      end: null,
    },
    initialState: { count: 0 },
    initialContext: { total: 0 },
    onChange,
    onError: () => {},
  })

  machine.act('start')

  await vi.waitFor(() => {
    expect(machine.state.count).toBe(2) // total(1) * 2
    expect(onChange).toHaveBeenCalledTimes(1)
  })
})
