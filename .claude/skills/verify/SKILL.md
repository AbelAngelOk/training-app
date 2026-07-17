---
name: verify
description: Drive this Expo Router app (web target) end-to-end in a real headless browser, no new dependencies (no Playwright).
---

# Verifying this app in a browser (no Playwright installed)

This repo has no Playwright/Puppeteer. Don't install one ad hoc — Windows
already ships Microsoft Edge (Chromium), which supports headless mode and the
Chrome DevTools Protocol (CDP) natively. Node 22+ has a built-in `WebSocket`
global, so a CDP driver needs **zero new dependencies**.

## 1. Start the app (web target)

```bash
cd training-app
nohup npx expo start --web --port 8099 > /tmp/expo-web.log 2>&1 &
disown
# wait for bundling, then confirm:
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8099/   # first hit can take 10-20s (Metro bundling)
```

## 2. Start headless Edge with remote debugging

```bash
MSEDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
mkdir -p /tmp/edge-profile
nohup "$MSEDGE" --headless=new --disable-gpu --no-sandbox \
  --remote-debugging-port=9333 --user-data-dir=/tmp/edge-profile \
  --window-size=1400,900 about:blank > /tmp/edge-cdp.log 2>&1 &
disown
curl -s http://localhost:9333/json/version   # sanity check
```

## 3. Drive it

A minimal CDP driver lives at
`.claude/skills/verify/cdp-drive.js` (copy it to your scratchpad, or run it
from here — it takes a JSON steps file as its only argument):

```bash
node .claude/skills/verify/cdp-drive.js steps.json
```

Steps file is a JSON array of ops:
- `{"op":"navigate","url":"...","wait":2500}`
- `{"op":"fill","selector":"input[placeholder='...']","value":"..."}` — uses
  the native input value setter + a real `input`/`change` event, so React
  controlled inputs (onChange) actually fire. Plain `el.value = x` does NOT
  work for React — this is the one gotcha that cost the most time.
- `{"op":"clickText","text":"Entrar"}` — RN Web renders buttons as plain
  `div`s with no stable selector; this walks text nodes and clicks the
  nearest clickable ancestor. Prefer this over CSS selectors for buttons.
- `{"op":"click","selector":"..."}` — for elements you do have a real
  selector for.
- `{"op":"sleep","ms":3000}`
- `{"op":"screenshot","path":"C:\\\\...\\\\out.png"}` — **use a real Windows
  path**, not `/tmp/...` — this script runs under native Windows Node, not
  Git Bash, so `/tmp/x` resolves to `C:\tmp\x` and silently fails
  (`ENOENT`). Convert with `cygpath -w /tmp/x` if you built the path in bash.
- `{"op":"text"}` — dumps `document.body.innerText` (fastest way to assert
  on rendered state without OCR-ing a screenshot).
- `{"op":"url"}` — dumps `window.location.href` (confirms redirects).

Read screenshots back with the `Read` tool using the **Windows** path
(`C:\Users\...\out.png`), not the bash `/tmp/...` alias.

## 4. Auth-gated screens (this app's `/admin` portal, or any Supabase-authed route)

Don't guess a password. Create a disposable test user with the service-role
key, drive the real login form (not a direct token grab) so the actual guard
code under test executes, then delete the user:

```js
// create
POST {SUPABASE_URL}/auth/v1/admin/users  (apikey+Authorization: service_role)
  { email, password, email_confirm: true }
// ... drive the login form via CDP ...
// promote to admin (if needed) — role changes need service_role or an
// already-admin session; see the self-escalation note below
PATCH {SUPABASE_URL}/rest/v1/users?email=eq.<email>  (service_role)
  { role: 'admin' }
// cleanup
DELETE {SUPABASE_URL}/auth/v1/admin/users/<id>  (service_role)
```

## Known gotcha this caught once — re-check if you touch role/permission triggers

`public.prevent_role_self_escalation()` (migration `20260714000010`, fixed in
`20260714000015`) only allows a `users.role` change when `auth.uid() IS NULL`
(service_role / raw SQL / migrations) **or** the acting session is already
admin. If you add a similar "block self-escalation" trigger elsewhere, test
the service_role path explicitly — the first version of this trigger
accidentally blocked service_role too (since `auth.uid()` is NULL outside a
PostgREST JWT context, which made `is_admin()` false for every non-client
caller), which would have silently broken the documented "bootstrap the
first admin via a manual SQL UPDATE" step. Caught only by actually running
the PATCH as service_role during verification, not by reading the SQL.

## Known gotcha this caught a second time — admin write policies don't imply admin read policies

Adding `is_admin()` INSERT/UPDATE/DELETE policies on a table does **not** give
the admin visibility into rows of *other* tables that were only ever scoped
to `auth.uid() = user_id` (e.g. `user_programs`). A "check usage before
destructive delete" query (`count(*) FROM child_table WHERE parent_id = ...`)
run as the admin's own JWT will silently return 0 for rows owned by other
users — not an error, just a wrong answer — defeating the safety check
without any visible failure. Caught only by creating a *second* user's row
and checking the count as the admin, not by re-testing with the admin's own
data. Fix is an additive `FOR SELECT ... USING (is_admin())` policy (Postgres
ORs multiple permissive policies for the same command/role, so it doesn't
loosen what non-admins can see) — verify the fix by re-running the same
cross-user check, and confirm a non-admin still can't see other users' rows.

## Cleanup after a verification pass

```bash
taskkill //F //IM msedge.exe
# find + kill the metro/expo process:
netstat -ano | grep ":8099" | head -1   # last column is the PID
taskkill //F //PID <pid>
rm -rf /tmp/edge-profile /tmp/expo-web.log /tmp/edge-cdp.log
```
