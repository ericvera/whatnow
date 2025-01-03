[**whatnow**](../README.md)

---

[whatnow](../README.md) / WhatNowConfig

# Interface: WhatNowConfig\<TStep, TState, TPayload, TContext\>

Defined in: [WhatNow.ts:58](https://github.com/ericvera/whatnow/blob/main/src/WhatNow.ts#L58)

Manages state transitions through a series of steps.
Each step can have an associated async handler that processes the state
and determines the next step.

## Type Parameters

| Type Parameter                | Default type                  |
| ----------------------------- | ----------------------------- |
| `TStep` _extends_ `string`    | -                             |
| `TState` _extends_ `object`   | -                             |
| `TPayload` _extends_ `object` | `Record`\<`string`, `never`\> |
| `TContext` _extends_ `object` | `Record`\<`string`, `never`\> |

## Properties

### initialContext?

> `optional` **initialContext**: `TContext`

Defined in: [WhatNow.ts:66](https://github.com/ericvera/whatnow/blob/main/src/WhatNow.ts#L66)

---

### initialState

> **initialState**: `TState`

Defined in: [WhatNow.ts:65](https://github.com/ericvera/whatnow/blob/main/src/WhatNow.ts#L65)

---

### onChange()

> **onChange**: () => `void`

Defined in: [WhatNow.ts:67](https://github.com/ericvera/whatnow/blob/main/src/WhatNow.ts#L67)

#### Returns

`void`

---

### onError()

> **onError**: (`error`) => `void`

Defined in: [WhatNow.ts:68](https://github.com/ericvera/whatnow/blob/main/src/WhatNow.ts#L68)

#### Parameters

| Parameter | Type    |
| --------- | ------- |
| `error`   | `Error` |

#### Returns

`void`

---

### steps

> **steps**: [`StepHandlers`](../type-aliases/StepHandlers.md)\<`TStep`, `TState`, `TPayload`, `TContext`\>

Defined in: [WhatNow.ts:64](https://github.com/ericvera/whatnow/blob/main/src/WhatNow.ts#L64)
