/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiText,
  EuiEmptyPrompt,
  EuiHealth,
  EuiSpacer,
  EuiLink,
} from '@elastic/eui';
import {
  BULK_API_DOCS_LINK,
  SEARCH_PIPELINE_DOCS_LINK,
  WORKFLOW_STEP_TYPE,
  WorkflowResource,
} from '../../../../../common';

interface ResourceFlyoutContentProps {
  resource: WorkflowResource;
  resourceDetails: string;
  errorMessage?: string;
  indexName?: string;
  searchPipelineName?: string;
  ingestPipelineName?: string;
  searchQuery?: string;
}

/**
 * The static flyout content for a particular workflow resource.
 */
export function ResourceFlyoutContent(props: ResourceFlyoutContentProps) {
  return (
    <EuiFlexGroup direction="column" gutterSize="xs">
      <EuiFlexItem grow={false}>
        <EuiTitle size="s">
          <h4>Name</h4>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiText>{props.resource?.id || ''}</EuiText>
      </EuiFlexItem>
      <EuiSpacer size="s" />
      <EuiFlexItem grow={false}>
        <EuiTitle size="s">
          <h4>Status</h4>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiHealth color="success">Active</EuiHealth>
      </EuiFlexItem>
      <EuiSpacer size="s" />
      <EuiFlexItem grow={false}>
        <EuiTitle size="s">
          <h4>
            {props.resource?.stepType ===
            WORKFLOW_STEP_TYPE.CREATE_INDEX_STEP_TYPE
              ? 'Configuration'
              : 'Pipeline configuration'}
          </h4>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem grow={true}>
        {!props.errorMessage ? (
          <EuiCodeBlock
            language="json"
            fontSize="m"
            isCopyable={true}
            overflowHeight={600}
          >
            {props.resourceDetails}
          </EuiCodeBlock>
        ) : (
          <EuiEmptyPrompt
            iconType="alert"
            iconColor="danger"
            title={<h2>Error loading resource details</h2>}
            body={<p>{props.errorMessage}</p>}
          />
        )}
      </EuiFlexItem>
      <EuiSpacer size="s" />
      <EuiFlexItem grow={false}>
        <EuiTitle size="s">
          <h4>
            {props.resource?.stepType ===
            WORKFLOW_STEP_TYPE.CREATE_INDEX_STEP_TYPE
              ? 'Ingest additional data using the bulk API'
              : props.resource?.stepType ===
                WORKFLOW_STEP_TYPE.CREATE_INGEST_PIPELINE_STEP_TYPE
              ? 'Ingest additional data using the bulk API'
              : 'Apply a search pipeline to your applications'}
          </h4>
        </EuiTitle>
      </EuiFlexItem>
      {props.resource?.stepType ===
      WORKFLOW_STEP_TYPE.CREATE_SEARCH_PIPELINE_STEP_TYPE ? (
        <EuiFlexItem grow={false}>
          <EuiText size="s">
            <p>
              You can invoke the search pipeline API in your applications.{' '}
              <EuiLink href={SEARCH_PIPELINE_DOCS_LINK} target="_blank">
                Learn more
              </EuiLink>
            </p>
          </EuiText>
        </EuiFlexItem>
      ) : (
        <EuiFlexItem grow={false}>
          <EuiText size="s">
            <p>
              You can ingest a larger amount of data using the Bulk API.{' '}
              <EuiLink href={BULK_API_DOCS_LINK} target="_blank">
                Learn more
              </EuiLink>
            </p>
          </EuiText>
        </EuiFlexItem>
      )}
      {props.resource?.stepType ===
      WORKFLOW_STEP_TYPE.CREATE_SEARCH_PIPELINE_STEP_TYPE ? (
        <EuiFlexItem grow={false}>
          <EuiCodeBlock fontSize="m" isCopyable={true}>
            {`GET /${props.indexName || 'my_index'}/_search?search_pipeline=${
              props.searchPipelineName || 'my_pipeline'
            }
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
      ) : (
        <EuiFlexItem grow={false}>
          <EuiCodeBlock fontSize="m" isCopyable={true}>
            {`POST _bulk
{ "index": { "_index": "${props.indexName || 'my_index'}", "_id": "abc123" } }
{ "my_field_1": "my_field_value_1", "my_field_2": "my_field_value_2" }`}
          </EuiCodeBlock>
        </EuiFlexItem>
      )}
    </EuiFlexGroup>
  );
}
