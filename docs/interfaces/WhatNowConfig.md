[**whatnow**](../README.md)

---

[whatnow](../README.md) / WhatNowConfig

# Interface: WhatNowConfig\<TStep, TState, TPayload, TContext\>

Defined in: [WhatNow.ts:61](https://github.com/ericvera/whatnow/blob/main/src/WhatNow.ts#L61)

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

Defined in: [WhatNow.ts:69](https://github.com/ericvera/whatnow/blob/main/src/WhatNow.ts#L69)

---

### initialState

> **initialState**: `TState`

Defined in: [WhatNow.ts:68](https://github.com/ericvera/whatnow/blob/main/src/WhatNow.ts#L68)

---

### onChange()

> **onChange**: () => `void`

Defined in: [WhatNow.ts:70](https://github.com/ericvera/whatnow/blob/main/src/WhatNow.ts#L70)

#### Returns

`void`

---

### onError()

> **onError**: (`error`) => `void`

Defined in: [WhatNow.ts:71](https://github.com/ericvera/whatnow/blob/main/src/WhatNow.ts#L71)

#### Parameters

| Parameter | Type    |
| --------- | ------- |
| `error`   | `Error` |

#### Returns

`void`

---

### steps

> **steps**: [`StepHandlers`](../type-aliases/StepHandlers.md)\<`TStep`, `TState`, `TPayload`, `TContext`\>

Defined in: [WhatNow.ts:67](https://github.com/ericvera/whatnow/blob/main/src/WhatNow.ts#L67)
