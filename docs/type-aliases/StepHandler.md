[**whatnow**](../README.md)

---

[whatnow](../README.md) / StepHandler

# Type Alias: StepHandler()\<TStep, TState, TPayload, TContext\>

> **StepHandler**\<`TStep`, `TState`, `TPayload`, `TContext`\>: (`machineState`, `actions`) => `Promise`\<`Readonly`\<[`StepHandlerReturn`](StepHandlerReturn.md)\<`TStep`, `TState`, `TContext`\>\>\>

Defined in: [WhatNow.ts:29](https://github.com/ericvera/whatnow/blob/main/src/WhatNow.ts#L29)

## Type Parameters

| Type Parameter                | Default type                  |
| ----------------------------- | ----------------------------- |
| `TStep` _extends_ `string`    | -                             |
| `TState` _extends_ `object`   | -                             |
| `TPayload` _extends_ `object` | `Record`\<`string`, `never`\> |
| `TContext` _extends_ `object` | `Record`\<`string`, `never`\> |

## Parameters

| Parameter       | Type                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------- |
| `machineState`  | `Readonly`\<[`InternalState`](InternalState.md)\<`TStep`, `TState`, `TPayload`, `TContext`\>\> |
| `actions`       | \{ `act`: (`step`, `payload`?) => `void`; `reset`: (`step`) => `void`; \}                      |
| `actions.act`   | (`step`, `payload`?) => `void`                                                                 |
| `actions.reset` | (`step`) => `void`                                                                             |

## Returns

`Promise`\<`Readonly`\<[`StepHandlerReturn`](StepHandlerReturn.md)\<`TStep`, `TState`, `TContext`\>\>\>
