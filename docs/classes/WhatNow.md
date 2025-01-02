[**whatnow**](../README.md)

---

[whatnow](../README.md) / WhatNow

# Class: WhatNow\<TStep, TState, TPayload, TContext\>

Defined in: [WhatNow.ts:72](https://github.com/ericvera/whatnow/blob/main/src/WhatNow.ts#L72)

## Type Parameters

| Type Parameter                | Default type                  |
| ----------------------------- | ----------------------------- |
| `TStep` _extends_ `string`    | -                             |
| `TState` _extends_ `object`   | -                             |
| `TPayload` _extends_ `object` | `Record`\<`string`, `never`\> |
| `TContext` _extends_ `object` | `Record`\<`string`, `never`\> |

## Constructors

### new WhatNow()

> **new WhatNow**\<`TStep`, `TState`, `TPayload`, `TContext`\>(`config`): [`WhatNow`](WhatNow.md)\<`TStep`, `TState`, `TPayload`, `TContext`\>

Defined in: [WhatNow.ts:108](https://github.com/ericvera/whatnow/blob/main/src/WhatNow.ts#L108)

Creates a new WhatNow instance

#### Parameters

| Parameter | Type                                                                                           | Description                                |
| --------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `config`  | [`WhatNowConfig`](../interfaces/WhatNowConfig.md)\<`TStep`, `TState`, `TPayload`, `TContext`\> | Configuration object for the state machine |

#### Returns

[`WhatNow`](WhatNow.md)\<`TStep`, `TState`, `TPayload`, `TContext`\>

## Accessors

### state

#### Get Signature

> **get** **state**(): `Readonly`\<`TState`\>

Defined in: [WhatNow.ts:124](https://github.com/ericvera/whatnow/blob/main/src/WhatNow.ts#L124)

Gets the current application state

##### Returns

`Readonly`\<`TState`\>

## Methods

### act()

> **act**(`step`, `payload`): `void`

Defined in: [WhatNow.ts:189](https://github.com/ericvera/whatnow/blob/main/src/WhatNow.ts#L189)

Enqueues a new step to be processed

#### Parameters

| Parameter | Type                    |
| --------- | ----------------------- |
| `step`    | `TStep`                 |
| `payload` | `Partial`\<`TPayload`\> |

#### Returns

`void`

---

### reset()

> **reset**(`nextStep`): `void`

Defined in: [WhatNow.ts:196](https://github.com/ericvera/whatnow/blob/main/src/WhatNow.ts#L196)

Resets the state machine to a new step

#### Parameters

| Parameter  | Type    |
| ---------- | ------- |
| `nextStep` | `TStep` |

#### Returns

`void`
