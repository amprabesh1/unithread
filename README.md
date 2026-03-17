# UniThread

A campus community platform (like GroupMe + feed) built with **HTML**, **Tailwind CSS**, and **vanilla JavaScript**. Multi-page SPA: Feed, Create Post, **Messages** (DMs), **Groups** (group chat), My Activity, Profile, and Settings. **Dark mode** and **light mode** supported.

## Features

- **Authentication** — Email/password sign-up and sign-in. Registration restricted to school email domains (e.g. `.edu`) with validation. "Verified student" badge on profiles for confirmed school emails.
- **User profile** — Display name, profile photo (with initials fallback), verified badge. Editable profile in Settings.
- **Create post** — One form with category selector; fields change by type:
  - **Post / News** — title + content (fun updates, news, whatever)
  - **Ride** — destination, date/time, seats, price split
  - **Task** — description, category, effort, compensation (optional)
  - **Maintenance** — location, issue description, urgency, photo upload
- **Browse feed** — Card list, filter tabs (All / Rides / Tasks / Maintenance), sort by newest. Search bar filters by content.
- **Interactions** — Ride: "Request to Join"; Task: "Offer Help"; Maintenance: "Upvote". Poster can accept/decline requests in My Activity.
- **Status badges** — Ride: Open (green) / Full (amber) / Completed (gray). Task: Open / Assigned (blue) / Done. Maintenance: Reported (red) / In Progress (amber) / Resolved (gray).
- **My Activity** — Tabs: My Posts, My Requests, Offers Received (with accept/decline).
- **Messages** — Direct messages: conversation list, start new chat (add contacts), send/receive messages.
- **Groups** — Create groups (name + add members), group chat with all members.
- **Theme** — Light / dark mode toggle in header and in Settings.

## Layout

- **Top bar** — CampThread logo, center search, notification icon, avatar.
- **Left sidebar** (desktop) — Feed, Create Post, My Activity, Profile, Settings.
- **Bottom tab bar** (mobile) — Same links; sidebar hidden.
- **Design** — Follows `Design.json`: neutral palette, green/coral/blue accents, card layout, light gray page background.

## Run locally

Open `index.html` in a browser, or use a local server:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then go to `http://localhost:8000` (or the port shown).

## Tech stack

- HTML5
- [Tailwind CSS](https://tailwindcss.com) (CDN)
- Vanilla JavaScript (no frameworks)
- `localStorage` for persistence (users, posts, requests, upvotes)

## Design

See `Design.json` for colors, typography, spacing, border-radius, shadows, and component styles. Custom tokens are applied in `css/styles.css` and Tailwind config in `index.html`.
