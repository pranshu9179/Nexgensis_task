# Design Notes

## Search vs. Category: Why They're Mutually Exclusive

DummyJSON provides two separate endpoints for narrowing down products:

- `/products/search?q=...` — keyword search across all products
- `/products/category/{slug}` — filter by a single category

There is **no combined endpoint** that accepts both a search query and a category slug. Attempting to combine them client-side (e.g., fetch all then filter) would break server-side pagination — we'd have incorrect `total` counts and `skip` offsets.

**Decision:** When a search query is active, the category dropdown is disabled (with a hint: *"Clear search to filter by category"*). When a category is selected, the search input is disabled. Only one of {search, category} drives the product list at any time. Sort (price/rating/title, asc/desc) still works on top of whichever is active.

This is a pragmatic tradeoff. A real backend would support combined filters; with a mock API, this keeps pagination accurate and the UX honest about what's actually happening.

## Fake Persistence: The Local-State Overlay

DummyJSON's add, edit, and delete endpoints return realistic response objects but **do not actually persist** changes on the server. A product you "add" via `POST /products/add` gets a new id in the response, but a subsequent `GET /products` will never include it.

**Approach:** After a successful add/edit/delete API response, we update a `localOverrides` object in the ProductListPage's state:

- **Added** products are prepended to the top of the current list.
- **Edited** products replace the matching id in-place.
- **Deleted** product ids are filtered out.

This means changes are visible immediately on the current view. However, **navigating away and re-fetching** (new page, new search, hard refresh) will fall back to the server's original data. This is an accepted limitation of the mock API, not a bug in the app.

## One Problem I Hit: Search Race Conditions

When the user types quickly, multiple search requests fire with different query strings. With a slow or variable-latency server, an older response (e.g., for "ip") can arrive *after* a newer one (for "iphone"), causing the displayed results to flicker or show stale data.

**Fix:** Every search request is issued with an `AbortController` signal. When the search query or pagination changes, the `useEffect` cleanup runs first and aborts the previous in-flight request. This guarantees that only the most recent request's response can update state — any earlier, still-pending responses are cancelled at the network level. Verified by adding `&delay=2000` to API calls and typing rapidly.

## Where AI Helped

*(To be filled in honestly by the person submitting this — describe which parts you used AI for and how you verified/understood the generated code.)*
