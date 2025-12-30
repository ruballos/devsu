# Demo Devops NodeJs

This is a simple application to be used in the technical test of DevOps.

## Getting Started

### Prerequisites

- Node.js 20.x (tested with Node 20 in CI)

### Installation

Clone this repo.

```bash
git clone https://bitbucket.org/devsu/demo-devops-nodejs.git
```

Install dependencies.

```bash
npm i
```

### Database

The database is generated as a file in the main path when the project is first run, and its name is `dev.sqlite`.

Consider giving access permissions to the file for proper functioning.

## Usage

### Run tests

```bash
npm run test
```

### Run locally

```bash
npm run start
```

Open `http://localhost:8000/devsu/api/users` with your browser to see the result.

## Health check

A health endpoint was added to support Kubernetes readiness/liveness probes.

- `GET /healthz` returns HTTP 200 with body `ok`.

Additionally, the users router exposes:

- `GET /devsu/api/users/healthz` (mapped from the users router)

## Testing behavior (server lifecycle)

To avoid port conflicts and unwanted side effects during unit tests, the application startup was adjusted:

- The database `sequelize.sync()` and `app.listen()` are only executed when `NODE_ENV` is not `test`.
- When running tests, the module exports the Express app without starting an HTTP server.
- A `server` reference is exported and, if present, is closed in the test teardown.

This keeps unit tests deterministic and prevents failures caused by multiple test workers trying to bind the same port.

## Additional npm scripts

To support the CI/CD workflow, the repository includes scripts used by the pipeline:

- `lint`: runs ESLint checks.
- `test`: runs unit tests (Jest).
- `test:coverage`: runs unit tests with coverage output (used for the coverage artifact).

Example scripts section:

```json
{
  "scripts": {
    "start": "node index.js",
    "test": "jest",
    "lint": "eslint .",
    "test:coverage": "jest --coverage"
  }
}
```

The exact commands may vary slightly depending on the ESLint/Jest configuration, but the pipeline expects these script names to exist.

## CI/CD overview

The CI/CD pipeline (GitHub Actions) validates and deploys changes on every push to `main`:

- Static analysis: `npm run lint`
- Dependency audit (report-only): `npm audit --audit-level=high`
- Unit tests: `npm test`
- Coverage: `npm run test:coverage` (uploads `coverage/` as an artifact)
- Vulnerability scans (report-only, SARIF uploaded to GitHub Security):
  - Repository filesystem scan (Trivy FS)
  - Docker image scan (Trivy image)
- Build image, push to Artifact Registry, deploy to GKE:
  - Builds the Docker image once, saves it as an artifact to reuse for scan and push
  - Pushes the image to Artifact Registry
  - Applies Kubernetes manifests (namespace/configmap/secret/deployment/service/hpa/ingress)
  - Waits for deployment rollout completion

Vulnerability findings are reported but do not block deployment.

## Features

These services can perform,

### Create User

To create a user, the endpoint **/devsu/api/users** must be consumed with the following parameters:

```bash
  Method: POST
```

```json
{
    "dni": "dni",
    "name": "name"
}
```

If the response is successful, the service will return an HTTP Status 200 and a message with the following structure:

```json
{
    "id": 1,
    "dni": "dni",
    "name": "name"
}
```

If the response is unsuccessful, we will receive status 400 and the following message:

```json
{
    "error": "error"
}
```

### Get Users

To get all users, the endpoint **/devsu/api/users** must be consumed with the following parameters:

```bash
  Method: GET
```

If the response is successful, the service will return an HTTP Status 200 and a message with the following structure:

```json
[
    {
        "id": 1,
        "dni": "dni",
        "name": "name"
    }
]
```

### Get User

To get an user, the endpoint **/devsu/api/users/<id>** must be consumed with the following parameters:

```bash
  Method: GET
```

If the response is successful, the service will return an HTTP Status 200 and a message with the following structure:

```json
{
    "id": 1,
    "dni": "dni",
    "name": "name"
}
```

If the user id does not exist, we will receive status 404 and the following message:

```json
{
    "error": "User not found: <id>"
}
```

If the response is unsuccessful, we will receive status 400 and the following message:

```json
{
    "errors": [
        "error"
    ]
}
```

## License

Copyright © 2023 Devsu. All rights reserved.
