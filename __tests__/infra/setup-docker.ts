import { execSync } from 'child_process'

export function setup() {
    if (!process.env.DOCKER_HOST) {
        try {
            const socketPath = execSync("docker context inspect --format '{{.Endpoints.docker.Host}}'")
                .toString()
                .trim()
            process.env.DOCKER_HOST = socketPath
        } catch {
            // Docker might not be available in this environment
        }
    }
    process.env.TESTCONTAINERS_HOST_OVERRIDE ??= 'localhost'
}
