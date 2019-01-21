import { createRunner, defaultOptions } from "../src/index"
import test, { beforeEach } from "ava"
import { createStore, applyMiddleware } from "redux"
import thunk from "redux-thunk"

beforeEach((t) => {
  t.context.create = () => {
    const initialState = { value: 0 }
    const action = (value) => ({ type: "set", value })
    const reducer = (state = initialState, action) => {
      if (action.type === "set") {
        return { ...state, value: action.value }
      }
      return state
    }

    const store = createStore(reducer, applyMiddleware(thunk))

    return { store, action }
  }
})

test("should call effect", (t) => {
  const { call } = createRunner()

  const target = (a, b) => () => a + b

  const effect = call(target, 2, 3)
  const result = effect(null, null)

  t.is(result, 5)
})

test("should pass dispatch and getState from redux", (t) => {
  const { store, action } = t.context.create()
  const effect = (another) => (dispatch, getState) => {
    const { value } = getState()
    const newValue = value + another
    dispatch(action(newValue))
  }
  const { call } = createRunner()

  store.dispatch(action(1))
  store.dispatch(call(effect, 2))

  t.is(store.getState().value, 3)
})

test("dispatch(call) should return result of effect", (t) => {
  const { store, action } = t.context.create()
  const { call } = createRunner()
  const effect = (another) => (dispatch, getState) => {
    const { value } = getState()
    return value + another
  }

  store.dispatch(action(1))
  const result = store.dispatch(call(effect, 2))

  t.is(result, 3)
})

test("correctly run effect from effect", (t) => {
  const { store, action } = t.context.create()
  const { call } = createRunner()

  const foo = (another) => (dispatch, getState) => {
    const { value } = getState()
    dispatch(action(another + value))
  }

  const bar = (a, b) => (dispatch) => {
    dispatch(call(foo, a + b))
  }

  store.dispatch(action(1))
  store.dispatch(call(bar, 2, 3))

  t.is(store.getState().value, 6, "store has actual value")
})

test("correctly return value from call effect from effect", (t) => {
  const { store, action } = t.context.create()
  const { call } = createRunner()

  const foo = (another) => (dispatch, getState) => {
    const { value } = getState()
    return another + value
  }

  const bar = (a, b) => (dispatch) => dispatch(call(foo, a + b))

  store.dispatch(action(1))
  const result = store.dispatch(call(bar, 2, 3))

  t.is(store.getState().value, 1, "store has actual value")
  t.is(result, 6, "effect returned actual value")
})
