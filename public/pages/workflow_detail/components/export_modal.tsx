/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  getCharacterLimitedString,
} from '../../../../common';
import '../../../global-styles.scss';
import { ExportTemplateContent } from './export_template_content';
import { AgenticSearchApplicationContent } from './agentic_search_application_content';

interface ExportModalProps {
  workflow?: Workflow;
  setIsExportModalOpen(isOpen: boolean): void;
}

enum EXPORT_TAB {
  TEMPLATE = 'TEMPLATE',
  APPLICATION = 'APPLICATION',
}

/**
 * Modal containing all of the export options
 */
export function ExportModal(props: ExportModalProps) {
  const isAgenticSearchType =
    props.workflow?.ui_metadata?.type === WORKFLOW_TYPE.AGENTIC_SEARCH;

  const [selectedTab, setSelectedTab] = useState<EXPORT_TAB>(
    isAgenticSearchType ? EXPORT_TAB.APPLICATION : EXPORT_TAB.TEMPLATE
  );

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
          <EuiFlexGroup
            direction="column"
            gutterSize="s"
            style={{ marginTop: '-16px' }}
          >
            <EuiFlexItem grow={false}>
              <EuiTabs size="s" data-testid="agenticSearchTabs">
                <EuiTab
                  onClick={() => setSelectedTab(EXPORT_TAB.APPLICATION)}
                  isSelected={selectedTab === EXPORT_TAB.APPLICATION}
                >
                  Use in your application
                </EuiTab>
                <EuiTab
                  onClick={() => setSelectedTab(EXPORT_TAB.TEMPLATE)}
                  isSelected={selectedTab === EXPORT_TAB.TEMPLATE}
                >
                  Template
                </EuiTab>
              </EuiTabs>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              {selectedTab === EXPORT_TAB.TEMPLATE ? (
                <ExportTemplateContent workflow={props.workflow} />
              ) : (
                <AgenticSearchApplicationContent workflow={props.workflow} />
              )}
            </EuiFlexItem>
          </EuiFlexGroup>
        ) : (
          <ExportTemplateContent workflow={props.workflow} />
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
