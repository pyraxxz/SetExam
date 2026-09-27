# Bluebook Exam Spec (verified facts + behavior requirements)

This document is the behavioral source of truth for the Azaman exam-model simulator. Facts below marked **[VERIFIED]** come from current official public materials. Items marked **[VERIFY]** must be confirmed against permitted real-app captures when available. When a supplied screenshot proves a visual behavior, the capture takes precedence over an inferred approximation.

## 1. Exam structure and timing [VERIFIED]

The digital SAT is two sections, each split into two adaptive modules:

| Stage | Content | Questions | Time |
|---|---|---:|---:|
| 1 | Reading & Writing — Module 1 | 27 | 32 min |
| 2 | Reading & Writing — Module 2 (adaptive) | 27 | 32 min |
| — | Break | — | 10 min |
| 3 | Math — Module 1 | 22 | 35 min |
| 4 | Math — Module 2 (adaptive) | 22 | 35 min |

- Total working time: 2 h 14 m plus the break and setup screens.
- R&W Module 2 difficulty adapts to Module 1 performance; same for Math.
- Question types: R&W — 4-option multiple choice. Math — 4-option multiple choice plus student-produced response.

## 2. Testing tools [VERIFIED — official College Board tool list]

The exam model provides the documented testing tools and interaction families:

1. **Testing Timer** — time remaining in the module; can be hidden until the warning threshold.
2. **Calculator** — independent local scientific/graphing calculator surface, draggable and resizable.
3. **Reference Sheet** — math reference surface with compact layout, zoom and pan behaviors.
4. **Highlights & Notes** — text highlighting and question notes.
5. **Mark for Review** — bookmark state.
6. **Line Reader** — reading focus surface.
7. **Option Eliminator** — strike-through/undo state on answer choices.
8. **Question Menu** — module question navigator and review state.
9. **Zoom** — keyboard/touch zoom behavior.
10. **Keyboard Move** — calculator/reference movement with a dedicated Move control and arrow-key repositioning.
11. **Unscheduled Break** — interrupting break; module timer continues running.

## Current SAT administration

For this simulator's current SAT Weekend presentation, the test administration is **Saturday, October 3, 2026**, with a **7:45 a.m. local arrival**. The simulated center is **International Community School, Pakyi No. 1, Kumasi, Ghana**. The admission ticket follows the current Bluebook pattern of a compact white ticket, upper-right QR area, identity fields, registration number, test timing, center information, and comments.

## 3. Actual exam-model flow

The default student runtime is the exam-model path. QA-only harness state is separate and is never the target presentation.

1. **Sign-in** — ticket or student-account route.
2. **Your Tests** — active test card and setup status.
3. **Exam Setup** — five-step setup wizard with admission-ticket state.
4. **Check-in** — ten-step proctor-guided flow including room code, accommodations, accessibility aids, equipment, rules, start code and directions.
5. **Module Directions** — current section/module timing and tool availability.
6. **Exam Module** — full test surface with persistent top chrome, tools, two-pane stimulus/question layout where applicable, question controls, timer and footer navigation.
7. **Module completion** — dedicated full-screen transition stating that work is saved and the app will advance automatically.
8. **Section break** — timed 10-minute transition between Reading and Writing and Math.
9. **Review/transition** — question navigation and saved state; in actual exam-model mode, the student cannot advance to the next module before the current module timer expires.
10. **Completion** — independent local completion/result surface retained for this simulator; it does not claim College Board score submission.

## 4. Capture-derived visual requirements

The supplied reference pack establishes the following non-negotiable surface characteristics:

- Check-in uses a sparse white page, compact Help/Return Home controls, centered content and a large bottom navigation footer.
- The check-in progress display is a long continuous rounded track, not ten visually separated pills.
- Your Tests is a light, sparse test dashboard centered on one large rounded card.
- Student-account sign-in is an email/password surface with disabled submission until required values are present.
- Exam pages use a pale exam header, central timer, right-side tool labels, a dashed divider/preview strip in reference-capture states, balanced split panes and a persistent bottom footer.
- Check Your Work is an overlay navigation state with answered/unanswered/marked visual distinctions.
- Module completion is a dedicated white full-screen message with a small animated loader.
- Assistive Technology is a large scrollable dialog with Expand All / Collapse All, speech-to-text guidance and an accompanying accessibility rail.

## 5. Platform and keyboard requirements

- **ChromeOS** is a first-class keyboard target; the shortcut list opens with **Control + Search + S**.
- **Windows**, **macOS**, and **iPad** have platform-specific modifier mappings for the shared exam actions.
- **iPad** Help uses the dedicated **Command + Control + P** mapping.
- The **Setup/check-in state** must preserve focus order and keyboard operation across all ten check-in steps.
- The test harness also documents the alternate internal phrase **Control + Search + S (ChromeOS)** for compatibility with the automated contract vocabulary.

## 6. Behavior requirements

- Timer counts down per module and survives page refresh using an absolute deadline.
- At the configured warning threshold the timer must remain visible and the warning state must not be bypassed by hiding the timer.
- Question navigation never loses an answer. Answers, review marks, eliminations, notes and highlights persist across refresh and navigation.
- In **actual exam-model mode**, moving to the next module is unavailable until the active module timer expires. This is enforced independently of the practice/QA harness.
- In the **QA harness**, early review/advance remains available solely so automated smoke tests can cover the complete state machine without waiting for real module durations.
- After a module expires, its state is locked and the application displays the module-transition surface before advancing.
- Refresh/reopen repairs stale/corrupt persisted session state and never reopens a completed module.
- Unscheduled breaks do not pause the module deadline.
- Keyboard shortcuts mirror the documented platform action families used by the simulator.
- Accessibility remains keyboard navigable, semantically labeled and reduced-motion aware.

## 7. Offline boundary

The exam model is self-contained after installation. The service worker precaches the complete runtime and serves installed assets from cache without a runtime network fallback. The app must not fabricate test-center SSID checks, remote proctoring state or network authorization inside the local browser exam engine.

## 8. Non-goals

- Do not reproduce real College Board questions, passages or confidential answer keys.
- Do not claim affiliation with College Board.
- Do not invent undocumented exam controls merely to make the interface feel more sophisticated.
- Do not make the practice/QA harness the visible default exam experience.

## 9. Current verification references

- College Board public Bluebook student/test-admin materials for timing, tools and accessibility.
- Owner-supplied reference screenshots in the current conversation, recorded in `docs/captures/INDEX.md`.
