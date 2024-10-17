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
import searchStudioIcon from './icon.svg';

export const registerSearchStudioCard = (
  contentManagement: ContentManagementPluginStart,
  core: CoreStart
) => {
  const icon = (
    <EuiIcon
      size="original"
      aria-label="Design and test your search solutions with ease"
      type={searchStudioIcon}
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
          {i18n.translate('flowFrameworkDashboards.searchStudioCard.footer', {
            defaultMessage: 'Try OpenSearch Studio',
          })}
        </EuiSmallButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );

  contentManagement.registerContentProvider({
    id: 'search_studio_card',
    getContent: () => ({
      id: 'search_studio',
      kind: 'card',
      order: 20,
      title: i18n.translate('flowFrameworkDashboards.searchStudioCard.title', {
        defaultMessage: 'Design and test your search solutions with ease',
      }),
      description: i18n.translate(
        'flowFrameworkDashboards.searchStudioCard.description',
        {
          defaultMessage:
            'OpenSearch Studio is a visual editor for creating search AI flows to power advanced search and generative AI solutions.',
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
