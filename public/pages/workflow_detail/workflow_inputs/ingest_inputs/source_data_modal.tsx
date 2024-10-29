/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Formik, getIn, useFormikContext } from 'formik';
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
} from '@elastic/eui';
import { JsonField } from '../input_fields';
import {
  IConfigField,
  IngestDocsFormValues,
  SOURCE_OPTIONS,
  WorkflowFormValues,
} from '../../../../../common';
import { AppState } from '../../../../store';
import { getFieldSchema, getInitialValue } from '../../../../utils';

interface SourceDataProps {
  selectedOption: SOURCE_OPTIONS;
  setSelectedOption: (option: SOURCE_OPTIONS) => void;
  selectedIndex: string | undefined;
  setSelectedIndex: (index: string) => void;
  setIsModalOpen: (isOpen: boolean) => void;
}

/**
 * Modal for configuring the source data for ingest.
 */
export function SourceDataModal(props: SourceDataProps) {
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
  });

  // persist standalone values. update when there is changes detected to the parent form
  const [tempDocs, setTempDocs] = useState<string>('[]');
  useEffect(() => {
    setTempDocs(getIn(values, 'ingest.docs'));
  }, [getIn(values, 'ingest.docs')]);

  function onClose() {
    props.setIsModalOpen(false);
  }

  function onUpdate() {
    // 1. Update the form with the temp docs
    setFieldValue('ingest.docs', tempDocs);

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
        // internal hook to loop back and update tempDocs when form changes are detected
        useEffect(() => {
          setTempDocs(getIn(formikProps.values, 'docs'));
        }, [getIn(formikProps.values, 'docs')]);

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
                      valueOfSelected={props.selectedIndex}
                      onChange={(option) => {
                        props.setSelectedIndex(option);
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
              <EuiSmallButton
                onClick={() => onClose()}
                fill={false}
                color="primary"
                data-testid="cancelSourceDataButton"
              >
                Cancel
              </EuiSmallButton>
              <EuiSmallButton
                onClick={() => onUpdate()}
                fill={true}
                color="primary"
                data-testid="updateSourceDataButton"
              >
                Update
              </EuiSmallButton>
            </EuiModalFooter>
          </EuiModal>
        );
      }}
    </Formik>
  );
}
