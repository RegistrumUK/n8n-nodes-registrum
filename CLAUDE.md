# CLAUDE.md - n8n-nodes-registrum

n8n community node for the Registrum API. TypeScript, declarative-style node, published to npm as
`n8n-nodes-registrum`. Part of the `claude-ch-proj` workspace; the API it calls lives in the
sibling `ch-enrichment-api/`.

```bash
npm test          # vitest - the packaging and routing contract
npm run lint      # n8n's own community-node linter; it gates publication
npm run build     # tsc to dist/ (tests are excluded from dist on purpose)
npm run dev       # runs a local n8n with this node linked
```

## Why this exists

Both paying Registrum customers integrate through n8n rather than through code: one runs a fixed
search -> company -> financials loop every 20-60 minutes, 100% of its calls tagged `n8n`. The MCP
and npm developer channels produced 1,910 downloads and zero paying keys over the same period. So
this node goes where the paying behaviour already is. Evidence: `vdmeu/Ideas-Explore#24`.

## Policy

- **Declarative style only.** No `execute()`. n8n recommends it for REST APIs, and the linter is
  built around it. If something seems to need programmatic style, that is a design smell here -
  the API should change shape instead.
- **No runtime dependencies, ever.** n8n verification forbids them outright. Everything ships as
  devDependencies. A test asserts this, because it is the kind of thing a convenient import breaks.
- **Never restate the API's data rules in node copy.** Parsed-accounts caveats, PSC banding and
  ECCTA nuance live in the API and on registrum.co.uk. A field description that explains the
  regime will rot; one that says what the field is will not.
- **Do not edit `eslint.config.mjs`.** n8n owns it, ships it, and runs it before publish.
- TDD applies: the packaging rules are invisible failures (a wrong `n8n` path means the node
  silently never appears), so they are asserted in tests rather than remembered.

## Publishing

Releases go out from CI with an npm provenance statement, never from a laptop: since 1 May 2026
n8n will not verify a node published locally. `.github/workflows/publish.yml` fires on a version
tag. The one-time npm Trusted Publisher setup is a manual step - see `docs/00-BUILD-PLAN.md`.

## Where the detail lives

| You need | Read |
|---|---|
| n8n's current node spec, verification rules, linter rules | `docs/00-BUILD-PLAN.md` (dated, sourced from n8n's docs) |
| What this node is for, and who uses it | `docs/02-USER-JOURNEYS.md` |
| The API's endpoints and response shapes | `https://api.registrum.co.uk/openapi.json` - never a copy here |
| Registrum's own policies, deploy rules, business state | the workspace root `claude-ch-proj/CLAUDE.md` |
