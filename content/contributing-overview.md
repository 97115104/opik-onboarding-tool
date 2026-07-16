# Opik contributing overview (slide source)

The onboarding UI Contributing overview step uses the typed slide deck in
`apps/onboarding-ui/src/content/contributingSlides.ts`. Keep this file aligned with those slides.

This content describes the **upstream Opik repository** ([comet-ml/opik](https://github.com/comet-ml/opik)), not this onboarding-tool repo.

## Slides

1. **What contributing means**: Welcome copy plus embedded CLA scroll-and-agree panel (`contributing-cla-document`, `contributing-cla-agree`). Scroll to bottom unlocks the checkbox.
2. **Contributing guidelines**: Intro plus embedded CONTRIBUTING scroll-and-agree panel (`contributing-guidelines-document`, `contributing-guidelines-agree`).
3. **How the codebase is organized**: Linked GitHub tree paths for `apps/`, `sdks/`, `tests_end_to_end/`, `deployment/`. Did you know for SDK and deployment.
4. **Component areas**: Stay in the area your issue targets; text links to Backend, Frontend, Python SDK, TypeScript SDK, Documentation, and Agent optimizer guides.
5. **How to contribute**: Structured bullets (Fixes #..., branch convention, scope, local checks).
6. **GitHub Actions and quality**: Structured bullets plus Did you know for pre-commit.
7. **What comes next in this wizard**: Tool compresses SDLC context; next is the contributing quiz, then a ranked issue.

Wizard footer Back/Next drives slide navigation. Step complete requires last slide plus `claAgreed` and `guidelinesAgreed`.

Vendored markdown: `content/cla.md`, `content/contributing-guidelines.md` (canonical sources on GitHub).

## Learn more

- [Contribution overview](https://www.comet.com/docs/opik/contributing/overview)
- [Opik CONTRIBUTING.md](https://github.com/comet-ml/opik/blob/main/CONTRIBUTING.md)
- [CLA](https://github.com/comet-ml/opik/blob/main/CLA.md)
