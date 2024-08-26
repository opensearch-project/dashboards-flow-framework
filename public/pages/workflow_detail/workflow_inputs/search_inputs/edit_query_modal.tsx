/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFormikContext } from 'formik';
import {
  EuiSmallButton,
  EuiButton,
  EuiContextMenu,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiPopover,
  EuiSpacer,
} from '@elastic/eui';
import { JsonField } from '../input_fields';
import {
  QUERY_PRESETS,
  QueryPreset,
  WorkflowFormValues,
} from '../../../../../common';

interface EditQueryModalProps {
  queryFieldPath: string;
  setModalOpen(isOpen: boolean): void;
}

/**
 * Basic modal for configuring a query. Provides a dropdown to select from
 * a set of pre-defined queries targeted for different use cases.
 */
export function EditQueryModal(props: EditQueryModalProps) {
  // Form state
  const { setFieldValue } = useFormikContext<WorkflowFormValues>();

  // popover state
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);

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
        <EuiPopover
          button={
            <EuiSmallButton onClick={() => setPopoverOpen(!popoverOpen)}>
              Choose from a preset
            </EuiSmallButton>
          }
          isOpen={popoverOpen}
          closePopover={() => setPopoverOpen(false)}
          anchorPosition="downLeft"
        >
          <EuiContextMenu
            initialPanelId={0}
            panels={[
              {
                id: 0,
                items: QUERY_PRESETS.map((preset: QueryPreset) => ({
                  name: preset.name,
                  onClick: () => {
                    setFieldValue(props.queryFieldPath, preset.query);
                    setPopoverOpen(false);
                  },
                  size: 'full',
                })),
              },
            ]}
          />
        </EuiPopover>
        <EuiSpacer size="s" />
        <JsonField
          label="Query"
          fieldPath={props.queryFieldPath}
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
