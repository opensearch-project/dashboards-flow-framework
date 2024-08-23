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

  // reusable embedding model selector component
  function EmbeddingModelSelector() {
    return (
      <EuiCompressedFormRow
        label={'Embedding model'}
        error={'Invalid'}
        isInvalid={false}
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
    );
  }

  return (() => {
    switch (props.workflowType) {
      case WORKFLOW_TYPE.SEMANTIC_SEARCH:
      case WORKFLOW_TYPE.MULTIMODAL_SEARCH:
      case WORKFLOW_TYPE.HYBRID_SEARCH: {
        return (
          <>
            <EmbeddingModelSelector />
            <EuiSpacer size="s" />
          </>
        );
      }
      case WORKFLOW_TYPE.CUSTOM:
      case undefined:
      default: {
        return <></>;
      }
    }
  })();
}
