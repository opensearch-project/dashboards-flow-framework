/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIn, useFormikContext } from 'formik';
import {
  EuiSmallButton,
  EuiCompressedFilePicker,
  EuiFlexGroup,
  EuiFlexItem,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
  EuiText,
  EuiTitle,
  EuiFilterGroup,
  EuiSmallFilterButton,
  EuiSuperSelectOption,
  EuiCompressedSuperSelect,
} from '@elastic/eui';
import { JsonField } from '../input_fields';
import {
  FETCH_ALL_QUERY,
  IndexMappings,
  MapEntry,
  SearchHit,
  WorkflowConfig,
  WorkspaceFormValues,
  customStringify,
} from '../../../../../common';
import {
  AppState,
  getMappings,
  searchIndex,
  useAppDispatch,
} from '../../../../store';
import { getDataSourceId } from '../../../../utils';

interface SourceDataProps {
  uiConfig: WorkflowConfig;
  setIngestDocs: (docs: string) => void;
}

enum SOURCE_OPTIONS {
  MANUAL = 'manual',
  UPLOAD = 'upload',
  EXISTING_INDEX = 'existing_index',
}

/**
 * Input component for configuring the source data for ingest.
 */
export function SourceData(props: SourceDataProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { values, setFieldValue } = useFormikContext<WorkspaceFormValues>();
  const indices = useSelector((state: AppState) => state.opensearch.indices);

  // selected option state
  const [selectedOption, setSelectedOption] = useState<SOURCE_OPTIONS>(
    SOURCE_OPTIONS.MANUAL
  );

  // edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // files state. when a file is read, update the form value.
  const fileReader = new FileReader();
  fileReader.onload = (e) => {
    if (e.target) {
      setFieldValue('ingest.docs', e.target.result);
    }
  };

  // selected index state. when an index is selected, update several form values
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

      // 2. fetch and set index mappings
      dispatch(getMappings({ index: selectedIndex, dataSourceId }))
        .unwrap()
        .then((resp: IndexMappings) => {
          setFieldValue('ingest.index.mappings', customStringify(resp));

          // 3. try to set default key/values for the ML processor input/output maps, if applicable
          const ingestProcessorId =
            props.uiConfig.ingest.enrich.processors[0]?.id;
          const ingestProcessorInputMapEntry =
            (getIn(
              values,
              `ingest.enrich.${ingestProcessorId}.input_map.0.0`,
              undefined
            ) as MapEntry) || undefined;
          const ingestProcessorOutputMapEntry =
            (getIn(
              values,
              `ingest.enrich.${ingestProcessorId}.output_map.0.0`,
              undefined
            ) as MapEntry) || undefined;

          if (
            ingestProcessorId !== undefined &&
            (ingestProcessorInputMapEntry !== undefined ||
              ingestProcessorOutputMapEntry !== undefined)
          ) {
            // set/overwrite default text field for the input map. may be empty.
            if (ingestProcessorInputMapEntry !== undefined) {
              const textFieldFormPath = `ingest.enrich.${ingestProcessorId}.input_map.0.0.value`;
              const curTextField = getIn(values, textFieldFormPath) as string;
              if (!Object.keys(resp.properties).includes(curTextField)) {
                const defaultTextField =
                  Object.keys(resp.properties).find((fieldName) => {
                    return resp.properties[fieldName]?.type === 'text';
                  }) || '';
                setFieldValue(textFieldFormPath, defaultTextField);
              }
            }
            // set/overwrite default vector field for the output map. may be empty.
            if (ingestProcessorOutputMapEntry !== undefined) {
              const vectorFieldFormPath = `ingest.enrich.${ingestProcessorId}.output_map.0.0.key`;
              const curVectorField = getIn(
                values,
                vectorFieldFormPath
              ) as string;
              if (!Object.keys(resp.properties).includes(curVectorField)) {
                const defaultVectorField =
                  Object.keys(resp.properties).find((fieldName) => {
                    return resp.properties[fieldName]?.type === 'knn_vector';
                  }) || '';
                setFieldValue(vectorFieldFormPath, defaultVectorField);
              }
            }
          }
        });
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
  }, [values?.ingest?.docs]);

  return (
    <>
      {isEditModalOpen && (
        <EuiModal
          onClose={() => setIsEditModalOpen(false)}
          style={{ width: '70vw' }}
        >
          <EuiModalHeader>
            <EuiModalHeaderTitle>
              <p>{`Edit source data`}</p>
            </EuiModalHeaderTitle>
          </EuiModalHeader>
          <EuiModalBody>
            <>
              <EuiFilterGroup>
                <EuiSmallFilterButton
                  id={SOURCE_OPTIONS.MANUAL}
                  hasActiveFilters={selectedOption === SOURCE_OPTIONS.MANUAL}
                  onClick={() => setSelectedOption(SOURCE_OPTIONS.MANUAL)}
                >
                  Manual
                </EuiSmallFilterButton>
                <EuiSmallFilterButton
                  id={SOURCE_OPTIONS.UPLOAD}
                  hasActiveFilters={selectedOption === SOURCE_OPTIONS.UPLOAD}
                  onClick={() => setSelectedOption(SOURCE_OPTIONS.UPLOAD)}
                >
                  Upload
                </EuiSmallFilterButton>
                <EuiSmallFilterButton
                  id={SOURCE_OPTIONS.EXISTING_INDEX}
                  hasActiveFilters={
                    selectedOption === SOURCE_OPTIONS.EXISTING_INDEX
                  }
                  onClick={() =>
                    setSelectedOption(SOURCE_OPTIONS.EXISTING_INDEX)
                  }
                >
                  Existing index
                </EuiSmallFilterButton>
              </EuiFilterGroup>
              <EuiSpacer size="m" />
              {selectedOption === SOURCE_OPTIONS.UPLOAD && (
                <>
                  <EuiCompressedFilePicker
                    accept="application/json"
                    multiple={false}
                    initialPromptText="Upload file"
                    onChange={(files) => {
                      if (files && files.length > 0) {
                        fileReader.readAsText(files[0]);
                      }
                    }}
                    display="default"
                  />
                  <EuiSpacer size="s" />
                </>
              )}
              {selectedOption === SOURCE_OPTIONS.EXISTING_INDEX && (
                <>
                  <EuiText color="subdued" size="s">
                    Up to 5 sample documents will be automatically populated.
                  </EuiText>
                  <EuiText color="subdued" size="s">
                    The currently-configured index mappings will be overwritten
                    to match any selected index.
                  </EuiText>
                  <EuiSpacer size="s" />
                  <EuiCompressedSuperSelect
                    options={Object.values(indices).map(
                      (option) =>
                        ({
                          value: option.name,
                          inputDisplay: <EuiText>{option.name}</EuiText>,
                          disabled: false,
                        } as EuiSuperSelectOption<string>)
                    )}
                    valueOfSelected={selectedIndex}
                    onChange={(option) => {
                      setSelectedIndex(option);
                    }}
                    isInvalid={false}
                  />
                  <EuiSpacer size="xs" />
                </>
              )}
              <JsonField
                label="Documents"
                fieldPath={'ingest.docs'}
                helpText="Documents should be formatted as a valid JSON array."
                editorHeight="25vh"
                readOnly={false}
              />
            </>
          </EuiModalBody>
          <EuiModalFooter>
            <EuiSmallButton
              onClick={() => setIsEditModalOpen(false)}
              fill={false}
              color="primary"
            >
              Close
            </EuiSmallButton>
          </EuiModalFooter>
        </EuiModal>
      )}
      <EuiFlexGroup direction="column" gutterSize="s">
        <EuiFlexItem grow={false}>
          <EuiTitle size="s">
            <h2>Source data</h2>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiSmallButton
            fill={false}
            style={{ width: '100px' }}
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit
          </EuiSmallButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <JsonField
            label="Documents"
            fieldPath={'ingest.docs'}
            helpText="Documents should be formatted as a valid JSON array."
            editorHeight="25vh"
            readOnly={true}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
}
