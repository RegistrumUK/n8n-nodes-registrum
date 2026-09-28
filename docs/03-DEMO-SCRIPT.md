# 03 - Verification demo script

The click-by-click for the demo video n8n's manual review asks for. Every step below was run
end to end against a real local n8n, the published npm package and the live Registrum and
Anthropic APIs on 2026-09-28 - nothing mocked. Timings are from the final recorded run, which
took 3:30 - inside n8n's 5-minute limit, in one take with no cuts. By hand, allow about 4:30.

n8n asks the video to show five things: install from npm at the submitted version, create a
workflow and insert the node, set up a credential with the test passing, the common actions,
and the node working as an AI agent tool. The sections below map one-to-one onto them.

## Before you press record

| Check | Why |
|---|---|
| Start n8n from **PowerShell**, not Git Bash: `npx n8n` then open http://localhost:5678 | Under Git Bash, n8n's package install shells out to GNU `tar`, which reads `C:` as a remote host and fails with `Cannot open: No such file or directory`. The UI only says the install failed. |
| Node 20.19-24.x | n8n refuses anything else. |
| Log in as the **Owner** | Only Owner/Admin can install community nodes. |
| The package is **not** installed yet (Settings > Community Nodes shows nothing) | The video must show the install. If a dry run left it installed, uninstall it there first. |
| No leftover Registrum/Anthropic credentials or workflows | A reviewer should see them created, not picked from a list. |
| Have both keys on the clipboard-ready: Registrum (`python ~/.claude/secret.py get registrum`), Anthropic (`secret.py get anthropic`) | Both fields render as dots once pasted - checked on 2026-09-28. Do not paste a key anywhere else on screen. |
| Close other tabs and notifications; browser window around 1440x900 | Readable output panels at recording resolution. |

No extra environment variable is needed for the AI-tool step. With `usableAsTool: true` the
installed package exposes both `n8n-nodes-registrum.registrum` and
`n8n-nodes-registrum.registrumTool` on n8n 2.40.7 with defaults - verified, not assumed.

## 1. Install from npm (0:00 - 0:31)

1. Home screen > **Settings** (bottom-left gear) > **Community Nodes**.
2. **Install a community node**.
3. Package name: `n8n-nodes-registrum@0.1.1` - the exact submitted version.
4. Tick the risk acknowledgement > **Install**.
5. Wait - the install took **15-25 s** across the recorded runs. Hold on the package row once it
   lists.

## 2. Create a workflow and insert the node (0:31 - 0:50)

1. Back out of Settings > **+** (top-left) > **New workflow**.
2. **Add first step** > **Trigger manually**.
3. Click the **+** on the trigger's output > search `Registrum` > **Registrum**.
4. Pick the action **Search for a company by name**.

## 3. Credential and credential test (0:50 - 1:00)

1. In the node, **Credential > Connect to Registrum**.
2. Paste the Registrum key into **API Key**. It shows as dots.
3. **Save**. The modal shows **Connection tested successfully** (the test calls `/v1/usage`, so
   it spends none of the account's monthly calls). Hold ~2 s on the green banner, then close.

## 4. Common actions (1:00 - 1:54)

Stay on the same node and change **Operation** between runs - it saves re-adding nodes.

| Time | Operation | Input | What to hold on |
|---|---|---|---|
| 1:03 | Search | Query `tesco` | the list of Tesco companies |
| 1:15 | Get Ownership Chain | `02580031` (Nando's Chickenland) | the chain: four companies deep, ending at a named individual (`terminal: true`) |
| 1:30 | Get Financials | `00034603` (Gloucester Rugby) | turnover 13,438,261 - it sits below the data-quality block, so **scroll the output panel down** to it; the first screen is metadata |
| 1:44 | Get Identity Verification Status | `03127254` | seven directors, all pending, deadline 2026-12-01 |

Press **Execute step** after each and let the output sit for 3-4 s.

## 5. As an AI agent tool (1:54 - 3:30)

n8n's list requires this step because the node declares `usableAsTool: true` - do not cut the
video after section 4. Setup takes ~55 s; the agent answered in ~34 s on the final run.

1. **+** > **New workflow** > **Add first step** > search `AI Agent` > **AI Agent**. n8n adds the
   Chat Trigger with it.
2. Agent's **Chat Model +** > **Anthropic Chat Model** > **Connect to Anthropic** > paste the
   Anthropic key (dots) > **Save**. Pick a current Claude model from the live list.
3. Agent's **Tool +** > search `Registrum` > **Registrum Tool**. Operation **Search** (it is
   near the bottom of the list - scroll the list to it), then click the small sparkle at the
   right end of **Query** so the model fills it. Check the Operation box reads **Search** before
   closing: if it still says Get Profile, the pick missed.
4. **Tool +** again > **Registrum Tool** > Operation **Get Ownership Chain**, and the sparkle on
   **Company Number**. The sparkle only appears while the pointer is over the field, and sits
   just inside its right edge - a little further left opens the Edit expander instead.

   Both tools are needed. With only number-based tools the agent cannot turn "Nando's" into a
   company number - on one dry run it (correctly) asked the user for the number instead of
   answering. Search is what lets it resolve the name first.
5. Open **Chat** (bottom of canvas) > type `Who owns Nando's?` > send.
6. Hold on the answer and on the **Logs** panel. On the final run it listed Anthropic Chat Model,
   **Search for a company**, Anthropic Chat Model, **Trace ownership** - and the Trace ownership
   input shows `Company_Number: 02580031`, which the model found by searching. That line is the
   proof it works as a tool; click it in the Logs panel so the reviewer sees it.

## If something goes wrong mid-take

| Symptom | Cause | Fix |
|---|---|---|
| Install fails immediately | n8n started from Git Bash | Restart it from PowerShell (see top). |
| Registrum Tool missing from the tool list | Package not installed on this instance | Re-check Settings > Community Nodes. |
| Operation still reads **Get Profile** after picking Search | Search was below the list's visible area and the click fell through | Re-open the dropdown, scroll the list, pick Search. |
| Clicking beside Query opens an "Edit Query" box | Clicked the expander, not the sparkle | Close it; hover the field and click nearer its right edge. |
| Agent asks for a company number | The Search tool is missing or still on Get Profile | Step 5.3. |

## Automated re-run

`C:\Users\eugen\Videos\registrum-n8n-demo\record_demo.py` replays this with Playwright:
`python record_demo.py reset` wipes workflows, credentials and the package through n8n's REST
API, then `python record_demo.py record` records one continuous take to the same folder. It reads
both keys at run time and never writes them anywhere.
