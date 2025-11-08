import { execSync } from 'node:child_process'
import { readFileSync, statSync } from 'node:fs'

const MAX_TEXT_FILE_SIZE = 1024 * 1024
const staged = execSync('git diff --cached --name-only --diff-filter=ACM', {
  encoding: 'utf8',
})
  .split('\n')
  .map((file) => file.trim())
  .filter(Boolean)

const blockedPatterns = [
  { name: 'private-key', regex: /BEGIN (RSA|EC|OPENSSH|DSA)? ?PRIVATE KEY/ },
  {
    name: 'aws-secret-access-key',
    regex: /AWS_SECRET_ACCESS_KEY\s*[:=]\s*['"]?[A-Za-z0-9/+=]{16,}['"]?/,
  },
  {
    name: 'generic-api-key',
    regex: /(api|secret|access)[_-]?key\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/i,
  },
]

for (const file of staged) {
  let size = 0
  try {
    size = statSync(file).size
  } catch {
    continue
  }

  if (size > MAX_TEXT_FILE_SIZE) {
    continue
  }

  let content = ''
  try {
    content = readFileSync(file, 'utf8')
  } catch {
    continue
  }

  for (const { name, regex } of blockedPatterns) {
    if (regex.test(content)) {
      console.error(`Potential secret detected (${name}) in staged file: ${file}`)
      process.exit(1)
    }
  }
}

console.log('No obvious secrets found in staged files.')
