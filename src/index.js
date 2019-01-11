const defaultOptions = {
  log: false,
  logFinish: true,
  beforeEach: null,
  afterEach: null,
}

const createRunner = (options = defaultOptions) => {
  const call = (fn, ...args) => {
    const effect = fn(...args)

    if (options.beforeEach) {
      options.beforeEach({ fn, args })
    }

    return (dispatch, getState, ...another) => {
      const effectName = String(fn.name)
      if (options.log) {
        console.log("Effect '" + effectName + "' with", args)
        // TODO: Add timings
      }

      let result = effect(dispatch, getState, ...another)

      if (options.log && options.logFinish) {
        if (typeof result.then === "function") {
          result.then((value) => {
            console.log("Resolved effect '" + effectName + "' with", value)
          })
        } else {
          console.log("Finished effect '" + effectName + "' with", result)
        }
      }

      if (options.afterEach) {
        options.afterEach({ fn, args, result })
      }

      return result
    }
  }

  return { call }
}

module.exports = { createRunner, defaultOptions }
