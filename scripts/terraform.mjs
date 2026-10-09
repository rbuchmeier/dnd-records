import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const args = process.argv.slice(2)
const lockTest = args[0] === '--lock-test'
if (lockTest) args.shift()

const binary =
  process.env.TERRAFORM_BIN ||
  resolve(root, '.local/tools/terraform-1.16.5/terraform')
if (!existsSync(binary)) {
  console.error(
    'Terraform 1.16.5 is required. See infra/README.md for setup, or set TERRAFORM_BIN to its absolute path.',
  )
  process.exit(1)
}

if (!args.length) {
  console.error(
    'Usage: npm run infra:terraform -- [--lock-test] <terraform command> [arguments]',
  )
  process.exit(1)
}

const command = args[0]
const offline =
  ['fmt', 'validate', 'test', 'version', 'providers'].includes(command) ||
  (command === 'init' && args.includes('-backend=false'))
if (!offline) {
  const required = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY']
  if (!lockTest) required.push('CLOUDFLARE_API_TOKEN')
  const missing = required.filter((name) => !process.env[name]?.trim())
  if (missing.length) {
    console.error(
      `Missing local credentials: ${missing.join(', ')}. Fill .env.terraform; never paste credentials into chat.`,
    )
    process.exit(1)
  }
}

const result = spawnSync(
  binary,
  [`-chdir=${resolve(root, lockTest ? 'infra/lock-test' : 'infra')}`, ...args],
  {
    stdio: 'inherit',
    env: process.env,
  },
)
if (result.error) {
  console.error(
    'Could not start Terraform. Check the binary path and executable permissions.',
  )
  process.exit(1)
}
process.exit(result.status ?? 1)
