/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { getIn, useFormikContext } from 'formik';
import { EuiButton, EuiRadioGroup, EuiSpacer } from '@elastic/eui';
import {
  WorkspaceFormValues,
  IProcessorConfig,
  IConfigField,
} from '../../../../../common';
import { MapField, ModelField } from '../input_fields';
import { isEmpty } from 'lodash';
import { AdvancedTransformModal } from './advanced_transform_modal';

interface MLProcessorInputsProps {
  config: IProcessorConfig;
  baseConfigPath: string; // the base path of the nested config, if applicable. e.g., 'ingest.enrich'
  onFormChange: () => void;
}

enum TRANSFORM_OPTION {
  SIMPLE = 'SIMPLE',
  ADVANCED = 'ADVANCED',
}

/**
 * Component to render ML processor inputs. Offers a simple and advanced flow for configuring data transforms
 * before and after executing an ML inference request
 */
export function MLProcessorInputs(props: MLProcessorInputsProps) {
  const { values } = useFormikContext<WorkspaceFormValues>();

  // extracting field info from the ML processor config
  // TODO: have a better mechanism for guaranteeing the expected fields/config instead of hardcoding them here
  const modelField = props.config.fields.find(
    (field) => field.type === 'model'
  ) as IConfigField;
  const modelFieldPath = `${props.baseConfigPath}.${props.config.id}.${modelField.id}`;
  const inputMapField = props.config.fields.find(
    (field) => field.id === 'inputMap'
  ) as IConfigField;
  const inputMapFieldPath = `${props.baseConfigPath}.${props.config.id}.${inputMapField.id}`;
  const outputMapField = props.config.fields.find(
    (field) => field.id === 'outputMap'
  ) as IConfigField;
  const outputMapFieldPath = `${props.baseConfigPath}.${props.config.id}.${outputMapField.id}`;

  // transform option state
  const [selectedOption, setSelectedOption] = useState<TRANSFORM_OPTION>(
    TRANSFORM_OPTION.SIMPLE
  );

  // advanced transform modal state
  const [
    isAdvancedTransformModalOpen,
    setIsAdvancedTransformModalOpen,
  ] = useState<boolean>(false);

  return (
    <>
      {isAdvancedTransformModalOpen && (
        <AdvancedTransformModal
          onClose={() => setIsAdvancedTransformModalOpen(false)}
          onConfirm={() => {
            console.log('saving transform configuration...');
            setIsAdvancedTransformModalOpen(false);
          }}
        />
      )}
      <ModelField
        field={modelField}
        fieldPath={modelFieldPath}
        onFormChange={props.onFormChange}
      />
      {!isEmpty(getIn(values, modelFieldPath)?.id) && (
        <>
          <EuiSpacer size="s" />
          <EuiRadioGroup
            options={[
              {
                id: TRANSFORM_OPTION.SIMPLE,
                label: 'Simple',
              },
              {
                id: TRANSFORM_OPTION.ADVANCED,
                label: 'Advanced',
              },
            ]}
            idSelected={selectedOption}
            onChange={(option) => {
              setSelectedOption(option as TRANSFORM_OPTION);
            }}
          />
          {selectedOption === TRANSFORM_OPTION.SIMPLE && (
            <>
              <EuiSpacer size="s" />
              <MapField
                field={inputMapField}
                fieldPath={inputMapFieldPath}
                label="Input map"
                helpText={`An array specifying how to map fields from the ingested document to the model’s input.`}
                helpLink={
                  'https://opensearch.org/docs/latest/ingest-pipelines/processors/ml-inference/#configuration-parameters'
                }
                onFormChange={props.onFormChange}
              />
              <EuiSpacer size="s" />
              <MapField
                field={outputMapField}
                fieldPath={outputMapFieldPath}
                label="Output map"
                helpText={`An array specifying how to map the model’s output to new fields.`}
                helpLink={
                  'https://opensearch.org/docs/latest/ingest-pipelines/processors/ml-inference/#configuration-parameters'
                }
                onFormChange={props.onFormChange}
              />
            </>
          )}
          {selectedOption === TRANSFORM_OPTION.ADVANCED && (
            <>
              <EuiSpacer size="s" />
              <EuiButton
                style={{ width: '150px' }}
                fill={false}
                onClick={() => {
                  setIsAdvancedTransformModalOpen(true);
                }}
              >
                Configure
              </EuiButton>
            </>
          )}
        </>
      )}
    </>
  );
}
