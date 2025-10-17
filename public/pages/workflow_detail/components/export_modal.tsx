/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import yaml from 'js-yaml';
import { isEmpty, toLower } from 'lodash';
import {
  EuiFlexGroup,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiSmallButtonEmpty,
  EuiTabs,
  EuiTab,
  EuiFlexItem,
} from '@elastic/eui';
import {
  Workflow,
  WORKFLOW_TYPE,
  customStringify,
  getCharacterLimitedString,
} from '../../../../common';
import { reduceToTemplate } from '../../../utils';
import '../../../global-styles.scss';
import {
  EXPORT_OPTION,
  ExportTemplateContent,
} from './export_template_content';
import { ExportAgenticSearchContent } from './export_agentic_search_content';

interface ExportModalProps {
  workflow?: Workflow;
  setIsExportModalOpen(isOpen: boolean): void;
}

enum EXPORT_TAB {
  TEMPLATE = 'TEMPLATE',
  AGENTIC = 'AGENTIC',
}

/**
 * Modal containing all of the export options
 */
export function ExportModal(props: ExportModalProps) {
  // format type state
  const [selectedOption, setSelectedOption] = useState<EXPORT_OPTION>(
    EXPORT_OPTION.JSON
  );

  const isAgenticSearchType =
    props.workflow?.ui_metadata?.type === WORKFLOW_TYPE.AGENTIC_SEARCH;

  const [selectedTab, setSelectedTab] = useState<EXPORT_TAB>(
    isAgenticSearchType ? EXPORT_TAB.AGENTIC : EXPORT_TAB.TEMPLATE
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
        {isAgenticSearchType ? (
          <EuiFlexGroup direction="column">
            <EuiFlexItem>
              <EuiTabs size="s">
                <EuiTab
                  onClick={() => setSelectedTab(EXPORT_TAB.AGENTIC)}
                  isSelected={selectedTab === EXPORT_TAB.AGENTIC}
                >
                  Agentic search
                </EuiTab>
                <EuiTab
                  onClick={() => setSelectedTab(EXPORT_TAB.TEMPLATE)}
                  isSelected={selectedTab === EXPORT_TAB.TEMPLATE}
                >
                  Template
                </EuiTab>
              </EuiTabs>
            </EuiFlexItem>

            {selectedTab === EXPORT_TAB.TEMPLATE ? (
              <ExportTemplateContent
                workflow={props.workflow}
                formattedConfig={formattedConfig}
                formattedConfigHref={formattedConfigHref}
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
              />
            ) : (
              <ExportAgenticSearchContent />
            )}
          </EuiFlexGroup>
        ) : (
          <ExportTemplateContent
            workflow={props.workflow}
            formattedConfig={formattedConfig}
            formattedConfigHref={formattedConfigHref}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
          />
        )}
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
