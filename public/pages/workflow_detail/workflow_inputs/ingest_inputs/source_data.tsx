/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { getIn, useFormikContext } from 'formik';
import {
  EuiSmallButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiText,
  EuiCodeBlock,
  EuiSmallButtonEmpty,
} from '@elastic/eui';
import {
  FETCH_ALL_QUERY,
  IndexMappings,
  MapEntry,
  SOURCE_OPTIONS,
  SearchHit,
  Workflow,
  WorkflowConfig,
  WorkspaceFormValues,
  customStringify,
  isVectorSearchUseCase,
  toFormattedDate,
} from '../../../../../common';
import { getMappings, searchIndex, useAppDispatch } from '../../../../store';
import { getDataSourceId } from '../../../../utils';
import { SourceDataModal } from './source_data_modal';

interface SourceDataProps {
  workflow: Workflow | undefined;
  uiConfig: WorkflowConfig;
  setIngestDocs: (docs: string) => void;
  lastIngested: number | undefined;
}

/**
 * Input component for configuring the source data for ingest.
 */
export function SourceData(props: SourceDataProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { values, setFieldValue } = useFormikContext<WorkspaceFormValues>();

  // empty/populated docs state
  let docs = [];
  try {
    docs = JSON.parse(getIn(values, 'ingest.docs', []));
  } catch {}
  const docsPopulated = docs.length > 0;

  // selected option state
  const [selectedOption, setSelectedOption] = useState<SOURCE_OPTIONS>(
    SOURCE_OPTIONS.MANUAL
  );

  // edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // selected index state. when an index is selected, update several form values (if vector search)
  const [selectedIndex, setSelectedIndex] = useState<string | undefined>(
    undefined
  );
  useEffect(() => {
    if (selectedIndex !== undefined) {
      // 1. fetch and set sample docs
      dispatch(
        searchIndex({
          apiBody: {
            index: selectedIndex,
            body: FETCH_ALL_QUERY,
            searchPipeline: '_none',
          },
          dataSourceId,
        })
      )
        .unwrap()
        .then((resp) => {
          const docObjs = resp.hits?.hits
            ?.slice(0, 5)
            ?.map((hit: SearchHit) => hit?._source);
          setFieldValue('ingest.docs', customStringify(docObjs));
        });

      // 2. fetch index mappings, and try to set defaults for the ML processor configs, if applicable
      if (isVectorSearchUseCase(props.workflow)) {
        dispatch(getMappings({ index: selectedIndex, dataSourceId }))
          .unwrap()
          .then((resp: IndexMappings) => {
            const { processorId, inputMapEntry } = getProcessorInfo(
              props.uiConfig,
              values
            );
            if (processorId !== undefined && inputMapEntry !== undefined) {
              // set/overwrite default text field for the input map. may be empty.
              if (inputMapEntry !== undefined) {
                const textFieldFormPath = `ingest.enrich.${processorId}.input_map.0.0.value`;
                const curTextField = getIn(values, textFieldFormPath) as string;
                if (!Object.keys(resp.properties).includes(curTextField)) {
                  const defaultTextField =
                    Object.keys(resp.properties).find((fieldName) => {
                      return resp.properties[fieldName]?.type === 'text';
                    }) || '';
                  setFieldValue(textFieldFormPath, defaultTextField);
                }
              }
            }
          });
      }
    }
  }, [selectedIndex]);

  // hook to clear out the selected index when switching options
  useEffect(() => {
    if (selectedOption !== SOURCE_OPTIONS.EXISTING_INDEX) {
      setSelectedIndex(undefined);
    }
  }, [selectedOption]);

  // hook to listen when the docs form value changes.
  useEffect(() => {
    if (values?.ingest?.docs) {
      props.setIngestDocs(values.ingest.docs);
    }

    // try to clear out any default values for the ML ingest processor, if applicable
    if (
      isVectorSearchUseCase(props.workflow) &&
      isEditModalOpen &&
      selectedOption !== SOURCE_OPTIONS.EXISTING_INDEX
    ) {
      let sampleDoc = undefined as {} | undefined;
      try {
        sampleDoc = JSON.parse(values.ingest.docs)[0];
      } catch (error) {}
      if (sampleDoc !== undefined) {
        const { processorId, inputMapEntry } = getProcessorInfo(
          props.uiConfig,
          values
        );
        if (processorId !== undefined && inputMapEntry !== undefined) {
          if (inputMapEntry !== undefined) {
            const textFieldFormPath = `ingest.enrich.${processorId}.input_map.0.0.value`;
            const curTextField = getIn(values, textFieldFormPath) as string;
            if (!Object.keys(sampleDoc).includes(curTextField)) {
              setFieldValue(textFieldFormPath, '');
            }
          }
        }
      }
    }
  }, [values?.ingest?.docs]);

  return (
    <>
      {isEditModalOpen && (
        <SourceDataModal
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          setIsModalOpen={setIsEditModalOpen}
        />
      )}
      <EuiFlexGroup direction="column" gutterSize="s">
        <EuiFlexItem grow={false}>
          <EuiFlexGroup direction="row" justifyContent="spaceBetween">
            <EuiFlexItem grow={false}>
              <EuiText size="s">
                <h3>Import data</h3>
              </EuiText>
            </EuiFlexItem>
            {docsPopulated && (
              <EuiFlexItem grow={false}>
                <EuiSmallButtonEmpty
                  onClick={() => setIsEditModalOpen(true)}
                  data-testid="editSourceDataButton"
                  iconType="pencil"
                  iconSide="left"
                >
                  Edit
                </EuiSmallButtonEmpty>
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        </EuiFlexItem>
        {props.lastIngested !== undefined && (
          <EuiFlexItem grow={false}>
            <EuiText size="s" color="subdued">
              {`Last ingested: ${toFormattedDate(props.lastIngested)}`}
            </EuiText>
          </EuiFlexItem>
        )}

        {!docsPopulated && (
          <EuiFlexItem grow={false}>
            <EuiSmallButton
              fill={false}
              style={{ width: '100px' }}
              onClick={() => setIsEditModalOpen(true)}
              data-testid="selectDataToImportButton"
            >
              {`Select data`}
            </EuiSmallButton>
          </EuiFlexItem>
        )}

        {docsPopulated && (
          <>
            <EuiSpacer size="s" />
            <EuiFlexItem grow={true}>
              <EuiCodeBlock
                fontSize="s"
                language="json"
                overflowHeight={300}
                isCopyable={false}
                whiteSpace="pre"
                paddingSize="none"
              >
                {getIn(values, 'ingest.docs')}
              </EuiCodeBlock>
            </EuiFlexItem>
          </>
        )}
      </EuiFlexGroup>
    </>
  );
}

// helper fn to parse out some useful info from the ML ingest processor config, if applicable
// takes on the assumption the first processor is an ML inference processor, and should
// only be executed for workflows coming from preset vector search use cases.
function getProcessorInfo(
  uiConfig: WorkflowConfig,
  values: WorkspaceFormValues
): {
  processorId: string | undefined;
  inputMapEntry: MapEntry | undefined;
} {
  const ingestProcessorId = uiConfig.ingest.enrich.processors[0]?.id as
    | string
    | undefined;
  return {
    processorId: ingestProcessorId,
    inputMapEntry:
      (getIn(
        values,
        `ingest.enrich.${ingestProcessorId}.input_map.0.0`,
        undefined
      ) as MapEntry) || undefined,
  };
}
