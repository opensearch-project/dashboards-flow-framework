## Version 3.7.0 Release Notes

Compatible with OpenSearch and OpenSearch Dashboards version 3.7.0

### Features

* Add agentic memory support for conversational agents ([#883](https://github.com/opensearch-project/dashboards-flow-framework/pull/883))
* Add embedding model ID configuration for agentic search ([#875](https://github.com/opensearch-project/dashboards-flow-framework/pull/875))
* Add fallback query configuration for QueryPlanningTool ([#872](https://github.com/opensearch-project/dashboards-flow-framework/pull/872))
* Add index alias support in agentic search UI ([#871](https://github.com/opensearch-project/dashboards-flow-framework/pull/871))

### Bug Fixes

* Fix flaky tests by replacing singleton store with mock store ([#878](https://github.com/opensearch-project/dashboards-flow-framework/pull/878))

### Infrastructure

* Add issues write permission to untriaged label workflow ([#888](https://github.com/opensearch-project/dashboards-flow-framework/pull/888))
* Add unit tests for utility functions to increase test coverage ([#862](https://github.com/opensearch-project/dashboards-flow-framework/pull/862))
* Add yarn cache to setup-node step in CI workflow to reduce build times ([#887](https://github.com/opensearch-project/dashboards-flow-framework/pull/887))
* Clean up CI workflows: update actions, fix yarn version bug, and remove dead code ([#861](https://github.com/opensearch-project/dashboards-flow-framework/pull/861))
