## types of logs
- info
- warning
- error
- fatal
- success
- debug

## logging library
 - winston => we will use winston
 - morgan
 - pino

## how to have a req co-relation id 1st approach
   this approach is not so good as it does not care about the corner cases => agar koi aisa case hua jo touch hi nahi kar raha reqest object ko (i.e - background jobs) crons in linux **
  - generate a unique id (uuid)
  - put the id in current req using the middleware
  - and then app.use(that Middleware)

  solution => use { AsyncLocalStorage } from "node:async_hooks";

