## Version 3.0.0.0 Release Notes

Compatible with OpenSearch 3.0.0.0

### Features
- Add fine-grained error handling ([#598](https://github.com/opensearch-project/dashboards-flow-framework/pull/598))
- Change ingestion input to JSON lines format ([#639](https://github.com/opensearch-project/dashboards-flow-framework/pull/639))

### Enhancements
- Integrate legacy presets with quick-configure fields ([#602](https://github.com/opensearch-project/dashboards-flow-framework/pull/602))
- Simplify RAG presets, add bulk API details ([#610](https://github.com/opensearch-project/dashboards-flow-framework/pull/610))
- Improve RAG preset experience ([#617](https://github.com/opensearch-project/dashboards-flow-framework/pull/617))
- Update model options and callout ([#622](https://github.com/opensearch-project/dashboards-flow-framework/pull/622))
- Added popover to display links to suggested models ([#625](https://github.com/opensearch-project/dashboards-flow-framework/pull/625))
- Implicitly update input maps defined on non-expanded queries (common cases) ([#632](https://github.com/opensearch-project/dashboards-flow-framework/pull/632))
- Show interim JSON provision flow even if provisioned ([#633](https://github.com/opensearch-project/dashboards-flow-framework/pull/633))
- Add functional buttons in form headers, fix query parse bug ([#649](https://github.com/opensearch-project/dashboards-flow-framework/pull/649))
- Block simulate API calls if datasource version is missing ([#657](https://github.com/opensearch-project/dashboards-flow-framework/pull/657))
- Update default queries, update quick config fields, misc updates ([#660](https://github.com/opensearch-project/dashboards-flow-framework/pull/660))
- Update visible plugin name to 'AI Search Flows' ([#662](https://github.com/opensearch-project/dashboards-flow-framework/pull/662))
- Update plugin name and rearrange Try AI Search Flows card ([#664](https://github.com/opensearch-project/dashboards-flow-framework/pull/664))
- Add new RAG + hybrid search preset ([#665](https://github.com/opensearch-project/dashboards-flow-framework/pull/665))
- Update new index mappings if selecting from existing index ([#670](https://github.com/opensearch-project/dashboards-flow-framework/pull/670))
- Persist state across Inspector tab switches; add presets dropdown ([#671](https://github.com/opensearch-project/dashboards-flow-framework/pull/671))
- Simplify ML processor form when interface is defined ([#676](https://github.com/opensearch-project/dashboards-flow-framework/pull/676))
- Cache form across ML transform types ([#678](https://github.com/opensearch-project/dashboards-flow-framework/pull/678))
- add callout if knn query does not have knn index ([#688](https://github.com/opensearch-project/dashboards-flow-framework/pull/688))
- adding icons to reorder processors up and down ([#690](https://github.com/opensearch-project/dashboards-flow-framework/pull/690))
- Support optional model inputs ([#701](https://github.com/opensearch-project/dashboards-flow-framework/pull/701))
- Support whitespace for string constant; support ext toggling on ML resp processors ([#702](https://github.com/opensearch-project/dashboards-flow-framework/pull/702))


### Bug Fixes
- Fix error that local cluster cannot get version ([#606](https://github.com/opensearch-project/dashboards-flow-framework/pull/606))
- UX fit-n-finish updates XI ([#613](https://github.com/opensearch-project/dashboards-flow-framework/pull/613))
- UX fit-n-finish updates XII ([#618](https://github.com/opensearch-project/dashboards-flow-framework/pull/618))
- Bug fixes XIII ([#630](https://github.com/opensearch-project/dashboards-flow-framework/pull/630))
- Various bug fixes & improvements ([#644](https://github.com/opensearch-project/dashboards-flow-framework/pull/644))
- Fixed bug related to Search Index in Local Cluster scenario ([#654](https://github.com/opensearch-project/dashboards-flow-framework/pull/654))
- Fix missed UI autofilling after JSON Lines change ([#672](https://github.com/opensearch-project/dashboards-flow-framework/pull/672))

### Maintenance
- Support 2.17 BWC with latest backend integrations ([#612](https://github.com/opensearch-project/dashboards-flow-framework/pull/612))

### Refactoring
- Refactor quick configure components, improve processor error handling ([#604](https://github.com/opensearch-project/dashboards-flow-framework/pull/604))
- Hide search query section when version is less than 2.19 ([#605](https://github.com/opensearch-project/dashboards-flow-framework/pull/605))
