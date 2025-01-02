[**whatnow**](../README.md)

---

[whatnow](../README.md) / StepHandler

# Type Alias: StepHandler()\<TStep, TState, TPayload, TContext\>

> **StepHandler**\<`TStep`, `TState`, `TPayload`, `TContext`\>: (`state`, `act`) => `Promise`\<`Readonly`\<[`StepHandlerReturn`](StepHandlerReturn.md)\<`TStep`, `TState`, `TContext`\>\>\>

Defined in: [WhatNow.ts:30](https://github.com/ericvera/whatnow/blob/main/src/WhatNow.ts#L30)

## Type Parameters

| Type Parameter                |
| ----------------------------- |
| `TStep` _extends_ `string`    |
| `TState` _extends_ `object`   |
| `TPayload` _extends_ `object` |
| `TContext` _extends_ `object` |

## Parameters

| Parameter | Type                                                                       |
| --------- | -------------------------------------------------------------------------- |
| `state`   | `Readonly`\<`InternalState`\<`TStep`, `TState`, `TPayload`, `TContext`\>\> |
| `act`     | (`step`, `payload`?) => `void`                                             |

## Returns

`Promise`\<`Readonly`\<[`StepHandlerReturn`](StepHandlerReturn.md)\<`TStep`, `TState`, `TContext`\>\>\>
