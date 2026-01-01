# zhipu-ai-provider

## 0.2.4
### Docs
- Updated package name references to scoped `@wuzhiguocarter/zhipu-ai-provider` in README.md

## [UNRELEASED]
### Added
- Support for GLM-4.7 series models: `glm-4.7` (latest flagship, 200K context)
- Support for GLM-4.6 series models: `glm-4.6` (high performance, 200K context)
- Support for GLM-4.5 series models: `glm-4.5`, `glm-4.5-x`, `glm-4.5-air`, `glm-4.5-airx`, `glm-4.5-flash`
- Support for GLM-4.6V vision models: `glm-4.6v`, `glm-4.6v-flash`
- Support for GLM-4.5V vision model: `glm-4.5v`
- Thinking mode parameter for GLM-4.5/4.6/4.7 series via `thinking` option in ZhipuChatSettings
- Added comprehensive tests for new models and thinking parameter

### Changed
- Updated model classification to automatically recognize new GLM-4.6V and GLM-4.5V as vision models
- Improved documentation with new model listings and thinking mode examples

### Docs
- Updated README.md with GLM-4.5/4.6/4.7 series documentation and thinking mode usage
- Updated CLAUDE.md with new model types and thinking parameter implementation details
- Updated .claude/index.json with new model IDs

## 0.2.0
- Upgrade to AI SDK v5 stable (compatible with ai@^5.0.x)
- Upgrade @ai-sdk/provider from 2.0.0-beta.1 to ^2.0.0
- Upgrade @ai-sdk/provider-utils from 3.0.0-beta.5 to ^3.0.0
- Upgrade zod from 4.0.5 to ^4.1.8 (TypeScript performance improvements)
- Remove circular dependency in package.json
- Fix test compatibility with AI SDK v5 stable APIs
- All 58 tests passing (Node + Edge runtime)

## 0.2.0-beta.1
- Support for ai-sdk-v5
- Support for image generation
