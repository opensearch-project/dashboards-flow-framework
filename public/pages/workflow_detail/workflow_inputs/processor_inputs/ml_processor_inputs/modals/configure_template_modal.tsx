/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFormikContext, getIn } from 'formik';
import {
  EuiCodeEditor,
  EuiFlexGroup,
  EuiFlexItem,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSmallButton,
  EuiSpacer,
  EuiText,
  EuiPopover,
  EuiContextMenu,
} from '@elastic/eui';
import {
  ModelInterface,
  PROMPT_PRESETS,
  PromptPreset,
  WorkflowFormValues,
} from '../../../../../../../common';

interface ConfigureTemplateModalProps {
  fieldPath: string;
  modelInterface: ModelInterface | undefined;
  onClose: () => void;
}

/**
 * A modal to configure a prompt template. Can manually configure, include placeholder values
 * using other model inputs, and/or select from a presets library.
 */
export function ConfigureTemplateModal(props: ConfigureTemplateModalProps) {
  const { values, setFieldValue, setFieldTouched } = useFormikContext<
    WorkflowFormValues
  >();

  // popover states
  const [presetsPopoverOpen, setPresetsPopoverOpen] = useState<boolean>(false);

  return (
    <EuiModal onClose={props.onClose} style={{ width: '70vw' }}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <p>{`Configure template`}</p>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody style={{ height: '40vh' }}>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <>
              <EuiSpacer size="s" />
              <EuiPopover
                button={
                  <EuiSmallButton
                    onClick={() => setPresetsPopoverOpen(!presetsPopoverOpen)}
                    iconSide="right"
                    iconType="arrowDown"
                  >
                    Choose from a preset
                  </EuiSmallButton>
                }
                isOpen={presetsPopoverOpen}
                closePopover={() => setPresetsPopoverOpen(false)}
                anchorPosition="downLeft"
              >
                <EuiContextMenu
                  size="s"
                  initialPanelId={0}
                  panels={[
                    {
                      id: 0,
                      items: PROMPT_PRESETS.map((preset: PromptPreset) => ({
                        name: preset.name,
                        onClick: () => {
                          try {
                            setFieldValue(props.fieldPath, preset.prompt);
                          } catch {}
                          setFieldTouched(props.fieldPath, true);
                          setPresetsPopoverOpen(false);
                        },
                      })),
                    },
                  ]}
                />
              </EuiPopover>
              <EuiSpacer size="m" />
              <EuiText size="s">Prompt</EuiText>
              <EuiSpacer size="s" />
              <EuiCodeEditor
                mode="json"
                theme="textmate"
                width="100%"
                height="15vh"
                value={getIn(values, props.fieldPath)}
                readOnly={false}
                setOptions={{
                  fontSize: '12px',
                  autoScrollEditorIntoView: true,
                  showLineNumbers: false,
                  showGutter: false,
                  showPrintMargin: false,
                  wrap: true,
                }}
                tabSize={2}
                onChange={(value) => setFieldValue(props.fieldPath, value)}
                onBlur={(e) => {
                  setFieldTouched(props.fieldPath);
                }}
              />
            </>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiSmallButton onClick={props.onClose} fill={false} color="primary">
          Close
        </EuiSmallButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
