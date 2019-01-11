import { createRunner, defaultOptions } from "../src/index"
import test from "ava"
import { createStore, applyMiddleware } from "redux"
import thunk from "redux-thunk"

test("createRunner should return object with methods", (t) => {
  const runner = createRunner()

  t.is(typeof runner, "object")
  t.is(typeof runner.call, "function")
})

test(".call should call effect", (t) => {
  const { call } = createRunner()

  const target = (a, b) => () => a + b

  const effect = call(target, 2, 3)
  const result = effect(null, null)

  t.is(result, 5)
})

test(".call should pass dispatch and getState from redux", (t) => {
  const initialState = {
    value: 0,
  }
  const reducer = (state = initialState, action) => {
    if (action.type === "set") {
      return { ...state, value: action.value }
    }
    return state
  }

  const effect = (another) => (dispatch, getState) => {
    const { value } = getState()
    const newValue = value + another
    dispatch({ type: "set", value: newValue })
  }

  const store = createStore(reducer, applyMiddleware(thunk))
  const { call } = createRunner()

  store.dispatch({ type: "set", value: 1 })
  store.dispatch(call(effect, 2))

  t.is(store.getState().value, 3)
})
