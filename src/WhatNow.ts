import { Queue } from './internal/Queue.js'

// Represents the internal state structure
type InternalState<
  TStep extends string,
  TState extends object,
  TPayload extends object = Record<string, never>,
  TContext extends object = Record<string, never>,
> = {
  state: TState
  context: TContext
  step: TStep
  payload: Partial<TPayload>
}

// Defines what a step handler must return (partial state with required next
// step)
export type StepHandlerReturn<
  TStep extends string,
  TState extends object,
  TContext extends object,
> = {
  step: TStep
  state?: Partial<TState>
  context?: Partial<TContext>
}

// Async function that processes a step and returns the next step and any state
// changes
export type StepHandler<
  TStep extends string,
  TState extends object,
  TPayload extends object,
  TContext extends object,
> = (
  state: Readonly<InternalState<TStep, TState, TPayload, TContext>>,
) => Promise<Readonly<StepHandlerReturn<TStep, TState, TContext>>>

// Maps step names to their handlers, null means terminal state
export type StepHandlers<
  TStep extends string,
  TState extends object,
  TPayload extends object,
  TContext extends object,
> = Record<TStep, StepHandler<TStep, TState, TPayload, TContext> | null>

// Represents actions that can modify state
type StepAction<TStep extends string, TPayload extends object> = {
  step: TStep
  payload?: Partial<TPayload>
}

/**
 * Manages state transitions through a series of steps.
 * Each step can have an associated async handler that processes the state
 * and determines the next step.
 */
export interface WhatNowConfig<
  TStep extends string,
  TState extends object,
  TPayload extends object = Record<string, never>,
  TContext extends object = Record<string, never>,
> {
  steps: StepHandlers<TStep, TState, TPayload, TContext>
  initialState: TState
  initialContext?: TContext
  onChange: () => void
  onError: (error: Error) => void
}

export class WhatNow<
  TStep extends string,
  TState extends object,
  TPayload extends object = Record<string, never>,
  TContext extends object = Record<string, never>,
> {
  // The current application state
  private _state: TState

  // The internal context state
  private _context: TContext

  // Map of step names to their handler functions
  private steps: StepHandlers<TStep, TState, TPayload, TContext>

  // Queue of pending step transitions
  private queue: Queue<StepAction<TStep, TPayload>>

  // Currently executing step (to prevent reentrance)
  private processingStep: TStep | undefined

  // Callback to notify of state changes
  private onChange: () => void

  // Handler for any errors that occur during step processing
  private onError: (error: Error) => void

  /**
   * Creates a new WhatNow instance
   * @param config - Configuration object for the state machine
   * @param config.steps - Map of step names to their handler functions
   * @param config.initialState - Initial state for the machine
   * @param config.initialContext - Initial context for internal state
   * @param config.onChange - Callback to notify of state changes
   * @param config.onError - Handler for any errors that occur during step processing
   */
  constructor(config: WhatNowConfig<TStep, TState, TPayload, TContext>) {
    this.steps = config.steps
    this._state = config.initialState
    this._context = config.initialContext ?? ({} as TContext)
    this.onChange = config.onChange
    this.onError = config.onError

    this.queue = new Queue(() => {
      // Attempt to process the next step (if any) when the queue is updated
      void this.processStep()
    })
  }

  /**
   * Gets the current application state
   */
  get state(): Readonly<TState> {
    return this._state
  }

  /**
   * Processes steps in sequence until a terminal state is reached
   */
  private async processStep(): Promise<void> {
    const current = this.queue.current

    // Skip if no current step or if already processing this step
    if (!current || this.processingStep === current.step) {
      return
    }

    try {
      this.processingStep = current.step
      let nextStep = current.step
      let currentPayload = current.payload || {}
      let handler = this.steps[nextStep]

      // Process steps until a terminal state (null handler) is reached
      while (handler !== null) {
        // Execute the current step's handler
        const result = await handler({
          state: this._state,
          context: this._context,
          step: nextStep,
          payload: currentPayload,
        })

        // Update internal context state
        if (result.context) {
          this._context = { ...this._context, ...result.context }
        }

        // Update external state and notify listeners
        if (result.state) {
          this._state = { ...this._state, ...result.state }
          this.onChange()
        }

        // Prepare for next step, clearing payload after first step
        nextStep = result.step
        currentPayload = {}
        handler = this.steps[nextStep]
      }

      // Terminal state reached, clear processing flag and advance queue
      this.processingStep = undefined
      this.queue.done()
    } catch (e) {
      const error =
        e instanceof Error ? e : new Error(`Unexpected error: ${String(e)}`)
      this.processingStep = undefined
      this.onError(error)
    }
  }

  /**
   * Enqueues a new step to be processed
   */
  public act(step: TStep, payload: Partial<TPayload> = {}): void {
    this.queue.enqueue({ step, payload })
  }

  /**
   * Resets the state machine to a new step
   */
  public reset(nextStep: TStep): void {
    this.processingStep = undefined
    this.queue.clear()
    this.act(nextStep)
  }
}
