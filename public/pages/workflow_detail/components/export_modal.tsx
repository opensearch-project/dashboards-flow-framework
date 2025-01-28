/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import yaml from 'js-yaml';
import { isEmpty, toLower } from 'lodash';
import {
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiLink,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiSmallButtonEmpty,
  EuiCallOut,
  EuiSpacer,
  EuiSmallButtonGroup,
} from '@elastic/eui';
import {
  CREATE_WORKFLOW_LINK,
  Workflow,
  customStringify,
  getCharacterLimitedString,
} from '../../../../common';
import { reduceToTemplate } from '../../../utils';
import '../../../global-styles.scss';

interface ExportModalProps {
  workflow?: Workflow;
  unsavedIngestProcessors: boolean;
  unsavedSearchProcessors: boolean;
  setIsExportModalOpen(isOpen: boolean): void;
}

enum EXPORT_OPTION {
  JSON = 'JSON',
  YAML = 'YAML',
}

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

  // client-side file to be downloaded if the user so chooses. Generate a file
  // and its corresponding URL.
  const [formattedConfigHref, setFormattedConfigHref] = useState<string>('');
  useEffect(() => {
    if (!isEmpty(formattedConfig)) {
      const formattedConfigFile = new Blob([formattedConfig], {
        type: `text/${toLower(selectedOption)}`,
      });
      setFormattedConfigHref(URL.createObjectURL(formattedConfigFile));
    }
  }, [formattedConfig]);

  return (
    <EuiModal
      maxWidth={false}
      className="configuration-modal"
      onClose={() => props.setIsExportModalOpen(false)}
    >
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <p>{`Export '${getCharacterLimitedString(
            props.workflow?.name || '',
            25
          )}'`}</p>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiFlexGroup direction="column">
          {(props.unsavedIngestProcessors || props.unsavedSearchProcessors) && (
            <>
              <EuiSpacer size="s" />
              <EuiCallOut
                size="s"
                title="Unsaved configurations detected. Ensure to save and update all resources before exporting."
                iconType={'alert'}
                color="warning"
              />
            </>
          )}
          <EuiFlexItem grow={false}>
            <EuiText size="s">
              {`To build identical resources in other environments, create and provision a workflow following the below template.`}{' '}
              <EuiLink href={CREATE_WORKFLOW_LINK} target="_blank">
                Learn more
              </EuiLink>
            </EuiText>
            <EuiText
              size="s"
              color="subdued"
            >{`Note: Certain resource IDs in the template, such as model IDs, may be specific to a cluster and not function properly 
            in other clusters. Make sure to update these values before provisioning the workflow in a new cluster.`}</EuiText>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGroup direction="row" justifyContent="spaceBetween">
              <EuiFlexItem grow={false}>
                <EuiSmallButtonGroup
                  legend="Choose how to view your workflow"
                  options={[
                    {
                      id: EXPORT_OPTION.JSON,
                      label: EXPORT_OPTION.JSON,
                    },
                    {
                      id: EXPORT_OPTION.YAML,
                      label: EXPORT_OPTION.YAML,
                    },
                  ]}
                  idSelected={selectedOption}
                  onChange={(id) => setSelectedOption(id as EXPORT_OPTION)}
                  data-testid="exportDataToggleButtonGroup"
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiSmallButtonEmpty
                  iconType="download"
                  iconSide="right"
                  href={formattedConfigHref}
                  download={`${props.workflow?.name}.${toLower(
                    selectedOption
                  )}`}
                  onClick={() => {}}
                >
                  {`Download ${selectedOption} file`}
                </EuiSmallButtonEmpty>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          {props.workflow !== undefined && (
            <EuiFlexItem grow={false}>
              <EuiCodeBlock
                language={toLower(selectedOption)}
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
        <EuiSmallButtonEmpty
          onClick={() => props.setIsExportModalOpen(false)}
          data-testid="exportCloseButton"
        >
          Close
        </EuiSmallButtonEmpty>
      </EuiModalFooter>
    </EuiModal>
  );
}
