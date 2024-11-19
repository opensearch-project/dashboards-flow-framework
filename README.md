## OpenSearch Flow Framework Dashboards Plugin

The OpenSearch Flow plugin on OpenSearch Dashboards (OSD) gives users the ability to iteratively build out search and ingest pipelines, initially focusing on ease-of-use for AI/ML-enhanced use cases via [ML inference processors](https://opensearch.org/docs/latest/ingest-pipelines/processors/ml-inference/). Behind the scenes, the plugin uses the [Flow Framework OpenSearch plugin](https://opensearch.org/docs/latest/automating-configurations/index/) for resource management for each use case / workflow a user creates. For example, most use cases involve configuring and creating indices, ingest pipelines, and search pipelines. All of these resources are created, updated, deleted, and maintained by the Flow Framework plugin. When users are satisfied with a use case they have built out, they can export the produced [Workflow Template](https://opensearch.org/docs/latest/automating-configurations/workflow-templates/) to re-create resources for their use cases across different clusters / data sources.

For tutorials on how to leverage this plugin, see [here](./documentation/.tutorial-11-18-2024.md).

For how to set up this plugin in a development environment, see [DEVELOPER_GUIDE](./DEVELOPER_GUIDE.md).

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the Apache-2.0 License.
