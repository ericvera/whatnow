[**whatnow**](../README.md)

---

[whatnow](../README.md) / WhatNow

# Class: WhatNow\<TStep, TState, TPayload, TContext\>

Defined in: [WhatNow.ts:74](https://github.com/ericvera/whatnow/blob/main/src/WhatNow.ts#L74)

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

Defined in: [WhatNow.ts:113](https://github.com/ericvera/whatnow/blob/main/src/WhatNow.ts#L113)

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

Defined in: [WhatNow.ts:135](https://github.com/ericvera/whatnow/blob/main/src/WhatNow.ts#L135)

Gets the current application state

##### Returns

`Readonly`\<`TState`\>

## Methods

### act()

> **act**(`step`, `payload`): `void`

Defined in: [WhatNow.ts:237](https://github.com/ericvera/whatnow/blob/main/src/WhatNow.ts#L237)

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

> **reset**(`resetStep`): `void`

Defined in: [WhatNow.ts:249](https://github.com/ericvera/whatnow/blob/main/src/WhatNow.ts#L249)

Resets the state machine to a new step

#### Parameters

| Parameter   | Type    |
| ----------- | ------- |
| `resetStep` | `TStep` |

#### Returns

`void`
