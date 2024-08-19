/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import yaml from 'js-yaml';
import {
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCompressedRadioGroup,
  EuiText,
  EuiLink,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiSmallButtonEmpty,
} from '@elastic/eui';
import {
  CREATE_WORKFLOW_LINK,
  Workflow,
  customStringify,
  getCharacterLimitedString,
} from '../../../../common';
import { reduceToTemplate } from '../../../utils';

interface ExportModalProps {
  workflow?: Workflow;
  setIsExportModalOpen(isOpen: boolean): void;
}

enum EXPORT_OPTION {
  JSON = 'json',
  YAML = 'yaml',
}

const exportOptions = [
  {
    id: EXPORT_OPTION.JSON,
    label: 'JSON',
  },
  {
    id: EXPORT_OPTION.YAML,
    label: 'YAML',
  },
];

/**
 * Modal containing all of the export options
 */
export function ExportModal(props: ExportModalProps) {
  // format type state
  const [selectedOption, setSelectedOption] = useState<EXPORT_OPTION>(
    EXPORT_OPTION.JSON
  );

  // formatted string state
  const [formattedConfig, setFormattedConfig] = useState<string>('');
  useEffect(() => {
    if (props.workflow) {
      const workflowTemplate = reduceToTemplate(props.workflow);
      if (selectedOption === EXPORT_OPTION.JSON) {
        setFormattedConfig(customStringify(workflowTemplate));
      } else if (selectedOption === EXPORT_OPTION.YAML) {
        setFormattedConfig(yaml.dump(workflowTemplate));
      }
    }
  }, [props.workflow, selectedOption]);

  return (
    <EuiModal onClose={() => props.setIsExportModalOpen(false)}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <p>{`Export ${getCharacterLimitedString(
            props.workflow?.name || '',
            25
          )}`}</p>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiFlexGroup direction="column">
          <EuiFlexItem grow={false}>
            <EuiText>
              Copy the below workflow templates to use in other clusters.
            </EuiText>
            <EuiLink href={CREATE_WORKFLOW_LINK} target="_blank">
              Learn more
            </EuiLink>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiCompressedRadioGroup
              options={exportOptions}
              idSelected={selectedOption}
              onChange={(option) => {
                setSelectedOption(option as EXPORT_OPTION);
              }}
            />
          </EuiFlexItem>
          {props.workflow !== undefined && (
            <EuiFlexItem grow={false}>
              <EuiCodeBlock
                language={selectedOption}
                fontSize="m"
                isCopyable={true}
              >
                {formattedConfig}
              </EuiCodeBlock>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiSmallButtonEmpty onClick={() => props.setIsExportModalOpen(false)}>
          Close
        </EuiSmallButtonEmpty>
      </EuiModalFooter>
    </EuiModal>
  );
}
