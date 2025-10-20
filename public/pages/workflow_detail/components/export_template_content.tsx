/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { isEmpty, toLower } from 'lodash';
import {
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiLink,
  EuiSmallButtonGroup,
  EuiSmallButtonEmpty,
} from '@elastic/eui';
import {
  CREATE_WORKFLOW_LINK,
  PLUGIN_NAME,
  Workflow,
} from '../../../../common';

export enum EXPORT_OPTION {
  JSON = 'JSON',
  YAML = 'YAML',
}

interface ExportTemplateContentProps {
  workflow?: Workflow;
  formattedConfig: string;
  formattedConfigHref: string;
  selectedOption: EXPORT_OPTION;
  setSelectedOption: (option: EXPORT_OPTION) => void;
}

/**
 * Static content for general template exporting
 */
export function ExportTemplateContent({
  workflow,
  formattedConfig,
  formattedConfigHref,
  selectedOption,
  setSelectedOption,
}: ExportTemplateContentProps) {
  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>
        {isEmpty(workflow?.workflows) ? (
          <EuiText size="s">{`Download the below workflow template to save your search configuration. Import on another cluster using ${PLUGIN_NAME}
           to share identical configurations across your environments.`}</EuiText>
        ) : (
          <EuiText size="s">
            {`To build identical resources in other environments, create and provision a workflow following the below template. `}
            <EuiLink href={CREATE_WORKFLOW_LINK} target="_blank">
              Learn more
            </EuiLink>
          </EuiText>
        )}
        <EuiFlexItem grow={false}>
          <EuiText size="s" color="subdued">
            <i>{`Note: Certain resource IDs in the template, such as model IDs, may be specific to a cluster and not function properly
        in other clusters. Make sure to update these values before importing the workflow in a new cluster.`}</i>
          </EuiText>
        </EuiFlexItem>
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
              download={`${workflow?.name}.${toLower(selectedOption)}`}
              onClick={() => {}}
            >
              {`Download ${selectedOption} file`}
            </EuiSmallButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
      {workflow !== undefined && (
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
  );
}
