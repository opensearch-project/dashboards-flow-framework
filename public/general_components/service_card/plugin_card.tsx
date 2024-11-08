/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiSmallButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
} from '@elastic/eui';
import { i18n } from '@osd/i18n';
import { PLUGIN_ID } from '../../../common';
import { ContentManagementPluginStart } from '../../../../../src/plugins/content_management/public';
import { CoreStart } from '../../../../../src/core/public';
import pluginIcon from './icon.svg';

export const registerPluginCard = (
  contentManagement: ContentManagementPluginStart,
  core: CoreStart
) => {
  const icon = (
    <EuiIcon
      size="original"
      aria-label="Design and test your search solutions with ease"
      type={pluginIcon}
    />
  );

  const footer = (
    <EuiFlexGroup justifyContent="flexEnd">
      <EuiFlexItem grow={false}>
        <EuiSmallButton
          onClick={() => {
            core.application.navigateToApp(PLUGIN_ID);
          }}
        >
          {i18n.translate('flowFrameworkDashboards.opensearchFlowCard.footer', {
            defaultMessage: 'Try OpenSearch Flow',
          })}
        </EuiSmallButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );

  contentManagement.registerContentProvider({
    id: 'opensearch_flow_card',
    getContent: () => ({
      id: 'opensearch_flow',
      kind: 'card',
      order: 20,
      title: i18n.translate(
        'flowFrameworkDashboards.opensearchFlowCard.title',
        {
          defaultMessage: 'Design and test your search solutions with ease',
        }
      ),
      description: i18n.translate(
        'flowFrameworkDashboards.opensearchFlowCard.description',
        {
          defaultMessage:
            'OpenSearch Flow is a visual editor for creating search AI flows to power advanced search and generative AI solutions.',
        }
      ),
      getIcon: () => icon,
      cardProps: {
        children: footer,
        layout: 'horizontal',
      },
    }),
    getTargetArea: () => 'search_overview/config_evaluate_search',
  });
};
