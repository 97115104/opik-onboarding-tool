# Opik contributing overview (slide source)

The onboarding UI Contributing overview step uses the typed slide deck in
`apps/onboarding-ui/src/content/contributingSlides.ts`. Keep this file aligned with those slides.

This content describes the **upstream Opik repository** ([comet-ml/opik](https://github.com/comet-ml/opik)), not this onboarding-tool repo.

## Slides

1. **What contributing means**: Welcome. Tracked issue, focused PR, maintainer review. Open and sign the CLA (button). Soft note that AI help is welcome and the human stays accountable.
2. **How the codebase is organized**: Prose naming `apps/`, `sdks/`, `tests_end_to_end/`, and `deployment/` (no bullets).
3. **Component areas**: Stay in the area your issue targets; text links to Backend, Frontend, Python SDK, TypeScript SDK, Documentation, and Agent optimizer guides.
4. **How to contribute**: Fixes #.... Opik handle convention `{username}/{ticket}-{summary}` (`{username}` = GitHub handle). This wizard creates/uses `opik-onboarding-tool-97115104-contribution-{N}`. Scoped PR, local checks (prose).
5. **GitHub Actions and quality**: Actions as CI in the SDLC; workflows; pre-commit / `make hooks`; Verify later.
6. **What comes next in this wizard**: Tool compresses SDLC context; next is the contributing quiz, then a ranked issue.

## Learn more

- [Contribution overview](https://www.comet.com/docs/opik/contributing/overview)
- [Opik CONTRIBUTING.md](https://github.com/comet-ml/opik/blob/main/CONTRIBUTING.md)
- [CLA](https://github.com/comet-ml/opik/blob/main/CLA.md)
