# WhatNow

A lightweight, type-safe state machine for managing complex async workflows.

## Features

- 🪶 **Lightweight**: Zero dependencies, minimal overhead
- 🔒 **Immutable**: Predictable state updates that are always immutable
- 🎯 **Type-safe**: Built-in type safety for your state machines
- 📋 **Queue-based**: Keeps async operations ordered and sequential
- 🛑 **Abortable**: Reset or abort operations mid-flight

## AI Disclosure

This library was co-created with AI, which means it was thoughtfully designed and reviewed by humans.

## Installation

Using npm:

```bash
npm install whatnow
```

Using yarn:

```bash
yarn add whatnow
```

## Quick Start

### Simple Counter Example

```typescript
import { WhatNow } from 'whatnow'

// Define your steps
type Step = 'START' | 'INCREMENTING' | 'DONE'

// Define your state
interface State {
  count: number
}

// Create a simple counter machine
const counter = new WhatNow<Step, State>({
  initialState: { count: 0 },
  steps: {
    // Initial step
    START: async (_, { act }) => {
      return { step: 'INCREMENTING' }
    },
    // Increment the counter
    INCREMENTING: async ({ state }) => {
      return {
        step: 'DONE',
        state: { count: state.count + 1 },
      }
    },
    // Terminal state
    DONE: null,
  },
  onChange: () => {
    console.log('Count:', counter.state.count)
  },
  onError: (error) => {
    console.error('Error:', error)
  },
})

// Start counting
counter.act('START')
```

### Advanced Example: Data Processing

```typescript
import { WhatNow } from 'whatnow'

// Define your steps
type Step =
  | 'UNLOADED'
  | 'INITIALIZING'
  | 'LOADED'
  | 'PROCESSINGDATA'
  | 'UNLOADING'

// Define your state shape (external state)
interface State {
  data: string[]
  processedCount: number
  loaded: boolean
}

// Define internal context (machine-only state)
interface Context {
  unsubscribe?: () => void // Cleanup function for subscription
}

// Define any payload types
interface Payload {
  newData?: string[]
}

// Simulate a data source
const dataSource = {
  subscribe: (callback: (data: string[]) => void) => {
    // Simulate async data arrival
    setTimeout(() => {
      callback(['item1', 'item2', 'item3'])
    }, 100)

    return () => {
      // Cleanup subscription
      console.log('Unsubscribed from data source')
    }
  },
}

// Create your state machine
const machine = new WhatNow<Step, State, Payload, Context>({
  initialState: {
    data: [],
    processedCount: 0,
    loaded: false,
  },
  initialContext: {
    unsubscribe: undefined,
  },
  steps: {
    // Terminal state - initial state before initialization
    UNLOADED: null,

    // Initialize the system by subscribing to data source
    INITIALIZING: async ({ context }, { act }) => {
      const unsubscribe = dataSource.subscribe((newData) => {
        act('PROCESSINGDATA', { newData })
      })

      return {
        step: 'LOADED',
        state: {
          loaded: true,
          data: [],
          processedCount: 0,
        },
        context: {
          unsubscribe,
        },
      }
    },

    // Process items in batch
    PROCESSINGDATA: async ({ state, payload }, { act }) => {
      // If the system is not loaded, we can skip the processing
      if (!state.loaded) {
        return { step: 'UNLOADED' }
      }

      if (payload.newData) {
        // Add new data to existing data and update processed count
        return {
          step: 'LOADED',
          state: {
            data: [...state.data, ...payload.newData],
            processedCount: state.processedCount + payload.newData.length,
            loaded: true,
          },
        }
      }

      return { step: 'PROCESSINGDATA' }
    },

    // Terminal state - system is ready for new data
    LOADED: null,

    // Cleanup state - unsubscribe and reset
    UNLOADING: async ({ state, context }, { act }) => {
      // If the system is not loaded, we can skip the cleanup
      if (!state.loaded) {
        return { step: 'UNLOADED' }
      }

      // Cleanup subscription using stored cleanup function
      context.unsubscribe?.()

      // Reset to initial state and transition to UNLOADED
      return {
        step: 'UNLOADED',
        state: {
          data: [],
          processedCount: 0,
          loaded: false,
        },
        context: {
          unsubscribe: undefined,
        },
      }
    },
  },
  onChange: () => {
    console.log('State updated:', machine.state)
  },
  onError: (error) => {
    console.error('Error occurred:', error)
  },
})

// Example usage:
// Will subscribe and wait for data
machine.act('INITIALIZING')

// Data will arrive via subscription, triggering PROCESSINGDATA and moving to LOADED

// Cleanup and return to UNLOADED state
machine.act('UNLOADING')
```

## API Reference

### `WhatNow<TStep, TState, TPayload, TContext>`

The main class for creating a state machine.

#### Constructor Options

```typescript
interface WhatNowConfig<TStep, TState, TPayload, TContext> {
  steps: StepHandlers<TStep, TState, TPayload, TContext>
  initialState: TState
  initialContext?: TContext
  onChange: () => void
  onError: (error: Error) => void
}
```

- `steps`: Map of step names to their handler functions
- `initialState`: Initial state object (external state)
- `initialContext`: Optional initial context object (internal state)
- `onChange`: Callback triggered when state changes
- `onError`: Error handler for async operations

#### Methods

- `act(step: TStep, payload?: Partial<TPayload>)`: Enqueue a new step transition
- `reset(resetStep: TStep)`: Clear the queue and schedule a new step. The currently executing step will complete, but any steps it triggers or that were previously queued will be discarded. The specified reset step will run after the current step completes.
- `state`: Getter that returns the current state (readonly)

### Step Handlers

Step handlers are async functions that process the current state and return the next step:

```typescript
type StepHandler<TStep, TState, TPayload, TContext> = (
  params: Readonly<{
    state: TState
    context: TContext
    step: TStep
    payload: Partial<TPayload>
  }>,
  actions: {
    act: (step: TStep, payload?: Partial<TPayload>) => void
    reset: (step: TStep) => void
  },
) => Promise<Readonly<StepHandlerReturn<TStep, TState, TContext>>>
```

Return value:

```typescript
interface StepHandlerReturn<TStep, TState, TContext> {
  step: TStep // The next step to transition to
  state?: TState // Optional state updates (must provide complete state object)
  context?: TContext // Optional context updates (must provide complete context object)
}
```

## Best Practices

1. **Step Names**

   - Define step types as string literals for type safety
   - Use -ing suffix for active steps (e.g., 'LOADING')
   - Use -ed suffix for terminal states (e.g., 'LOADED')

2. **State Management**

   - Keep state updates immutable
   - Use context for internal machine state
   - Provide complete objects when updating state/context
   - Avoid optional properties in state/context objects

3. **Step Handlers**
   - Define terminal states as `null`
   - Use payloads to pass data between steps
   - Handle errors in the `onError` callback

# API Reference

See [docs](docs/README.md)
