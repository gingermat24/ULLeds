# Contributing to ULLeds

Thanks for wanting to help. ULLeds is maintained by one person, but fixes and
additions are welcome as pull requests. Bug reports and clear feature requests
are still just as useful.

## Code contributions

ULLeds is proprietary and All Rights Reserved (see [LICENSE](./LICENSE)), but
you can propose changes through pull requests. The workflow is:

1. Open an issue first for anything larger than a small fix, so the behavior can
   be agreed on before you spend time on it.
2. Fork the repository and work on a branch.
3. Open a pull request against `dev`, the repository's default branch. Say what
   changed, why, and how you tested it. Include or update a test when the change
   is testable, and make sure `npm test` passes.
4. The maintainer reviews it, may ask for changes, and decides whether it is
   merged. Merging is at the maintainer's discretion: a pull request is a
   proposal for the official app, not an entitlement to have it accepted.

### Terms for a contribution

By opening a pull request you confirm that:

- The work is yours, or you have permission to submit it, and it adds no code,
  dependency, or asset whose license conflicts with ULLeds.
- You grant the maintainer a perpetual, worldwide, royalty-free, irrevocable
  license to use, modify, and relicense your contribution as part of ULLeds,
  including in published releases. You keep the copyright to your contribution;
  this is a license, not a transfer of ownership.
- Your contribution may be merged, edited, or declined. These terms cover what
  is submitted in the pull request, not ideas or work that stays in an issue.

If you are not comfortable with those terms, describe the fix in an issue
instead. A precise explanation of the cause and the expected behavior is still
useful.

### What is not allowed

You may fork and modify the code to prepare a contribution, and run your own
build for development and testing. You may not publish or distribute a modified
ULLeds build, installer, or derivative app, under the ULLeds name or another one,
and you may not publish modified source as a separate product. If you have an
improvement other people should use, send it here so it can land in the official
app. See [LICENSE](./LICENSE).

GitHub's platform terms still allow anyone to view and fork a public repository.
That is platform access, not a license to redistribute ULLeds.

## Reporting a bug

Use the **Bug report** issue template, or the in-app support form, which
prefills a draft with the app version and platform details.

Include:

- ULLeds version (shown in the app and on the Releases page).
- Windows version and build (`winver`).
- The controller name and `VID:PID` shown on the Device page, plus the LED
  count and how the strip is wired.
- What you did, what you expected, and what happened.
- Whether Screen Sync, Spotify Sync, the phone remote, effects, or saved scenes
  are involved.

Diagnostics are optional. If you want to share them, save the JSON file from
the support form and attach it to the GitHub issue yourself. Review it first:
it is local-only, but it is still your machine's data, and issues are public.

Please report security problems privately as described in
[SECURITY.md](./SECURITY.md), not in a public issue.

## Suggesting a feature

Open an issue describing the problem you want solved, not only the feature you
imagine. Known limitations and deferred work are listed in
[FUTURE-IMPROVEMENTS.md](./FUTURE-IMPROVEMENTS.md) and
[docs/future-ideas.md](./docs/future-ideas.md); check those first so we do not
duplicate a decision that was already made.

## Building and testing

The [README](./README.md#build-from-source) covers the Node.js requirements and
the `npm install`, `npm test`, and `npm run dist:win` commands. Tests use
Node's built-in runner and need no Windows-only hardware, so a failing test is
reproducible on any machine.

## Hardware reports

Reports about cheap controllers are valuable, especially when a device claims
`0x1a86:0xfe07` but behaves differently. Say what the controller is sold as, how
many LEDs it drives, and what the strip does versus what it should do.
