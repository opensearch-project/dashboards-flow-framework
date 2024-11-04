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
  EuiSpacer,
  EuiSmallButtonEmpty,
} from '@elastic/eui';
import { JsonField } from '../input_fields';
import {
  IConfigField,
  QUERY_PRESETS,
  QueryPreset,
  RequestFormValues,
  RequestSchema,
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
  }) as RequestSchema;

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
                <p>{`Edit query`}</p>
              </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody data-testid="editQueryModalBody">
              <EuiPopover
                button={
                  <EuiSmallButton
                    onClick={() => setPopoverOpen(!popoverOpen)}
                    data-testid="searchQueryPresetButton"
                  >
                    Choose from a preset
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
                      items: QUERY_PRESETS.map((preset: QueryPreset) => ({
                        name: preset.name,
                        onClick: () => {
                          formikProps.setFieldValue('request', preset.query);
                          setPopoverOpen(false);
                        },
                      })),
                    },
                  ]}
                />
              </EuiPopover>
              <EuiSpacer size="s" />
              <JsonField
                label="Query"
                fieldPath={'request'}
                editorHeight="25vh"
                readOnly={false}
              />
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
