/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { useFormikContext } from 'formik';
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
import { SOURCE_OPTIONS, WorkspaceFormValues } from '../../../../../common';
import { AppState } from '../../../../store';

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
  const { setFieldValue } = useFormikContext<WorkspaceFormValues>();
  const indices = useSelector((state: AppState) => state.opensearch.indices);

  // files state. when a file is read, update the form value.
  const fileReader = new FileReader();
  fileReader.onload = (e) => {
    if (e.target) {
      setFieldValue('ingest.docs', e.target.result);
    }
  };

  return (
    <EuiModal
      onClose={() => props.setIsModalOpen(false)}
      style={{ width: '70vw' }}
    >
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
              hasActiveFilters={props.selectedOption === SOURCE_OPTIONS.MANUAL}
              onClick={() => props.setSelectedOption(SOURCE_OPTIONS.MANUAL)}
              data-testid="manualEditSourceDataButton"
            >
              Manual
            </EuiSmallFilterButton>
            <EuiSmallFilterButton
              id={SOURCE_OPTIONS.UPLOAD}
              hasActiveFilters={props.selectedOption === SOURCE_OPTIONS.UPLOAD}
              onClick={() => props.setSelectedOption(SOURCE_OPTIONS.UPLOAD)}
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
                      inputDisplay: <EuiText size="s">{option.name}</EuiText>,
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
            fieldPath={'ingest.docs'}
            helpText="Documents should be formatted as a valid JSON array."
            editorHeight="25vh"
            readOnly={false}
          />
        </>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiSmallButton
          onClick={() => props.setIsModalOpen(false)}
          fill={false}
          color="primary"
          data-testid="closeSourceDataButton"
        >
          Close
        </EuiSmallButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
