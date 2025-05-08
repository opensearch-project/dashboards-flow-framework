/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiCard,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiText,
} from '@elastic/eui';
/**
 * Base component for rendering processor form inputs based on the processor type
 */

interface NavComponentProps {
  title: string;
  description?: string;
  icon?: string;
  body?: any;
  onClick?: () => void;
  isDisabled?: boolean;
  isSelected?: boolean;
  isError?: boolean;
}

/**
 * The base left navigation component. Used as a lightweight preview of the ingest and search
 * flows, as well as a way to click and navigate to the individual components of the flows.
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
      titleSize="xs"
      title={
        <EuiFlexGroup direction="row" gutterSize="m">
          <EuiFlexItem grow={false}>
            <EuiText color={props.isError ? 'danger' : undefined}>
              {props.title}
            </EuiText>
          </EuiFlexItem>
          {props.isError && (
            <EuiFlexItem grow={false} style={{ marginTop: '14px' }}>
              <EuiIcon type="alert" color="danger" />
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      }
      description={props.description || ''}
      onClick={props.onClick ?? undefined}
      isDisabled={props.isDisabled ?? false}
      selectable={
        props.isSelected
          ? {
              isSelected: true,
            }
          : undefined
      }
    >
      {props.body}
    </EuiCard>
  );
}
