# Platform Readiness — 2026–27 Bluebook-Informed Practice

This project is a browser practice simulator, not a replacement for the official Bluebook application. The platform notes below keep implementation and deployment decisions aligned with the current public Bluebook documentation without claiming equivalence to the official test client.

## Current public platform baseline

| Platform | Current public minimum / readiness note |
|---|---|
| ChromeOS | ChromeOS 144 minimum; verified mode is required by the official Bluebook client |
| macOS | macOS 15 minimum; public requirements currently list macOS 26.5.2 as the recommended maximum |
| iPadOS | iPadOS 18 minimum; public requirements currently list iPadOS 26.6.1 as the recommended maximum |
| Windows | Windows 11 24H2 minimum; public requirements currently list Windows 11 26H2 as the recommended maximum |

These requirements describe the official Bluebook environment. The Azaman simulator should use a separately defined browser support matrix for its own deployment rather than representing itself as Bluebook.

## Interaction parity notes

The current public Bluebook tool documentation states that the calculator can be dragged, the timer can be hidden until five minutes remain, the reference sheet is available with Math, and Zoom is supported with keyboard shortcuts on laptops or pinch/zoom on tablets.

The current official accessibility documentation also states that Calculator and Reference Sheet dialogs can be moved with the keyboard through a Move button and that Highlight & Notes is designed for keyboard-only and screen-reader workflows. The Azaman simulator currently provides draggable/resizable tool panels and semantic dialog/keyboard contracts, but the exact official interaction model still requires device-level validation.

The official 2026 release notes additionally document a resizable Desmos calculator, image lightbox enlargement, and new symbol palettes. The simulator's current calculator is intentionally an independent local engine, and its image/chart interactions remain an explicit release item until the bank actually contains source media requiring those interactions.

## Release verification matrix

Before describing this product as deployment-ready for student use, verify the simulator independently on each target class:

- Desktop keyboard: Windows/ChromeOS Control mappings
- Desktop keyboard: macOS Command/Control/Option mappings
- Tablet keyboard: iPad Command/Control/Option mappings, including the distinct iPad Help shortcut
- Touch interaction: pinch-to-zoom behavior and panel usability
- Screen reader: dialogs, tool menus, answer controls, saved notes/highlights, and focus restoration
- Keyboard-only: F1/F6 region navigation, tool access, answer selection, review flow, and modal dismissal
- Reduced-motion: no essential state depends on animation
- Refresh/reopen: timed module and break deadlines survive reload

## Official references

- https://bluebook.collegeboard.org/technology/updates-releases/new-requirements
- https://bluebook.collegeboard.org/students/tools
- https://bluebook.collegeboard.org/students/accommodations-assistive-technology/accessing-bluebook-features-content
- https://bluebook.collegeboard.org/technology/updates-releases/releases
- https://bluebook.collegeboard.org/help-center/windows-keyboard-shortcuts
- https://bluebook.collegeboard.org/help-center/macos-keyboard-shortcuts


## Recheck date — 2026-09-27

The current public Bluebook requirements used for this pass were rechecked against College Board's 2026–27 device requirements. The SAT's October 3, 2026 administration is listed for 7:45 a.m. local time. For student ticket flow, College Board says exam setup is completed 1–5 days before test day and produces an admission ticket that can be printed or emailed.