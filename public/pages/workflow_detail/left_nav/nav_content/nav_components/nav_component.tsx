/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { isEmpty } from 'lodash';
import {
  EuiCard,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiText,
} from '@elastic/eui';
import { LEFT_NAV_SELECTED_STYLE } from '../../../../../../common';

interface NavComponentProps {
  title?: string;
  description?: string;
  icon?: string;
  body?: any;
  onClick?: () => void;
  isDisabled?: boolean;
  isSelected?: boolean;
  isError?: boolean;
}

/**
 * General, reusable component used for creating clickable components within
 * the LeftNav navigation panel.
 */
export function NavComponent(props: NavComponentProps) {
  return (
    <EuiCard
      layout="horizontal"
      icon={
        props.icon ? (
          <EuiIcon
            size="l"
            type={props.icon}
            color={props.isError ? 'danger' : undefined}
          />
        ) : undefined
      }
      style={props.isSelected ? { border: LEFT_NAV_SELECTED_STYLE } : {}}
      titleSize="xs"
      title={
        <EuiFlexGroup direction="row" gutterSize="m">
          {!isEmpty(props.title) && (
            <EuiFlexItem grow={false}>
              <EuiText color={props.isError ? 'danger' : undefined}>
                {props.title}
              </EuiText>
            </EuiFlexItem>
          )}
          {props.isError && (
            <EuiFlexItem grow={false} style={{ marginTop: '14px' }}>
              <EuiIcon type="alert" color="danger" />
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      }
      description={
        !isEmpty(props.description) ? (
          <EuiText
            size="xs"
            color="subdued"
            style={{ marginTop: '-4px', marginBottom: '-4px' }}
          >
            {props.description}
          </EuiText>
        ) : undefined
      }
      onClick={props.onClick ?? undefined}
      isDisabled={props.isDisabled ?? false}
    >
      {props.body}
    </EuiCard>
  );
}
