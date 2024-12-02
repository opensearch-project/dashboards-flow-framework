/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { isEmpty } from 'lodash';
import { useFormikContext } from 'formik';
import {
  EuiCodeEditor,
  EuiComboBox,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSmallButton,
  EuiText,
} from '@elastic/eui';
import {
  customStringify,
  SearchHit,
  WorkflowFormValues,
} from '../../../../../common';
import { searchIndex, useAppDispatch } from '../../../../store';
import { getDataSourceId } from '../../../../utils';

interface QueryProps {
  queryResponse: string;
  setQueryResponse: (queryResponse: string) => void;
  hasSearchPipeline: boolean;
}

const SEARCH_OPTIONS = [
  {
    label: 'FULL search pipeline',
  },
  {
    label: 'No search pipeline',
  },
];

/**
 * The search component for the Tools panel.
 * Lets users configure query parameters, execute search, and view responses.
 */
export function Query(props: QueryProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();

  // Form state
  const { values } = useFormikContext<WorkflowFormValues>();

  // state for if to execute search w/ or w/o any configured search pipeline.
  // default based on if there is an available search pipeline or not.
  const [includePipeline, setIncludePipeline] = useState<boolean>(false);
  useEffect(() => {
    setIncludePipeline(props.hasSearchPipeline);
  }, [props.hasSearchPipeline]);

  // empty states
  const noSearchIndex = isEmpty(values?.search?.index?.name);
  const noSearchRequest = isEmpty(values?.search?.request);

  return (
    <>
      {noSearchIndex || noSearchRequest ? (
        <EuiEmptyPrompt
          title={<h2>Missing search configurations</h2>}
          titleSize="s"
          body={
            <>
              <EuiText size="s">
                Configure a search request and an index to search against first.
              </EuiText>
            </>
          }
        />
      ) : (
        <EuiFlexGroup direction="row">
          <EuiFlexItem>
            <EuiFlexGroup direction="column" gutterSize="s">
              <EuiFlexItem grow={false}>
                <EuiFlexGroup direction="row" justifyContent="spaceBetween">
                  <EuiFlexItem grow={false}>
                    <EuiText size="m">Search</EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiSmallButton
                      fill={true}
                      onClick={() => {
                        dispatch(
                          searchIndex({
                            apiBody: {
                              index: values?.search?.index?.name,
                              body: values?.search?.request,
                              searchPipeline:
                                props.hasSearchPipeline &&
                                includePipeline &&
                                !isEmpty(values?.search?.pipelineName)
                                  ? values?.search?.pipelineName
                                  : '_none',
                            },
                            dataSourceId,
                          })
                        )
                          .unwrap()
                          .then(async (resp) => {
                            props.setQueryResponse(
                              customStringify(
                                resp?.hits?.hits?.map(
                                  (hit: SearchHit) => hit._source
                                )
                              )
                            );
                          })
                          .catch((error: any) => {
                            props.setQueryResponse('');
                            console.error('Error running query: ', error);
                          });
                      }}
                    >
                      Search
                    </EuiSmallButton>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiComboBox
                  fullWidth={false}
                  compressed={true}
                  singleSelection={{ asPlainText: true }}
                  isClearable={false}
                  options={
                    props.hasSearchPipeline
                      ? SEARCH_OPTIONS
                      : [SEARCH_OPTIONS[1]]
                  }
                  selectedOptions={
                    props.hasSearchPipeline && includePipeline
                      ? [SEARCH_OPTIONS[0]]
                      : [SEARCH_OPTIONS[1]]
                  }
                  onChange={(options) => {
                    setIncludePipeline(!includePipeline);
                  }}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGroup direction="column" gutterSize="s">
              <EuiFlexItem grow={false}>
                <EuiText size="m">Results</EuiText>
              </EuiFlexItem>
              <EuiFlexItem>
                {isEmpty(props.queryResponse) ? (
                  <EuiEmptyPrompt
                    title={<h2>No results</h2>}
                    titleSize="s"
                    body={
                      <>
                        <EuiText size="s">Run search to view results.</EuiText>
                      </>
                    }
                  />
                ) : (
                  // Known issue with the editor where resizing the resizablecontainer does not
                  // trigger vertical scroll updates. Updating the window, or reloading the component
                  // by switching tabs etc. will refresh it correctly
                  <EuiCodeEditor
                    mode="json"
                    theme="textmate"
                    width="100%"
                    height="100%"
                    value={props.queryResponse}
                    readOnly={true}
                    setOptions={{
                      fontSize: '12px',
                      autoScrollEditorIntoView: true,
                      wrap: true,
                    }}
                    tabSize={2}
                  />
                )}
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      )}
    </>
  );
}
