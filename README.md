# WhatNow

A lightweight, type-safe state machine for managing complex async workflows in TypeScript.

## Features

- 🎯 **Type-safe**: Full TypeScript support with generic types for steps, state, and payloads
- 🔄 **Async-first**: Built for handling asynchronous operations
- 📦 **Zero dependencies**: Pure TypeScript implementation
- 🔒 **Immutable state**: State updates are always immutable
- 📋 **Queue-based**: Handles multiple state transitions in order
- 🚦 **Terminal states**: Support for defining end states
- 🛡️ **Error handling**: Built-in error handling for async operations

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
    INITIALIZING: async ({ context }) => {
      const unsubscribe = dataSource.subscribe((newData) => {
        machine.act('PROCESSINGDATA', { newData })
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
    PROCESSINGDATA: async ({ state, payload }) => {
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
    UNLOADING: async ({ state, context }) => {
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
  initialContext: TContext
  onChange: () => void
  onError: (error: Error) => void
}
```

- `steps`: Map of step names to their handler functions
- `initialState`: Initial state object (external state)
- `initialContext`: Initial context object (internal state)
- `onChange`: Callback triggered when state changes
- `onError`: Error handler for async operations

#### Methods

- `act(step: TStep, payload?: Partial<TPayload>)`: Enqueue a new step transition
- `reset(nextStep: TStep)`: Clear the queue and start from a specific step
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
) => Promise<Readonly<StepHandlerReturn<TStep, TState>>>
```

Return value:

```typescript
interface StepHandlerReturn<TStep, TState> {
  step: TStep // The next step to transition to
  state?: Partial<TState> // Optional state updates
}
```

## Best Practices

1. Define your step types as string literals for better type safety
2. Keep state updates immutable
3. Use context for internal machine state that shouldn't be exposed
4. Use payloads to pass data to steps
5. Define terminal states as `null` handlers
6. Handle errors appropriately in the `onError` callback

# API Reference

See [docs](docs/README.md)
