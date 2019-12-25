import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  const env = {
    ...process.env,
    RUNNER_TEMP: '/tmp',
    RUNNER_TOOL_CACHE: '/tmp'
  }
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  console.log(cp.execSync(`node ${ip}`, { env }).toString())
})
