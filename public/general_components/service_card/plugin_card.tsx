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
  EuiTitle,
} from '@elastic/eui';
import { i18n } from '@osd/i18n';
import { PLUGIN_ID } from '../../../common';
import { ContentManagementPluginStart } from '../../../../../src/plugins/content_management/public';
import { CoreStart } from '../../../../../src/core/public';
import pluginIcon from './icon.svg';

const HEADER_TEXT = 'Design and test your search solutions with ease';
const DESCRIPTION_TEXT =
  'OpenSearch Flow is a visual editor for creating search AI flows to power advanced search and generative AI solutions.';

export const registerPluginCard = (
  contentManagement: ContentManagementPluginStart,
  core: CoreStart
) => {
  const icon = (
    <EuiIcon size="original" aria-label={HEADER_TEXT} type={pluginIcon} />
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
      getTitle: () => {
        return (
          <EuiFlexGroup direction="row" gutterSize="xs">
            <EuiFlexItem grow={false}>
              <EuiTitle size="s">
                <h3>
                  {i18n.translate(
                    'flowFrameworkDashboards.opensearchFlowCard.title',
                    {
                      defaultMessage: HEADER_TEXT,
                    }
                  )}
                </h3>
              </EuiTitle>
            </EuiFlexItem>
          </EuiFlexGroup>
        );
      },
      description: i18n.translate(
        'flowFrameworkDashboards.opensearchFlowCard.description',
        {
          defaultMessage: DESCRIPTION_TEXT,
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
