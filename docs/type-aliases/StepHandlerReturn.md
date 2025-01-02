[**whatnow**](../README.md)

---

[whatnow](../README.md) / StepHandlerReturn

# Type Alias: StepHandlerReturn\<TStep, TState, TContext\>

> **StepHandlerReturn**\<`TStep`, `TState`, `TContext`\>: `object`

Defined in: [WhatNow.ts:18](https://github.com/ericvera/whatnow/blob/main/src/WhatNow.ts#L18)

## Type Parameters

| Type Parameter                | Default type                  |
| ----------------------------- | ----------------------------- |
| `TStep` _extends_ `string`    | -                             |
| `TState` _extends_ `object`   | -                             |
| `TContext` _extends_ `object` | `Record`\<`string`, `never`\> |

## Type declaration

### context?

> `optional` **context**: `Partial`\<`TContext`\>

### state?

> `optional` **state**: `Partial`\<`TState`\>

### step

> **step**: `TStep`
