/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiLink,
  EuiTab,
  EuiTabs,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import {
  BULK_API_DOCS_LINK,
  CREATE_WORKFLOW_LINK,
  ML_REMOTE_MODEL_LINK,
  SEARCH_PIPELINE_DOCS_LINK,
} from '../../../../common';

interface IntroFlyoutProps {
  onClose: () => void;
}

enum INTRO_TAB_ID {
  OVERVIEW = 'overview',
  INGEST_FLOW = 'ingest_flow',
  SEARCH_FLOW = 'search_flow',
  EXPORT_AND_DEPLOY = 'export_and_deploy',
}

const INTRO_TABS = [
  {
    id: INTRO_TAB_ID.OVERVIEW,
    name: 'Overview',
  },
  {
    id: INTRO_TAB_ID.INGEST_FLOW,
    name: 'Ingest flow',
  },
  {
    id: INTRO_TAB_ID.SEARCH_FLOW,
    name: 'Search flow',
  },
  {
    id: INTRO_TAB_ID.EXPORT_AND_DEPLOY,
    name: 'Export and deploy',
  },
];

/**
 * Basic introduction flyout describing how the plugin works. Contains just static content.
 */
export function IntroFlyout(props: IntroFlyoutProps) {
  const [selectedTabId, setSelectedTabId] = useState<INTRO_TAB_ID>(
    INTRO_TAB_ID.OVERVIEW
  );

  return (
    <EuiFlyout onClose={props.onClose}>
      <EuiFlyoutHeader>
        <EuiTitle>
          <h2>{`How it works`}</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiFlexGroup direction="column" gutterSize="m">
          <EuiFlexItem grow={false}>
            <EuiTabs size="s" expand={false}>
              {INTRO_TABS.map((tab, idx) => {
                return (
                  <EuiTab
                    onClick={() => setSelectedTabId(tab.id)}
                    isSelected={tab.id === selectedTabId}
                    disabled={false}
                    key={idx}
                  >
                    {tab.name}
                  </EuiTab>
                );
              })}
            </EuiTabs>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup direction="column" gutterSize="s">
              <>
                {selectedTabId === INTRO_TAB_ID.OVERVIEW && (
                  <>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="m">
                        <h3>Following the steps to build your workflow</h3>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>1. Set up models</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>
                          Connect to an externally hosted model and make it
                          available in your OpenSearch cluster.
                        </p>
                        <p style={{ marginTop: '-16px' }}>
                          <EuiLink href={ML_REMOTE_MODEL_LINK} target="_blank">
                            Learn more about setting up models
                          </EuiLink>
                        </p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>2. Build ingest flow</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>
                          Define an ingest flow to enrich your data and ingest
                          it into OpenSearch. Start by importing a data sample,
                          then add processors to enrich your data.
                        </p>
                        <p style={{ marginTop: '-16px' }}>
                          If you are using an existing index with data, you can
                          skip this step.
                        </p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>3. Build a search flow</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>
                          Define a query interface, then enrich the query using
                          processors. You can also enhance the query results
                          using additional processors.
                        </p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>4. Export and deploy the workflow</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>
                          Export your workflow template to replicate resources
                          and provision the workflow in other OpenSearch
                          clusters.
                        </p>
                      </EuiText>
                    </EuiFlexItem>
                  </>
                )}
                {selectedTabId === INTRO_TAB_ID.INGEST_FLOW && (
                  <>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="m">
                        <h3>Ingesting data</h3>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>Define an ingest flow</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>
                          Define an ingest flow to enrich your data and ingest
                          it into OpenSearch. Start by importing a sample, then
                          add processors to enrich your data.
                        </p>
                        <p style={{ marginTop: '-16px' }}>
                          If you are using an existing index with data, you can
                          skip this step.
                        </p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>Validate the ingested data</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>
                          Once you have updated your flow, run a search on the
                          index to validate your ingested data using the testing
                          tool.
                        </p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>Ingest additional data using the Bulk API</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>
                          You can ingest additional data into your index using
                          the Bulk API.{' '}
                          <EuiLink href={BULK_API_DOCS_LINK} target="_blank">
                            Learn more
                          </EuiLink>
                        </p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiCodeBlock fontSize="m" isCopyable={true}>
                        {`POST _bulk
{ "delete": { "_index": "movies", "_id": "tt2229499" } }
{ "index": { "_index": "movies", "_id": "tt1979320" } }
{ "title": "Rush", "year": 2013 }
{ "create": { "_index": "movies", "_id": "tt1392214" } }
{ "title": "Prisoners", "year": 2013 }
{ "update": { "_index": "movies", "_id": "tt0816711" } }
{ "doc" : { "title": "World War Z" } }`}
                      </EuiCodeBlock>
                    </EuiFlexItem>
                  </>
                )}
                {selectedTabId === INTRO_TAB_ID.SEARCH_FLOW && (
                  <>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="m">
                        <h3>Searching data</h3>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>Define search flow</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>
                          Define a query interface, then enrich the query using
                          processors. You can also enhance the query results
                          using additional processors.
                        </p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>Validate the flow</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>
                          Test your search flow by running a search using the
                          testing tool.
                        </p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>Apply the search flow</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>
                          You can invoke the search pipeline API in your
                          applications.{' '}
                          <EuiLink
                            href={SEARCH_PIPELINE_DOCS_LINK}
                            target="_blank"
                          >
                            Learn more
                          </EuiLink>
                        </p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiCodeBlock fontSize="m" isCopyable={true}>
                        {`GET /my_index/_search?search_pipeline=my_pipeline
{
  "query": {
    "term": {
      "item_text": {
        "value": "{{query_text}}"
      }
    }
  }
}`}
                      </EuiCodeBlock>
                    </EuiFlexItem>
                  </>
                )}
                {selectedTabId === INTRO_TAB_ID.EXPORT_AND_DEPLOY && (
                  <>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="m">
                        <h3>Exporting and using a workflow</h3>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>Download the file</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>
                          Once you are finished building the workflow, download
                          the workflow template by selecting the Export button.
                          You can choose JSON or YAML format.
                        </p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>Using the file</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>
                          Create and provision the workflow using the downloaded
                          file.
                        </p>
                        <p style={{ marginTop: '-16px' }}>
                          Certain resource IDs in the template, such as model
                          IDs, may be specific to a cluster and not function
                          correctly in other clusters. Make sure to update these
                          values before provisioning the workflow in a new
                          cluster.
                        </p>
                        <p style={{ marginTop: '-16px' }}>
                          <EuiLink href={CREATE_WORKFLOW_LINK} target="_blank">
                            Learn more
                          </EuiLink>
                        </p>
                      </EuiText>
                    </EuiFlexItem>
                  </>
                )}
              </>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
}
