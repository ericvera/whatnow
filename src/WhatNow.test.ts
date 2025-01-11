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
    first: async (_, { act }) => {
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
    start: async (_, { act }) => {
      executionOrder.push('start')
      act('nested1')
      executionOrder.push('after-nested1')

      return Promise.resolve({ step: 'final' })
    },
    nested1: async (_, { act }) => {
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

it('should handle reset calls from within step handlers', async () => {
  type ResetSteps = 'start' | 'middle' | 'later' | 'unload' | 'end'
  const executionOrder: string[] = []

  const steps: StepHandlers<ResetSteps, TestState> = {
    start: async (_, { act }) => {
      executionOrder.push('start')
      act('middle')
      return Promise.resolve({ step: 'end' })
    },
    middle: async (_, { act, reset }) => {
      executionOrder.push('middle')

      // This should be queued, but not executed as reset should clear the queue
      act('start')

      reset('unload')
      return Promise.resolve({ step: 'later' })
    },
    later: async () => {
      executionOrder.push('later')
      return Promise.resolve({ step: 'end' })
    },
    unload: async () => {
      executionOrder.push('unload')
      return Promise.resolve({ step: 'end' })
    },
    end: null,
  }

  const machine = new WhatNow<ResetSteps, TestState>({
    steps,
    initialState: { count: 0 },
    onChange: () => {},
    onError: () => {},
  })

  machine.act('start')

  await vi.waitFor(() => {
    expect(executionOrder).toEqual(['start', 'middle', 'unload'])
  })
})

it('should handle reset calls that clear queued acts', async () => {
  type ResetSteps = 'start' | 'middle' | 'reset' | 'skipped' | 'end'
  const executionOrder: string[] = []

  const steps: StepHandlers<ResetSteps, TestState> = {
    start: async (_, { act }) => {
      executionOrder.push('start')
      act('middle')
      act('skipped') // This should be cleared by reset
      return Promise.resolve({ step: 'end' })
    },
    middle: async (_, { reset }) => {
      executionOrder.push('middle')
      reset('reset')
      return Promise.resolve({ step: 'end' })
    },
    reset: async () => {
      executionOrder.push('reset')
      return Promise.resolve({ step: 'end' })
    },
    skipped: async () => {
      executionOrder.push('skipped')
      return Promise.resolve({ step: 'end' })
    },
    end: null,
  }

  const machine = new WhatNow<ResetSteps, TestState>({
    steps,
    initialState: { count: 0 },
    onChange: () => {},
    onError: () => {},
  })

  machine.act('start')

  await vi.waitFor(() => {
    expect(executionOrder).toEqual(['start', 'middle', 'reset'])
    // Verify 'skipped' was never executed
    expect(executionOrder).not.toContain('skipped')
  })
})

it('should handle reset and act calls in the same step', async () => {
  type ResetSteps = 'start' | 'middle' | 'reset' | 'after-reset' | 'end'
  const executionOrder: string[] = []

  const steps: StepHandlers<ResetSteps, TestState> = {
    start: async (_, { act }) => {
      executionOrder.push('start')
      act('middle')
      return Promise.resolve({ step: 'end' })
    },
    middle: async (_, { reset, act }) => {
      executionOrder.push('middle')
      reset('reset')
      act('after-reset') // This should be cleared by reset
      return Promise.resolve({ step: 'end' })
    },
    reset: async (_, { act }) => {
      executionOrder.push('reset')
      act('after-reset') // This should execute
      return Promise.resolve({ step: 'end' })
    },
    'after-reset': async () => {
      executionOrder.push('after-reset')
      return Promise.resolve({ step: 'end' })
    },
    end: null,
  }

  const machine = new WhatNow<ResetSteps, TestState>({
    steps,
    initialState: { count: 0 },
    onChange: () => {},
    onError: () => {},
  })

  machine.act('start')

  await vi.waitFor(() => {
    expect(executionOrder).toEqual(['start', 'middle', 'reset', 'after-reset'])
    // Verify 'after-reset' only executed once
    expect(
      executionOrder.filter((step) => step === 'after-reset'),
    ).toHaveLength(1)
  })
})

it('should handle reset from completed/terminal states', async () => {
  type ResetSteps = 'start' | 'middle' | 'end' | 'reset-target'
  const executionOrder: string[] = []

  const steps: StepHandlers<ResetSteps, TestState> = {
    start: async () => {
      executionOrder.push('start')
      return Promise.resolve({
        step: 'middle',
        state: { count: 1 },
      })
    },
    middle: async () => {
      executionOrder.push('middle')
      return Promise.resolve({
        step: 'end',
        state: { count: 2 },
      })
    },
    end: null, // Terminal state
    'reset-target': async () => {
      executionOrder.push('reset-target')
      return Promise.resolve({
        step: 'end',
        state: { count: 99 },
      })
    },
  }

  const machine = new WhatNow<ResetSteps, TestState>({
    steps,
    initialState: { count: 0 },
    onChange: () => {},
    onError: () => {},
  })

  // First run the machine to completion
  machine.act('start')

  await vi.waitFor(() => {
    expect(executionOrder).toEqual(['start', 'middle'])
    expect(machine.state.count).toBe(2)
  })

  // Reset from terminal state
  machine.reset('reset-target')

  await vi.waitFor(() => {
    expect(executionOrder).toEqual(['start', 'middle', 'reset-target'])
    expect(machine.state.count).toBe(99)
  })
})

it('should handle multiple reset calls', async () => {
  type ResetSteps = 'start' | 'reset1' | 'reset2' | 'reset3' | 'end'
  const executionOrder: string[] = []

  const steps: StepHandlers<ResetSteps, TestState> = {
    start: async () => {
      executionOrder.push('start')
      return Promise.resolve({
        step: 'end',
        state: { count: 1 },
      })
    },
    reset1: async () => {
      executionOrder.push('reset1')
      return Promise.resolve({
        step: 'end',
        state: { count: 2 },
      })
    },
    reset2: async () => {
      executionOrder.push('reset2')
      return Promise.resolve({
        step: 'end',
        state: { count: 3 },
      })
    },
    reset3: async () => {
      executionOrder.push('reset3')
      return Promise.resolve({
        step: 'end',
        state: { count: 4 },
      })
    },
    end: null,
  }

  const machine = new WhatNow<ResetSteps, TestState>({
    steps,
    initialState: { count: 0 },
    onChange: () => {},
    onError: () => {},
  })

  // Run initial step
  machine.act('start')

  await vi.waitFor(() => {
    expect(executionOrder).toEqual(['start'])
    expect(machine.state.count).toBe(1)
  })

  // Call reset multiple times in succession
  machine.reset('reset1')
  machine.reset('reset2') // This should be ignored due to resettingStep flag
  machine.reset('reset3') // This should be ignored due to resettingStep flag

  await vi.waitFor(() => {
    // Only reset1 should execute
    expect(executionOrder).toEqual(['start', 'reset1'])
    expect(machine.state.count).toBe(2)
  })

  // Now we can reset again since previous reset completed
  machine.reset('reset2')

  await vi.waitFor(() => {
    expect(executionOrder).toEqual(['start', 'reset1', 'reset2'])
    expect(machine.state.count).toBe(3)
  })
})
