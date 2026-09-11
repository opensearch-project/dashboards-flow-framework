# CHANGELOG
All notable changes to this project are documented in this file.

Inspired from [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## [Unreleased 3.x](https://github.com/opensearch-project/dashboards-flow-framework/compare/3.6...HEAD)
### Features
- Integrate centralized resource-sharing share button for workflows ([#909](https://github.com/opensearch-project/dashboards-flow-framework/pull/909))
### Enhancements
- Gate the resource-sharing Access column on per-data-source availability ([#914](https://github.com/opensearch-project/dashboards-flow-framework/pull/914))
- Opt out of AnalyticEngine data sources ([#892](https://github.com/opensearch-project/dashboards-flow-framework/pull/892))
- Update Inspect tab to Search ([#844](https://github.com/opensearch-project/dashboards-flow-framework/pull/844))
- Add index alias support in agentic search UI ([#871](https://github.com/opensearch-project/dashboards-flow-framework/pull/871))
- Add fallback query configuration for QueryPlanningTool ([#872](https://github.com/opensearch-project/dashboards-flow-framework/pull/872))
- Add embedding model ID configuration for agentic search ([#875](https://github.com/opensearch-project/dashboards-flow-framework/pull/875))
- Add agentic memory support for conversational agents ([#883](https://github.com/opensearch-project/dashboards-flow-framework/pull/883))
### Bug Fixes
### Infrastructure
- Pin Cypress to the functional-test lockfile version via `npm ci` in the remote integration test workflow ([#915](https://github.com/opensearch-project/dashboards-flow-framework/pull/915))
- Add unit tests for utility functions to increase test coverage ([#862](https://github.com/opensearch-project/dashboards-flow-framework/pull/862))
- Fix flaky tests by replacing singleton store with mock store ([#878](https://github.com/opensearch-project/dashboards-flow-framework/pull/878))
- Clean up CI workflows: update actions, fix yarn version bug, remove dead code ([#861](https://github.com/opensearch-project/dashboards-flow-framework/pull/861))
- Add yarn cache to setup-node step in CI workflow ([#887](https://github.com/opensearch-project/dashboards-flow-framework/pull/887))
### Documentation
- Fix broken tutorial link in README ([#860](https://github.com/opensearch-project/dashboards-flow-framework/pull/860))
### Maintenance
- Adopt ESLint 10 / flat config ([#903](https://github.com/opensearch-project/dashboards-flow-framework/pull/903))
### Refactoring
