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
                        <h3>Follow the steps below to build your workflow</h3>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>Set up models</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        If your use case involves integrating with ML models,
                        ensure you have accessible remote models in your
                        cluster.&nbsp;
                        <EuiLink href={ML_REMOTE_MODEL_LINK}>
                          Learn more
                        </EuiLink>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>Build ingest flow</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>
                          Define your ingest flow to enrich and ingest your data
                          into OpenSearch. Start with importing a sample of your
                          data and add processors to enrich your data.
                        </p>
                        <p>
                          If you already have an existing index with data, you
                          can skip defining an ingest flow.
                        </p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>Build search flow</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>
                          Start with defining a query interface, then enrich
                          your query with processors. You can also enhance the
                          query results with additional processors.
                        </p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>Export and deploy</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>
                          Export your workflow as a last step. To build out
                          identical resources in other environments, create and
                          provision a workflow using the templates.
                        </p>
                      </EuiText>
                    </EuiFlexItem>
                  </>
                )}
                {selectedTabId === INTRO_TAB_ID.INGEST_FLOW && (
                  <>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="m">
                        <h3>Using ingest flow</h3>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>Define ingest flow</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>
                          Define your ingest flow to enrich and ingest your data
                          into OpenSearch. Start with importing a sample of your
                          data and add processors to enrich your data.
                        </p>
                        <p>
                          If you already have an existing index with data, you
                          can skip defining an ingest flow.
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
                          index to validate your ingested data.
                        </p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>Ingest more data with the bulk API</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>
                          You can ingest larger amounts of data with your ingest
                          pipeline using the bulk API.{' '}
                          <EuiLink href={BULK_API_DOCS_LINK}>
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
                        <h3>Using search pipeline</h3>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>Define search pipeline</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>
                          Start with defining a query interface, then enrich
                          your query with processors. You can also enhance the
                          query results with additional processors.
                        </p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>Validate pipeline</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>Test your pipeline by running a search.</p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>Apply search pipeline to your applications</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>
                          You can invoke the search pipeline API in your
                          applications.{' '}
                          <EuiLink href={SEARCH_PIPELINE_DOCS_LINK}>
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
                        <h3>Exporting and using workflow</h3>
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
                          Once you are finished building the flow, download the
                          file using the export button on the top-right corner.
                          You can choose between JSON and YAML.
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
                          Create and provision a workflow using the downloaded
                          file.
                        </p>
                        <p>
                          Certain resource IDs in the template, such as model
                          IDs, may be cluster-specific and not work
                          out-of-the-box in other environments. Ensure these
                          values are updated before attempting to provision in
                          other environments.
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
