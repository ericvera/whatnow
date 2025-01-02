import { expect, it, vi } from 'vitest'
import { StepHandlers, WhatNow } from './WhatNow.js'

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

it('should handle act calls from within step handlers', async () => {
  type ChainedSteps = 'first' | 'second' | 'third' | 'done'

  const onChange = vi.fn()

  const steps: StepHandlers<ChainedSteps, TestState, TestPayload> = {
    first: async (_, act) => {
      act('second', { increment: 1 })

      return Promise.resolve({ step: 'third' })
    },
    second: async ({ state, payload }) => {
      const count = state.count + (payload.increment ?? 0)

      return Promise.resolve({
        step: 'third',
        state: { count },
      })
    },
    third: async ({ state }) => {
      const count = state.count + 1

      return Promise.resolve({
        step: 'done',
        state: { count },
      })
    },
    done: null,
  }

  const machine = new WhatNow<ChainedSteps, TestState, TestPayload>({
    steps,
    initialState: { count: 0 },
    onChange,
    onError: () => {},
  })

  machine.act('first')

  await vi.waitFor(() => {
    expect(machine.state.count).toBe(3) // 2 from scheduling 'first' + 1 from scheduling 'second' in 'first'
    expect(onChange).toHaveBeenCalledTimes(3)
  })
})

it('should handle nested act calls with proper sequencing', async () => {
  type NestedSteps = 'start' | 'nested1' | 'nested2' | 'final'
  const executionOrder: string[] = []

  const steps: StepHandlers<NestedSteps, TestState, TestPayload> = {
    start: async (_, act) => {
      executionOrder.push('start')
      act('nested1')
      executionOrder.push('after-nested1')

      return Promise.resolve({ step: 'final' })
    },
    nested1: async (_, act) => {
      executionOrder.push('nested1')
      act('nested2')
      executionOrder.push('nested1-return')

      return Promise.resolve({ step: 'final' })
    },
    nested2: async () => {
      executionOrder.push('nested2')

      return Promise.resolve({ step: 'final' })
    },
    final: null,
  }

  const machine = new WhatNow<NestedSteps, TestState, TestPayload>({
    steps,
    initialState: { count: 0 },
    onChange: () => {},
    onError: () => {},
  })

  machine.act('start')

  await vi.waitFor(() => {
    expect(executionOrder).toEqual([
      'start',
      'after-nested1',
      'nested1',
      'nested1-return',
      'nested2',
    ])
  })
})

it('should handle concurrent act calls correctly', async () => {
  type TestStep = 'one-a' | 'one-b' | 'two' | 'done'

  const executionOrder: string[] = []

  const steps: StepHandlers<TestStep, TestState> = {
    'one-a': async () => {
      executionOrder.push('one-a')

      return Promise.resolve({ step: 'one-b' })
    },
    'one-b': async () => {
      executionOrder.push('one-b')

      return Promise.resolve({ step: 'done' })
    },
    two: async () => {
      executionOrder.push('two')

      return Promise.resolve({ step: 'done' })
    },
    done: null,
  }

  const machine = new WhatNow<TestStep, TestState>({
    steps,
    initialState: { count: 0 },
    onChange: () => {},
    onError: () => {},
  })

  // Trigger multiple acts in quick succession
  machine.act('one-a')
  machine.act('two')

  await vi.waitFor(() => {
    expect(executionOrder).toEqual(['one-a', 'one-b', 'two'])
  })
})
