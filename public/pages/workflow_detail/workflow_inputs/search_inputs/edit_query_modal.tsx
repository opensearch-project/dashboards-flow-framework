/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Formik, getIn, useFormikContext } from 'formik';
import * as yup from 'yup';
import { isEmpty } from 'lodash';
import {
  EuiSmallButton,
  EuiContextMenu,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiPopover,
  EuiSmallButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
} from '@elastic/eui';
import { JsonField } from '../input_fields';
import {
  IConfigField,
  QUERY_PRESETS,
  QueryPreset,
  RequestFormValues,
  WorkflowFormValues,
} from '../../../../../common';
import { getFieldSchema, getInitialValue } from '../../../../utils';

interface EditQueryModalProps {
  queryFieldPath: string;
  setModalOpen(isOpen: boolean): void;
}

/**
 * Basic modal for configuring a query. Provides a dropdown to select from
 * a set of pre-defined queries targeted for different use cases.
 */
export function EditQueryModal(props: EditQueryModalProps) {
  // sub-form values/schema
  const requestFormValues = {
    request: getInitialValue('json'),
  } as RequestFormValues;
  const requestFormSchema = yup.object({
    request: getFieldSchema({
      type: 'json',
    } as IConfigField),
  }) as yup.Schema;

  // persist standalone values. update / initialize when it is first opened
  const [tempRequest, setTempRequest] = useState<string>('{}');
  const [tempErrors, setTempErrors] = useState<boolean>(false);

  // Form state
  const { values, setFieldValue, setFieldTouched } = useFormikContext<
    WorkflowFormValues
  >();

  // popover state
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);

  return (
    <Formik
      enableReinitialize={false}
      initialValues={requestFormValues}
      validationSchema={requestFormSchema}
      onSubmit={(values) => {}}
      validate={(values) => {}}
    >
      {(formikProps) => {
        // override to parent form value when changes detected
        useEffect(() => {
          formikProps.setFieldValue(
            'request',
            getIn(values, props.queryFieldPath)
          );
        }, [getIn(values, props.queryFieldPath)]);

        // update tempRequest when form changes are detected
        useEffect(() => {
          setTempRequest(getIn(formikProps.values, 'request'));
        }, [getIn(formikProps.values, 'request')]);

        // update tempErrors if errors detected
        useEffect(() => {
          setTempErrors(!isEmpty(formikProps.errors));
        }, [formikProps.errors]);

        return (
          <EuiModal
            onClose={() => props.setModalOpen(false)}
            style={{ width: '70vw' }}
            data-testid="editQueryModal"
          >
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                <p>{`Edit query definition`}</p>
              </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody data-testid="editQueryModalBody">
              <EuiFlexGroup direction="row">
                <EuiFlexItem>
                  <EuiFlexGroup direction="column">
                    <EuiFlexItem grow={false}>
                      <EuiFlexGroup
                        direction="row"
                        justifyContent="spaceBetween"
                      >
                        <EuiFlexItem grow={false}>
                          <EuiText size="m">Query definition</EuiText>
                        </EuiFlexItem>
                        <EuiFlexItem grow={false}>
                          <EuiPopover
                            button={
                              <EuiSmallButton
                                onClick={() => setPopoverOpen(!popoverOpen)}
                                data-testid="searchQueryPresetButton"
                                iconSide="right"
                                iconType="arrowDown"
                              >
                                Query samples
                              </EuiSmallButton>
                            }
                            isOpen={popoverOpen}
                            closePopover={() => setPopoverOpen(false)}
                            anchorPosition="downLeft"
                          >
                            <EuiContextMenu
                              size="s"
                              initialPanelId={0}
                              panels={[
                                {
                                  id: 0,
                                  items: QUERY_PRESETS.map(
                                    (preset: QueryPreset) => ({
                                      name: preset.name,
                                      onClick: () => {
                                        formikProps.setFieldValue(
                                          'request',
                                          preset.query
                                        );
                                        setPopoverOpen(false);
                                      },
                                    })
                                  ),
                                },
                              ]}
                            />
                          </EuiPopover>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <JsonField
                        label="Query"
                        fieldPath={'request'}
                        editorHeight="25vh"
                        readOnly={false}
                      />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiFlexGroup direction="column">
                    <EuiFlexItem grow={false}>
                      <EuiFlexGroup
                        direction="row"
                        justifyContent="spaceBetween"
                      >
                        <EuiFlexItem grow={false}>
                          <EuiText size="m">Test query</EuiText>
                        </EuiFlexItem>
                        <EuiFlexItem grow={false}>
                          <EuiSmallButton
                            fill={false}
                            onClick={() => {
                              console.log('searching...');
                            }}
                          >
                            Search
                          </EuiSmallButton>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </EuiFlexItem>
                    <EuiFlexItem>TODO add query parameters</EuiFlexItem>
                    <EuiFlexItem>TODO add search results</EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiModalBody>
            <EuiModalFooter>
              <EuiSmallButtonEmpty
                onClick={() => props.setModalOpen(false)}
                color="primary"
                data-testid="cancelSearchQueryButton"
              >
                Cancel
              </EuiSmallButtonEmpty>
              <EuiSmallButton
                onClick={() => {
                  setFieldValue(props.queryFieldPath, tempRequest);
                  setFieldTouched(props.queryFieldPath, true);
                  props.setModalOpen(false);
                }}
                isDisabled={tempErrors} // blocking update until valid input is given
                fill={true}
                color="primary"
                data-testid="updateSearchQueryButton"
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
