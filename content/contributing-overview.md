# Opik contributing overview (slide source)

The onboarding UI Contributing overview step uses the typed slide deck in
`apps/onboarding-ui/src/content/contributingSlides.ts`. Keep this file aligned with those slides.

This content describes the **upstream Opik repository** ([comet-ml/opik](https://github.com/comet-ml/opik)), not this onboarding-tool repo.

## Slides

1. **What contributing means**: Tracked issue, focused PR, maintainer review. Sign the Contributor License Agreement (CLA). Human accountability for AI-assisted work.
2. **How the codebase is organized**: `apps/`, `sdks/`, `tests_end_to_end/`, `deployment/` (Docker and Kubernetes/Helm assets) from Opik CONTRIBUTING.md.
3. **Component areas**: Backend, frontend, Python/TS SDKs, docs, agent optimizer. Each area has its own guide.
4. **How to contribute**: Fast path: Fixes #..., branch naming, scoped PR, tests; draft PR and template come later in this wizard.
5. **GitHub Actions and quality**: Workflows under `.github/workflows/` (area workflows such as Frontend/Backend/SDK plus Code Quality); install pre-commit then `make hooks`; Verify step names workflows for the chosen issue.
6. **What comes next in this wizard**: Choose issue → Cursor prompt → verify/CI → PR checklist.

## Learn more

- [Contribution overview](https://www.comet.com/docs/opik/contributing/overview)
- [Opik CONTRIBUTING.md](https://github.com/comet-ml/opik/blob/main/CONTRIBUTING.md)
- [CLA](https://github.com/comet-ml/opik/blob/main/CLA.md)
