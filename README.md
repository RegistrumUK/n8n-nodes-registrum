# n8n-nodes-registrum

UK company data from Companies House inside n8n: company profiles, directors, ownership chains
traced to real people, parsed accounts, and ECCTA identity-verification status.

This is a community node for [n8n](https://n8n.io). It talks to the
[Registrum API](https://registrum.co.uk), which reads the Companies House register and does three
things to it that the official API does not: parses filed accounts into comparable figures,
follows corporate owners through holding companies until it reaches individuals, and reads
identity-verification status per person.

## Installation

In n8n: **Settings → Community nodes → Install**, then enter `n8n-nodes-registrum`.

Self-hosted n8n can also install it manually:

```bash
npm install n8n-nodes-registrum
```

## Credentials

Create a **Registrum API** credential and pick how you want in:

- **Email (14-day free trial, no key needed).** Type your email and save. We send you a
  confirmation link; click it and your workflows work straight away - you never copy a key.
  Every operation is included for 14 days, then the free plan applies. Each save sends a fresh
  link, so if you lose the email, just save the credential again.
- **API Key.** Paste a key from [registrum.co.uk](https://registrum.co.uk). The free plan needs
  no card.

n8n tests the credential against `/v1/usage`, which checks it without spending one of your
company lookups.

## Operations

All operations are on the **Company** resource.

| Operation | What you get |
|---|---|
| Search | Find UK companies by name or number |
| Get Profile | Registered name, status, address, SIC codes, filing dates |
| Get Everything | Profile, directors, owners, accounts and verification status in one call, charged as one call |
| Get Directors | Current and resigned officers, with their other appointments |
| Get Director Network | Companies connected to this one through shared officers |
| Get Owners | Persons with significant control, with natures of control decoded |
| Get Ownership Chain | Corporate owners followed through holding companies to individuals |
| Get Financials | Accounts parsed from the filed iXBRL |
| Get Identity Verification Status | Who has verified under ECCTA, and the per-person deadline for those who have not |

Company numbers are zero-padded for you, so `445790` and `00445790` both work.

## Two things worth knowing about the data

**Accounts often contain no turnover figure.** Micro-entity, dormant and small filleted accounts
are not required to file a profit and loss account, and a large minority of companies file
accounts with no machine-readable version at all. When a filing genuinely does not carry a figure,
`Get Financials` returns `available: false` with a reason rather than guessing. A confidently
wrong revenue number is worse than no number.

**Ownership percentages are bands, not numbers.** The register publishes 25-50%, 50-75% and
75-100%, never a precise figure. Anything showing you an exact percentage from PSC data has
invented the precision.

## Example: enrich a list of companies

1. **Schedule Trigger** - however often you want it.
2. Read your company numbers (Google Sheets, Airtable, a database, an HTTP call).
3. **Registrum → Get Everything** with Company Number set to `{{ $json.company_number }}`.
4. Write the result back.

One Registrum call per company, whatever you do with the result.

## Compatibility

Tested against n8n 1.x. Requires Node 20 or later, which n8n itself requires.

## Support

Issues and feature requests: [GitHub issues](https://github.com/RegistrumUK/n8n-nodes-registrum/issues).
Anything about the data or your account: support@registrum.co.uk.

## Licence

MIT. Companies House data is published under the Open Government Licence v3.0.
