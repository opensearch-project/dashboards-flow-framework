/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  EuiCompressedFormRow,
  EuiText,
  EuiSpacer,
  EuiCompressedSuperSelect,
  EuiSuperSelectOption,
  EuiAccordion,
  EuiCompressedFieldText,
  EuiCompressedFieldNumber,
} from '@elastic/eui';
import {
  MODEL_STATE,
  Model,
  QuickConfigureFields,
  WORKFLOW_TYPE,
} from '../../../../common';
import { AppState } from '../../../store';

interface QuickConfigureInputsProps {
  workflowType?: WORKFLOW_TYPE;
  setFields(fields: QuickConfigureFields): void;
}

// Dynamic component to allow optional input configuration fields for different use cases.
// Hooks back to the parent component with such field values
export function QuickConfigureInputs(props: QuickConfigureInputsProps) {
  const models = useSelector((state: AppState) => state.models.models);

  // Deployed models state
  const [deployedModels, setDeployedModels] = useState<Model[]>([]);

  // Hook to update available deployed models
  useEffect(() => {
    if (models) {
      setDeployedModels(
        Object.values(models).filter(
          (model) => model.state === MODEL_STATE.DEPLOYED
        )
      );
    }
  }, [models]);

  // Local field values state
  const [fieldValues, setFieldValues] = useState<QuickConfigureFields>({});

  // Hook to update the parent field values
  useEffect(() => {
    props.setFields(fieldValues);
  }, [fieldValues]);

  return (
    <>
      {(props.workflowType === WORKFLOW_TYPE.SEMANTIC_SEARCH ||
        props.workflowType === WORKFLOW_TYPE.MULTIMODAL_SEARCH ||
        props.workflowType === WORKFLOW_TYPE.HYBRID_SEARCH) && (
        <>
          <EuiSpacer size="m" />
          <EuiAccordion
            id="optionalConfiguration"
            buttonContent="Optional configuration"
            initialIsOpen={true}
          >
            <EuiSpacer size="m" />
            <EuiCompressedFormRow
              label={'Embedding model'}
              isInvalid={false}
              helpText="The model to generate embeddings"
            >
              <EuiCompressedSuperSelect
                options={deployedModels.map(
                  (option) =>
                    ({
                      value: option.id,
                      inputDisplay: (
                        <>
                          <EuiText size="s">{option.name}</EuiText>
                        </>
                      ),
                      dropdownDisplay: (
                        <>
                          <EuiText size="s">{option.name}</EuiText>
                          <EuiText size="xs" color="subdued">
                            Deployed
                          </EuiText>
                          <EuiText size="xs" color="subdued">
                            {option.algorithm}
                          </EuiText>
                        </>
                      ),
                      disabled: false,
                    } as EuiSuperSelectOption<string>)
                )}
                valueOfSelected={fieldValues?.embeddingModelId || ''}
                onChange={(option: string) => {
                  setFieldValues({
                    ...fieldValues,
                    embeddingModelId: option,
                  });
                }}
                isInvalid={false}
              />
            </EuiCompressedFormRow>
            <EuiSpacer size="s" />
            <EuiCompressedFormRow
              label={'Text field'}
              isInvalid={false}
              helpText="The name of the document field containing plaintext"
            >
              <EuiCompressedFieldText
                value={fieldValues?.textField || ''}
                onChange={(e) => {
                  setFieldValues({
                    ...fieldValues,
                    textField: e.target.value,
                  });
                }}
              />
            </EuiCompressedFormRow>
            <EuiSpacer size="s" />
            <EuiCompressedFormRow
              label={'Vector field'}
              isInvalid={false}
              helpText="The name of the document field containing the vector embedding"
            >
              <EuiCompressedFieldText
                value={fieldValues?.vectorField || ''}
                onChange={(e) => {
                  setFieldValues({
                    ...fieldValues,
                    vectorField: e.target.value,
                  });
                }}
              />
            </EuiCompressedFormRow>
            <EuiSpacer size="s" />
            <EuiCompressedFormRow
              label={'Embedding length'}
              isInvalid={false}
              helpText="The length / dimension of the generated vector embeddings"
            >
              <EuiCompressedFieldNumber
                value={fieldValues?.embeddingLength || ''}
                onChange={(e) => {
                  setFieldValues({
                    ...fieldValues,
                    embeddingLength: Number(e.target.value),
                  });
                }}
              />
            </EuiCompressedFormRow>
          </EuiAccordion>
        </>
      )}
    </>
  );
}
