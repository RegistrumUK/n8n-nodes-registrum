# User journeys

Every operation in this node maps to one of these. If a proposed feature maps to none of them, it
does not belong here.

## J1 - The ops person enriching a list (the journey that pays us)

**Who:** someone technical enough to wire n8n, not interested in maintaining a client library.
Electric Car Scheme is exactly this, and is 100% of our highest-volume paying traffic.

**Today, without this node:** an HTTP Request node per call, the auth header pasted by hand into
each one, the base URL repeated, and a credential sitting in plain text in a workflow.

**With it:** Schedule Trigger -> read company numbers -> **Registrum: Get Everything** -> write
back. One credential, stored by n8n, and one call per company.

**Operations:** Get Everything, Get Profile, Get Financials.

## J2 - The advisor checking a client book before a deadline

**Who:** an accountant or company secretary responsible for many companies, with the ECCTA
identity-verification deadlines running per company rather than nationally.

**With it:** loop over client company numbers -> **Registrum: Get Identity Verification Status** ->
filter to anyone overdue -> raise a task or send a chase.

**Operations:** Get Identity Verification Status, Get Directors.

## J3 - The onboarding or KYB check

**Who:** anyone verifying a business customer at signup.

**With it:** new customer -> **Registrum: Search** to resolve the name to a number ->
**Get Ownership Chain** to reach the individuals behind it -> **Get Profile** for status ->
decision.

**Operations:** Search, Get Ownership Chain, Get Owners, Get Director Network.

## Explicitly not a journey here

- **Bulk batch jobs.** `POST /v1/enrich` and `/v1/batch` exist on the API, but nobody has asked for
  them in n8n, and a declarative node handles GET cleanly. Deferred until someone asks.
- **Monitoring and webhooks.** n8n can already receive our webhooks with a Webhook node; wrapping
  that adds a trigger node and a maintenance burden for no new capability.
