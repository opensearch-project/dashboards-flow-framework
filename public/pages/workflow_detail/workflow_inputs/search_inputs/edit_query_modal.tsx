/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFormikContext } from 'formik';
import {
  EuiButton,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
  EuiSuperSelect,
  EuiSuperSelectOption,
  EuiText,
} from '@elastic/eui';
import { JsonField } from '../input_fields';
import { WorkflowFormValues, customStringify } from '../../../../../common';

interface EditQueryModalProps {
  setModalOpen(isOpen: boolean): void;
}

type QueryPreset = {
  name: string;
  query: string;
};

const QUERY_PRESETS = [
  {
    name: 'Semantic search',
    query: customStringify({
      _source: {
        excludes: [`{{vector_field}}`],
      },
      query: {
        neural: {
          [`{{vector_field}}`]: {
            query_text: `{{query_text}}`,
            model_id: `{{model_id}}`,
            k: 100,
          },
        },
      },
    }),
  },
] as QueryPreset[];

/**
 * Specialized component to render the text chunking ingest processor. The list of optional
 * params we display is dependent on the source algorithm that is chosen. Internally, we persist
 * all of the params, but only choose the relevant ones when constructing the final ingest processor
 * template. This is to minimize the amount of ui config / form / schema updates we would need
 * to do if we only persisted the subset of optional params specific to the currently-chosen algorithm.
 */
export function EditQueryModal(props: EditQueryModalProps) {
  // Form state
  const { setFieldValue } = useFormikContext<WorkflowFormValues>();

  // selected preset state
  const [queryPreset, setQueryPreset] = useState<string | undefined>(undefined);

  return (
    <EuiModal
      onClose={() => props.setModalOpen(false)}
      style={{ width: '70vw' }}
    >
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <p>{`Edit query`}</p>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiText color="subdued">
          Start with a preset or enter manually.
        </EuiText>{' '}
        <EuiSpacer size="s" />
        <EuiSuperSelect
          options={QUERY_PRESETS.map(
            (preset: QueryPreset) =>
              ({
                value: preset.name,
                inputDisplay: (
                  <>
                    <EuiText size="s">{preset.name}</EuiText>
                  </>
                ),
                dropdownDisplay: <EuiText size="s">{preset.name}</EuiText>,
                disabled: false,
              } as EuiSuperSelectOption<string>)
          )}
          valueOfSelected={queryPreset || ''}
          onChange={(option: string) => {
            setQueryPreset(option);
            setFieldValue(
              'search.request',
              QUERY_PRESETS.find((preset) => preset.name === option)?.query
            );
          }}
          isInvalid={false}
        />
        <EuiSpacer size="s" />
        <JsonField
          label="Query"
          fieldPath={'search.request'}
          editorHeight="25vh"
          readOnly={false}
        />
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButton
          onClick={() => props.setModalOpen(false)}
          fill={false}
          color="primary"
        >
          Close
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
