# FriendZone (ASU Edition)

Clickable prototype of a Tinder-style friendship app for ASU students. Plain HTML, CSS and JavaScript: no build step, no dependencies.

## Run it
Double-click `index.html`, or serve the folder:

```
python3 -m http.server 8000
# then open http://localhost:8000
```

## Files
| File | What's in it |
|---|---|
| `index.html` | Page shell: font links, 4 empty containers, script tags |
| `styles.css` | Theme variables (maroon/gold), layout, cards, glass panels, mobile rules |
| `data.js` | Icons and sample data: `MAJORS`, `CAMPUSES`, `SPOTS`, `TAGS`, `GOALS`, `PROFILES`, `EVENTS`, `HANGOUTS0`, `SQUADS0` |
| `app.js` | App state, matching algorithm, one render function per tab, event handlers |

## Where to change things
- **Match weights:** `WEIGHTS` in `app.js` (tags .36, goals .16, major .14, campus .10, hangouts .14, events .10)
- **Score formula:** `compat()`, `reasons()`, `eventRelevance()`, `sharedEvents()` in `app.js`
- **Screens:** `vDiscover`, `vEvents`, `vSquads`, `vDirectory`, `vChats`, `vMe` in `app.js`
- **Button actions:** the `A` object near the bottom of `app.js` (every `data-act="..."` maps to a function there)
- **Demo sign-up profile:** `DEMO_USER` in `app.js`
- **Colors:** `:root` variables at the top of `styles.css`

## Notes
- Sign-in, Sun Devil Central sync and chat replies are simulated. All students, events and squads are sample data.
- Nothing is saved; a reload starts fresh.
- Scripts must load in order: `data.js` then `app.js`.
