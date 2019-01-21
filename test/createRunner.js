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

test("should return object with methods", (t) => {
  const runner = createRunner()

  t.is(typeof runner, "object")
  t.is(typeof runner.call, "function")
})

function createSpy(fn = () => {}) {
  const newLog = (...args) => {
    newLog.args.push(args)
    newLog.count++
    fn()
  }
  newLog.count = 0
  newLog.args = []
  return newLog
}

test.serial("should not log without log option", (t) => {
  const { store } = t.context.create()
  const { call } = createRunner()
  const oldLog = console.log
  console.log = createSpy()

  const effect = (foo, bar) => () => {
    return foo + bar
  }

  store.dispatch(call(effect, 2, 3))

  t.is(console.log.count, 0)

  console.log = oldLog
})

test.serial("should not log without log option and with logFinish", (t) => {
  const { store } = t.context.create()
  const { call } = createRunner({ logFinish: true })
  const oldLog = console.log
  console.log = createSpy()

  const effect = (foo, bar) => () => {
    return foo + bar
  }

  store.dispatch(call(effect, 2, 3))

  t.is(console.log.count, 0)

  console.log = oldLog
})

test.serial("should log with log option", (t) => {
  const { store } = t.context.create()
  const { call } = createRunner({ log: true })
  const oldLog = console.log
  console.log = createSpy()

  const effect = (foo, bar) => () => {
    return foo + bar
  }

  store.dispatch(call(effect, 2, 3))

  t.is(console.log.count, 1, "console.log should be called once")
  t.deepEqual(
    console.log.args,
    [[`Effect 'effect' with`, [2, 3]]],
    "console.log called with args",
  )

  console.log = oldLog
})

test.serial.todo("should log after promise resolves")

test.serial("should log with logFinish and log options", (t) => {
  const { store } = t.context.create()
  const { call } = createRunner({ log: true, logFinish: true })
  const oldLog = console.log
  console.log = createSpy()

  const effect = (foo, bar) => () => {
    return foo + bar
  }

  store.dispatch(call(effect, 2, 3))

  t.is(console.log.count, 2, "console.log should be called twice")
  t.deepEqual(
    console.log.args,
    [[`Effect 'effect' with`, [2, 3]], [`Finished effect 'effect' with`, 5]],
    "console.log called with args",
  )

  console.log = oldLog
})

test("should call beforeEach hook on each call", (t) => {
  const { store } = t.context.create()
  const orderCheck = []
  const spy = createSpy(() => orderCheck.push("before"))
  const { call } = createRunner({ beforeEach: spy })

  const effect = (foo, bar) => () => {
    orderCheck.push("effect")
    return foo + bar
  }
  const foo = () => () => {
    orderCheck.push("foo")
    return 5
  }

  store.dispatch(call(effect, 1, 2))
  store.dispatch(call(foo))

  t.is(spy.count, 2, "should be called twice")
  t.deepEqual(
    spy.args,
    [[{ fn: effect, args: [1, 2] }], [{ fn: foo, args: [] }]],
    "should be called with args",
  )
  t.deepEqual(
    orderCheck,
    ["before", "effect", "before", "foo"],
    "beforeEach should be called before",
  )
})

test("should call afterEach hook after each call", (t) => {
  const { store } = t.context.create()
  const orderCheck = []
  const spy = createSpy(() => orderCheck.push("after"))
  const { call } = createRunner({ afterEach: spy })

  const effect = (foo, bar) => () => {
    orderCheck.push("effect")
    return foo + bar
  }
  const foo = () => () => {
    orderCheck.push("foo")
    return 5
  }

  store.dispatch(call(effect, 1, 2))
  store.dispatch(call(foo))

  t.is(spy.count, 2, "should be called twice")
  t.deepEqual(
    spy.args,
    [
      [{ fn: effect, args: [1, 2], result: 3 }],
      [{ fn: foo, args: [], result: 5 }],
    ],
    "should be called with args",
  )
  t.deepEqual(
    orderCheck,
    ["effect", "after", "foo", "after"],
    "afterEach hook should be called after",
  )
})
