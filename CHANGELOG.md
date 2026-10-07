## 0.2.0

- Credential: new **Email (60-day free trial)** access mode. The email is exchanged for a trial
  key in the background (n8n `preAuthentication`) and stored encrypted; it starts answering once
  the emailed link is clicked. Existing credentials stay on API Key mode. (vdmeu/CH-Api#153)
- Company Number field tells users (and AI agents) to use Search first when they only have a name.

## 0.1.1

No functional change. Published to verify that releases work through npm trusted
publishing (OIDC), with no npm token stored anywhere: the one used for the first
publish has been revoked and the repository secret deleted.

