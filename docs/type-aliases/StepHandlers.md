[**whatnow**](../README.md)

---

[whatnow](../README.md) / StepHandlers

# Type Alias: StepHandlers\<TStep, TState, TPayload, TContext\>

> **StepHandlers**\<`TStep`, `TState`, `TPayload`, `TContext`\>: `Record`\<`TStep`, [`StepHandler`](StepHandler.md)\<`TStep`, `TState`, `TPayload`, `TContext`\> \| `null`\>

Defined in: [WhatNow.ts:40](https://github.com/ericvera/whatnow/blob/main/src/WhatNow.ts#L40)

## Type Parameters

| Type Parameter                | Default type                  |
| ----------------------------- | ----------------------------- |
| `TStep` _extends_ `string`    | -                             |
| `TState` _extends_ `object`   | -                             |
| `TPayload` _extends_ `object` | `Record`\<`string`, `never`\> |
| `TContext` _extends_ `object` | `Record`\<`string`, `never`\> |
