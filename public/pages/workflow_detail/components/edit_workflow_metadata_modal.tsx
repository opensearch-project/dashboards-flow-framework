/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import * as yup from 'yup';
import { Formik, getIn, useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiSmallButtonEmpty,
  EuiSmallButton,
} from '@elastic/eui';
import {
  FETCH_ALL_QUERY,
  MAX_STRING_LENGTH,
  Workflow,
  WORKFLOW_NAME_REGEXP,
  WorkflowConfig,
  WorkflowFormValues,
  WorkflowTemplate,
} from '../../../../common';
import {
  formikToUiConfig,
  getDataSourceId,
  getInitialValue,
} from '../../../utils';
import { TextField } from '../workflow_inputs/input_fields';
import {
  AppState,
  getWorkflow,
  searchWorkflows,
  updateWorkflow,
  useAppDispatch,
} from '../../../store';

interface EditWorkflowMetadataModalProps {
  workflow?: Workflow;
  setIsModalOpen(isOpen: boolean): void;
}
/**
 * Modal to allow editing workflow metadata, like name & description.
 */
export function EditWorkflowMetadataModal(
  props: EditWorkflowMetadataModalProps
) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { values } = useFormikContext<WorkflowFormValues>();
  const { workflows } = useSelector((state: AppState) => state.workflows);

  // sub-form values/schema
  const metadataFormValues = {
    name: getInitialValue('string'),
    description: getInitialValue('string'),
  };
  const metadataFormSchema = yup.object({
    name: yup
      .string()
      .test('workflowName', 'Invalid workflow name', (name) => {
        return !(
          name === undefined ||
          name === '' ||
          name.length > 100 ||
          WORKFLOW_NAME_REGEXP.test(name) === false
        );
      })
      .test('workflowName', 'Workflow name exists', (name) => {
        return !(
          Object.values(workflows)
            .map((workflow) => workflow.name)
            .includes(name || '') && name !== props.workflow?.name
        );
      })
      .required('Required') as yup.Schema,
    desription: yup
      .string()
      .trim()
      .min(0)
      .max(MAX_STRING_LENGTH, 'Too long')
      .optional() as yup.Schema,
  }) as yup.Schema;

  // persist standalone values
  const [tempName, setTempName] = useState<string>(props.workflow?.name || '');
  const [tempDescription, setTempDescription] = useState<string>(
    props.workflow?.description || ''
  );
  const [tempErrors, setTempErrors] = useState<boolean>(false);

  // button updating state
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // On initial render: fetch all workflows. Used for preventing users from updating name
  // to an existing workflow
  useEffect(() => {
    dispatch(
      searchWorkflows({
        apiBody: FETCH_ALL_QUERY,
        dataSourceId,
      })
    );
  }, []);

  // if saving, take the updated name/description (along with any other unsaved form values)
  // and execute the update.
  async function onSave() {
    setIsUpdating(true);
    const updatedTemplate = {
      name: tempName,
      description: tempDescription,
      ui_metadata: {
        ...props.workflow?.ui_metadata,
        config: formikToUiConfig(
          values,
          props.workflow?.ui_metadata?.config as WorkflowConfig
        ),
      },
    } as WorkflowTemplate;
    await dispatch(
      updateWorkflow({
        apiBody: {
          workflowId: props.workflow?.id as string,
          workflowTemplate: updatedTemplate,
          updateFields: true,
          reprovision: false,
        },
        dataSourceId,
      })
    )
      .unwrap()
      .then(async (result) => {
        new Promise((f) => setTimeout(f, 1000)).then(async () => {
          dispatch(
            getWorkflow({
              workflowId: props.workflow?.id as string,
              dataSourceId,
            })
          );
        });
      })
      .catch((error: any) => {
        console.error('Error updating workflow: ', error);
      })
      .finally(() => {
        setIsUpdating(false);
        props.setIsModalOpen(false);
      });
  }

  return (
    <Formik
      enableReinitialize={false}
      initialValues={metadataFormValues}
      validationSchema={metadataFormSchema}
      onSubmit={(values) => {}}
      validate={(values) => {}}
    >
      {(formikProps) => {
        // override to parent form values when changes detected
        useEffect(() => {
          formikProps.setFieldValue('name', props.workflow?.name);
        }, [props.workflow?.name]);
        useEffect(() => {
          formikProps.setFieldValue('description', props.workflow?.description);
        }, [props.workflow?.description]);

        // update temp vars when form changes are detected
        useEffect(() => {
          setTempName(getIn(formikProps.values, 'name'));
        }, [getIn(formikProps.values, 'name')]);
        useEffect(() => {
          setTempDescription(getIn(formikProps.values, 'description'));
        }, [getIn(formikProps.values, 'description')]);

        // update tempErrors if errors detected
        useEffect(() => {
          setTempErrors(!isEmpty(formikProps.errors));
        }, [formikProps.errors]);

        return (
          <EuiModal
            maxWidth={false}
            style={{ width: '50vw' }}
            onClose={() => props.setIsModalOpen(false)}
          >
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                <p>Update workflow metadata</p>
              </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
              <EuiFlexGroup direction="column">
                <EuiFlexItem>
                  <TextField
                    label="Workflow name"
                    fullWidth={false}
                    fieldPath={`name`}
                    showError={true}
                  />
                </EuiFlexItem>
                <EuiFlexItem>
                  <TextField
                    label="Workflow description"
                    fullWidth={true}
                    fieldPath={`description`}
                    showError={true}
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiModalBody>
            <EuiModalFooter>
              <EuiSmallButtonEmpty
                onClick={() => props.setIsModalOpen(false)}
                color="primary"
                data-testid="closeEditMetadataButton"
              >
                Cancel
              </EuiSmallButtonEmpty>
              <EuiSmallButton
                onClick={() => {
                  formikProps
                    .submitForm()
                    .then(() => {
                      onSave();
                    })
                    .catch((err: any) => {});
                }}
                isLoading={isUpdating}
                isDisabled={tempErrors} // blocking update until valid input is given
                fill={true}
                color="primary"
                data-testid="updateEditMetadataButton"
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
