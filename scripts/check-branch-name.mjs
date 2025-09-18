import { execSync } from "node:child_process"

const branchName = execSync("git symbolic-ref --quiet --short HEAD", {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "ignore"],
}).trim()

const branchPattern =
  /^(main|develop|release\/[a-z0-9._-]+|hotfix\/[0-9]+-[a-z0-9._-]+|(feat|fix|chore|docs|refactor|test|ci|build|perf|revert)\/[0-9]+-[a-z0-9._-]+)$/

if (!branchPattern.test(branchName)) {
  console.error(
    `Invalid branch name: "${branchName}"\n` +
      "Allowed examples: feat/123-login-page, fix/456-api-timeout, hotfix/789-critical-bug, release/v1.2.0"
  )
  process.exit(1)
}

console.log(`Branch name OK: ${branchName}`)
