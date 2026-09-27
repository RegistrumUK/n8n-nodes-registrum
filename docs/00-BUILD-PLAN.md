# Build plan and architecture

## Why this package exists

Read `vdmeu/Ideas-Explore#24` for the full measurement. The short version, from `usage_log`:

| Channel | Signal |
|---|---|
| n8n | Electric Car Scheme, 1,268 calls, `n8n` on **100%** of them |
| MCP / npm | 1,910 downloads in 28 days, **0** paying keys acquired |
| Keyless MCP endpoint | 2 real calls in 14 days, 0 signups |

Our highest-volume paying integration is a workflow canvas, not code. Nobody decided that; it was
found by reading a column. This node puts Registrum in the registry that population already
browses.

## Architecture

Declarative node, one resource (`Company`), nine operations, each a `routing.request` against
`https://api.registrum.co.uk`. There is no `execute()` and no transform layer: n8n issues the
request and hands the JSON straight through, so the API response shape is the node's contract.

```
credentials/RegistrumApi.credentials.ts   X-API-Key header + /v1/usage credential test
nodes/Registrum/Registrum.node.ts         node description, requestDefaults, resource list
nodes/Registrum/resources/company/        operations and their routes
nodes/Registrum/Registrum.node.json       codex: categories and doc links
```

**Why `/v1/usage` for the credential test:** it is authenticated, so a wrong key fails, but it
reads our own counters rather than calling Companies House. A test pointed at a company lookup
would spend one of the user's monthly calls, and one upstream call, every time they press Save.
Verified 2026-09-27: 200 with a valid key, 401 with an invalid one and 401 with none.

## n8n's requirements, as at 2026-09-27

Source: n8n's own docs at `docs.n8n.io/connect/create-nodes/**` and the `@n8n/node-cli` templates
shipped in `node_modules/@n8n/node-cli/dist/template/templates`. **Note the docs moved**: the old
`/integrations/creating-nodes/**` paths now 404.

- Package name must start with `n8n-nodes-` (or `@scope/n8n-nodes-`), and keywords must include
  `n8n-community-node-package`.
- `n8n` attribute lists compiled `dist/` paths, with `n8nNodesApiVersion: 1` and `strict: true`.
- `peerDependencies` may contain **only** `n8n-workflow: "*"`. Runtime `dependencies` must be
  empty - verified nodes are not allowed any.
- MIT licence, `files: ["dist"]`, real `homepage`, `author` and a `repository.url` matching a
  public GitHub repo.
- Declarative style is the default and the recommendation for REST APIs.
- Credentials need an `icon`, a password-typed secret field and a credential test. The linter rule
  `credential-test-required` makes the test effectively mandatory.
- Lifecycle scripts (`prepare`, `preinstall`, `postinstall`) and an `overrides` field are banned.

### Publication and verification

1. **Publishing must happen in CI with npm provenance.** Since 1 May 2026 n8n will not verify a
   node published from a local machine. `.github/workflows/publish.yml` fires on a `*.*.*` tag.
2. **One-time manual step (Eugene):** npm Trusted Publisher config for this package - npmjs.com →
   package settings → Publish access → Trusted Publishers → GitHub Actions, repository
   `RegistrumUK/n8n-nodes-registrum`, workflow `publish.yml`. With OIDC configured, no `NPM_TOKEN`
   secret is needed at all.
3. **Verification submission (Eugene):** the n8n Creator Portal at `creators.n8n.io/nodes`.
   Requires all automated checks passing and `npx @n8n/scan-community-package n8n-nodes-registrum`
   to pass.
4. Disqualifiers to stay clear of: duplicating an existing node, multi-service packages, and
   anything competing with n8n's paid features. A single-service node over our own API is none of
   these.

## Backlog

| # | Item | State |
|---|---|---|
| 1 | Declarative node, 9 company operations | done 2026-09-27 |
| 2 | API-key credential with a non-billing test | done 2026-09-27 |
| 3 | Packaging/routing contract tests | done 2026-09-27, 11 tests |
| 4 | Lint clean against `@n8n/community-nodes` | done 2026-09-27 |
| 5 | npm Trusted Publisher setup | **blocked on Eugene** |
| 6 | First publish (tag `0.1.0`) | blocked on 5 |
| 7 | Submit for verification | blocked on 6 |
| 8 | A published workflow template using the node | not started |
| 9 | Batch/enrich operations (`POST /v1/enrich`) | deliberately deferred - declarative style handles GET cleanly, and nobody has asked |

## Gate

Pre-registered, per `eccta-marketing-plan.md` Part 3: **>=1 signup carrying `utm_source=n8n`, or a
measurable step-change in npm installs, within 30 days of the node appearing in n8n's community
list.** Kill date: 30 days after listing. A null result is banked in
`registrum-landscape/references/demand-evidence.md` and this package is archived rather than
iterated on.
