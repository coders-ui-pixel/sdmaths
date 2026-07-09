// Custom production entry point for cPanel's Passenger Node.js app runner.
// Passenger expects a plain JS file that starts an HTTP server on process.env.PORT —
// `next start` (a CLI command) doesn't fit that shape, so this wraps Next's
// programmatic server API instead. Runs against the regular `.next` build output
// (not the `output: "standalone"` folder), so no extra copy step is needed after `next build`.
const { createServer } = require("http")
const next = require("next")

const port = process.env.PORT || 3000
const app = next({ dev: false })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`> Ready on port ${port}`)
  })
})
