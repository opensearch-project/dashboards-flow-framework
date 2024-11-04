/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Formik, getIn, useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import * as yup from 'yup';
import {
  EuiSmallButton,
  EuiCompressedFilePicker,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
  EuiText,
  EuiFilterGroup,
  EuiSmallFilterButton,
  EuiSuperSelectOption,
  EuiCompressedSuperSelect,
  EuiSmallButtonEmpty,
} from '@elastic/eui';
import { JsonField } from '../input_fields';
import {
  customStringify,
  FETCH_ALL_QUERY,
  IConfigField,
  IndexMappings,
  IngestDocsFormValues,
  IngestDocsSchema,
  isVectorSearchUseCase,
  SearchHit,
  SOURCE_OPTIONS,
  Workflow,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../../../../common';
import {
  AppState,
  getMappings,
  searchIndex,
  useAppDispatch,
} from '../../../../store';
import {
  getDataSourceId,
  getFieldSchema,
  getInitialValue,
} from '../../../../utils';
import { getProcessorInfo } from './source_data';

interface SourceDataProps {
  workflow: Workflow | undefined;
  uiConfig: WorkflowConfig;
  selectedOption: SOURCE_OPTIONS;
  setSelectedOption: (option: SOURCE_OPTIONS) => void;
  setIsModalOpen: (isOpen: boolean) => void;
}

/**
 * Modal for configuring the source data for ingest. Maintains standalone form state, and only updates
 * parent form if the user explicitly clicks "Update", and there are no validation errors.
 */
export function SourceDataModal(props: SourceDataProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { values, setFieldValue } = useFormikContext<WorkflowFormValues>();
  const indices = useSelector((state: AppState) => state.opensearch.indices);

  // sub-form values/schema
  const docsFormValues = {
    docs: getInitialValue('jsonArray'),
  } as IngestDocsFormValues;
  const docsFormSchema = yup.object({
    docs: getFieldSchema({
      type: 'jsonArray',
    } as IConfigField),
  }) as IngestDocsSchema;

  // persist standalone values. update / initialize when it is first opened
  const [tempDocs, setTempDocs] = useState<string>('[]');
  const [tempErrors, setTempErrors] = useState<boolean>(false);

  // button updating state
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // selected index state
  const [selectedIndex, setSelectedIndex] = useState<string | undefined>(
    undefined
  );

  // hook to clear out the selected index when switching options
  useEffect(() => {
    if (props.selectedOption !== SOURCE_OPTIONS.EXISTING_INDEX) {
      setSelectedIndex(undefined);
    }
  }, [props.selectedOption]);

  function onClose() {
    props.setIsModalOpen(false);
  }

  function onUpdate() {
    setIsUpdating(true);
    // 1. Update the form with the temp docs
    setFieldValue('ingest.docs', tempDocs);

    // 2. Update several form values if an index is selected (and if vector search)
    if (selectedIndex !== undefined) {
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
                  setIsUpdating(false);
                }
              }
            }
          });
      }
    } else {
      setIsUpdating(false);
    }
    props.setIsModalOpen(false);
  }

  return (
    <Formik
      enableReinitialize={false}
      initialValues={docsFormValues}
      validationSchema={docsFormSchema}
      onSubmit={(values) => {}}
      validate={(values) => {}}
    >
      {(formikProps) => {
        // override to parent form value when changes detected
        useEffect(() => {
          formikProps.setFieldValue('docs', getIn(values, 'ingest.docs'));
        }, [getIn(values, 'ingest.docs')]);

        // update tempDocs when form changes are detected
        useEffect(() => {
          setTempDocs(getIn(formikProps.values, 'docs'));
        }, [getIn(formikProps.values, 'docs')]);

        // fetch & populate sample documents if an existing index is chosen
        useEffect(() => {
          if (selectedIndex !== undefined) {
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
                formikProps.setFieldValue('docs', customStringify(docObjs));
              });
          }
        }, [selectedIndex]);

        // update tempErrors if errors detected
        useEffect(() => {
          setTempErrors(!isEmpty(formikProps.errors));
        }, [formikProps.errors]);

        return (
          <EuiModal onClose={() => onClose()} style={{ width: '70vw' }}>
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                <p>{`Import data`}</p>
              </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
              <>
                <EuiFilterGroup>
                  <EuiSmallFilterButton
                    id={SOURCE_OPTIONS.MANUAL}
                    hasActiveFilters={
                      props.selectedOption === SOURCE_OPTIONS.MANUAL
                    }
                    onClick={() =>
                      props.setSelectedOption(SOURCE_OPTIONS.MANUAL)
                    }
                    data-testid="manualEditSourceDataButton"
                  >
                    Manual
                  </EuiSmallFilterButton>
                  <EuiSmallFilterButton
                    id={SOURCE_OPTIONS.UPLOAD}
                    hasActiveFilters={
                      props.selectedOption === SOURCE_OPTIONS.UPLOAD
                    }
                    onClick={() =>
                      props.setSelectedOption(SOURCE_OPTIONS.UPLOAD)
                    }
                    data-testid="uploadSourceDataButton"
                  >
                    Upload
                  </EuiSmallFilterButton>
                  <EuiSmallFilterButton
                    id={SOURCE_OPTIONS.EXISTING_INDEX}
                    hasActiveFilters={
                      props.selectedOption === SOURCE_OPTIONS.EXISTING_INDEX
                    }
                    onClick={() =>
                      props.setSelectedOption(SOURCE_OPTIONS.EXISTING_INDEX)
                    }
                    data-testid="selectIndexSourceDataButton"
                  >
                    Existing index
                  </EuiSmallFilterButton>
                </EuiFilterGroup>
                <EuiSpacer size="m" />
                {props.selectedOption === SOURCE_OPTIONS.UPLOAD && (
                  <>
                    <EuiCompressedFilePicker
                      accept="application/json"
                      multiple={false}
                      initialPromptText="Upload file"
                      onChange={(files) => {
                        if (files && files.length > 0) {
                          // create a custom filereader to update form with file values
                          const fileReader = new FileReader();
                          fileReader.onload = (e) => {
                            if (e.target) {
                              formikProps.setFieldValue(
                                'docs',
                                e.target.result as string
                              );
                            }
                          };
                          fileReader.readAsText(files[0]);
                        }
                      }}
                      display="default"
                    />
                    <EuiSpacer size="s" />
                  </>
                )}
                {props.selectedOption === SOURCE_OPTIONS.EXISTING_INDEX && (
                  <>
                    <EuiText color="subdued" size="s">
                      Up to 5 sample documents will be automatically populated.
                    </EuiText>
                    <EuiSpacer size="s" />
                    <EuiCompressedSuperSelect
                      options={Object.values(indices).map(
                        (option) =>
                          ({
                            value: option.name,
                            inputDisplay: (
                              <EuiText size="s">{option.name}</EuiText>
                            ),
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
                  label="Documents to be imported"
                  fieldPath={'docs'}
                  helpText="Documents should be formatted as a valid JSON array."
                  editorHeight="25vh"
                  readOnly={false}
                />
              </>
            </EuiModalBody>
            <EuiModalFooter>
              <EuiSmallButtonEmpty
                onClick={() => onClose()}
                color="primary"
                data-testid="closeSourceDataButton"
              >
                Cancel
              </EuiSmallButtonEmpty>
              <EuiSmallButton
                onClick={() => onUpdate()}
                isLoading={isUpdating}
                isDisabled={tempErrors} // blocking update until valid input is given
                fill={true}
                color="primary"
                data-testid="updateSourceDataButton"
              >
                Save
              </EuiSmallButton>
            </EuiModalFooter>
          </EuiModal>
        );
      }}
    </Formik>
  );
}
