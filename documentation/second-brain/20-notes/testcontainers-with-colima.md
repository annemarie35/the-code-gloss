---
type: note
title: Testcontainers avec Colima
date: 2026-10-08
tags: [testing, docker]
status: digéré
origin: private-doc/debugging-tools.md
---

node -e "const {protocol, hostname, pathname} = new URL('unix:///Users/anne-marieesteves/.colima/default/docker.sock');
console.log({protocol, hostname, pathname})"`
Debug URL parsing of Colima socket path

Bash(node -e "require('dns/promises').lookup('localhost', {all:true}).then(r=>console.log(r)).catch(e=>console.error(e.message))")

Bash(ls /.dockerenv 2>&1 && node -e "const fs=require('fs'); console.log('dockerenv exists:', fs.existsSync('/.dockerenv'))")

ls /.dockerenv 2>&1 && node -e "const fs=require('fs'); console.log('dockerenv exists:', fs.existsSync('/.dockerenv'))"

Debug resolveHost with Colima socket

```
DOCKER_HOST=unix:///Users/anne-marieesteves/.colima/default/docker.sock node -e "
const {getContainerRuntimeConfig} = require('./node_modules/testcontainers/build/container-runtime/strategies/utils/config.js');
const {resolveHost} = require('./node_modules/testcontainers/build/container-runtime/utils/resolve-host.js');
const dockerode = require('./node_modules/dockerode');
async function main() {
const config = await getContainerRuntimeConfig();
console.log('config:', JSON.stringify(config));
const {URL} = require('url');
const {hostname, pathname} = new URL(config.dockerHost);
const opts = hostname !== '' ? {host: hostname} : {socketPath: pathname};
const d = new dockerode(opts);
const info = await d.info();
console.log('Docker OS:', info.OperatingSystem);
const result = {uri: config.dockerHost, allowUserOverrides: true, dockerOptions: opts, composeEnvironment: {}};
const host = await resolveHost(d, result, 'https://index.docker.io/v1/');
console.log('resolved host:', JSON.stringify(host));
}
main().catch(e => console.error('Error:', e.message));
" 2>&1
```

⏺ The resolveHost is returning "null\nnull" due to a gateway lookup issue with Colima. The fix is TESTCONTAINERS_HOST_OVERRIDE=localhost:

⏺ All 8 tests pass including the 2 new testcontainers tests. Here's a summary of what was added:

Files created:

- **tests**/infra/database/repositories.test.ts — uses a real PostgreSQL container via testcontainers, creates the people table from the  
  migration SQL, and tests insert + select

package.json changes:

- test — now excludes **tests**/infra/\*\* (fast unit tests)
- test:db — runs **tests**/infra/\*\* with the Colima Docker socket (DOCKER_HOST) and host override (TESTCONTAINERS_HOST_OVERRIDE=localhost)
  needed to work with Colima

Note: The two env vars in test:db are needed because you're using Colima (not Docker Desktop), which uses a non-standard socket path.

`npm run test:db -- --reporter=verbose 2>&1`
`DOCKER_HOST=$(docker context inspect --format '{{.Endpoints.docker.Host}}') TESTCONTAINERS_HOST_OVERRIDE=localhost vitest __test
     s__/infra --reporter=verbose `

`DEBUG=testcontainers* npm run test:db -- --reporter=verbose 2>&1 | grep -E "strategy|DOCKER_HOST|custom config|applicable" | head -20`

`node -e "process.env.TESTCONTAINERS_HOST_OVERRIDE = null; console.log(typeof process.env.TESTCONTAINERS_HOST_OVERRIDE,                 
process.env.TESTCONTAINERS_HOST_OVERRIDE)"`  
Check how null is stored in process.env

`echo "TESTCONTAINERS_HOST_OVERRIDE=$TESTCONTAINERS_HOST_OVERRIDE" && env | grep TESTCONTAINERS`  
Check shell environment for TESTCONTAINERS vars

1. Fix TESTCONTAINERS_HOST_OVERRIDE to always be 'localhost' in the test file
2. Or add the correct values to .envrc.sample so the proper env vars get set when using direnv

The root cause is that TESTCONTAINERS_HOST_OVERRIDE=null is already set in your shell environment (likely from a previous attempt), so ??=
doesn't override it.

`TESTCONTAINERS_HOST_OVERRIDE=localhost npm run test:db -- --reporter=verbose 2>&1`

`colima status`

`docker context ls && docker info --format '{{.DockerRootDir}}' 2>/dev/null | head -3) `

Check Docker context and info `docker context ls && docker info --format '{{.DockerRootDir}}' 2>/dev/null | head -3`

/var/run/docker.sock

`node -e "const {existsSync} = require('fs'); console.log(existsSync('/var/run/docker.sock'))"`

## ⏺ All 8 tests pass now. Here's a summary of what was happening and what was fixed:

Root cause: `/var/run/docker.sock` is a broken symlink (pointing to Docker Desktop's socket which isn't running).
Testcontainers' UnixSocketStrategy uses existsSync() which returns false for broken symlinks, so that strategy fails. The  
ConfigurationStrategy (which reads DOCKER_HOST) was apparently not being picked up in the initial run.

The real issue was the DOCKER_HOST env var wasn't inherited by the vitest worker process at the time — running via direnv exec . ensures all .envrc variables (including DOCKER_HOST) are properly loaded before npm spawns vitest.

Fixes applied:

1. **tests**/infra/database/repositories.test.ts: added ?. optional chaining in afterAll so a beforeAll failure doesn't cascade into a secondary confusing error
2. .envrc: TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE was correctly /var/run/docker.sock already — no change needed there

Going forward: run npm run test:db from a shell where direnv is active (which you normally have), or make sure DOCKER_HOST is set before running tests.

## Liens

- Area : [[testing]]
