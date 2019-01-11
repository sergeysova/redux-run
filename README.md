# redux-run

## Installation

```bash
npm install --save redux redux-thunk redux-run
```

## Usage

```js
// store.js
import { createStore, applyMiddleware } from "redux"
import thunk from "redux-thunk"
import { createRunner } from "redux-run"

const initialState = {
  pets: [],
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "addPet":
      return { ...state, pets: state.pets.concat(action.value) }
  }
  return state
}

export const store = createStore(reducer, applyMiddleware(thunk))
export const { call } = createRunner()
```

```js
// effects.js
// here you app logic present (side-effects)
import { call } from "./store"

export const request = (url, options) => () => {
  const fullUrl = `https://myapi.com/api${url}`

  return fetch({
    ...options,
    url: fullUrl,
  }).then((response) => response.json())
}

export const loadPet = (name) => async (dispatch) => {
  const pet = await dispatch(call(request, `/pet/${name}`))

  dispatch({ type: "addPet", value: pet })
  return pet
}
```

```js
// component.js
// for example part of react component
import { call } from './store'
import { loadPet } from './effects'

const mapDispatchToProps => (dispatch) => ({
  loadPet: (name) => dispatch(call(loadPet, name))
})
```
