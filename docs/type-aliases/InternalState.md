[**whatnow**](../README.md)

---

[whatnow](../README.md) / InternalState

# Type Alias: InternalState\<TStep, TState, TPayload, TContext\>

> **InternalState**\<`TStep`, `TState`, `TPayload`, `TContext`\>: `object`

Defined in: [WhatNow.ts:4](https://github.com/ericvera/whatnow/blob/main/src/WhatNow.ts#L4)

## Type Parameters

| Type Parameter                | Default type                  |
| ----------------------------- | ----------------------------- |
| `TStep` _extends_ `string`    | -                             |
| `TState` _extends_ `object`   | -                             |
| `TPayload` _extends_ `object` | `Record`\<`string`, `never`\> |
| `TContext` _extends_ `object` | `Record`\<`string`, `never`\> |

## Type declaration

### context

> **context**: `TContext`

### payload

> **payload**: `Partial`\<`TPayload`\>

### state

> **state**: `TState`

### step

> **step**: `TStep`
