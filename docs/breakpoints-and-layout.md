# AlphaAgents Breakpoints and Layout Contract

This file is a visual implementation contract, not a suggestion.

| Viewport | Container | Sidebar | Right rail | Grid | Primary behavior |
| --- | ---: | --- | --- | --- | --- |
| 390 | 100% - 32px | bottom nav | drawer | 4 columns | cards, accordions, bottom action sheet |
| 768 | 100% - 32px | collapsed rail | drawer | 8 columns | filter drawer, compact tables |
| 1024 | 100% - 48px | 72px rail | trust bar | 12 columns | priority tables, sticky summaries |
| 1280 | 100% - 48px | 240px | collapsible | 12 columns | full workbench without right rail if needed |
| 1440 | 100% - 48px | 240px | 320px | 12 columns | full sidebar, content, right rail |

Rules:

- Standard packages must stay in the first viewport at 390, 1024, and 1440.
- No horizontal page scroll is allowed.
- CLI/events are collapsed except when `CLI mismatch` is present.
- `OrderEscrowPanel` is right sticky on desktop, top sticky on tablet, and bottom sheet on mobile.
- `SkuPlanSelector` minimum card width is 260px on tablet and 280px on desktop; mobile uses horizontal snap.
- Any table with more than 5 columns switches to priority columns at 1024 and cards below 768.

