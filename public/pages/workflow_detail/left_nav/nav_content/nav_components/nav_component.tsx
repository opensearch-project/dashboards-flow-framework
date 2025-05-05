/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiCard, EuiIcon } from '@elastic/eui';
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
}

/**
 * The base left navigation component. Used as a lightweight preview of the ingest and search
 * flows, as well as a way to click and navigate to the individual components of the flows.
 */
export function NavComponent(props: NavComponentProps) {
  return (
    <EuiCard
      layout="horizontal"
      icon={props.icon ? <EuiIcon size="l" type={props.icon} /> : undefined}
      titleSize="xs"
      title={props.title}
      description={props.description || ''}
      onClick={props.onClick ?? undefined}
      isDisabled={props.isDisabled ?? false}
    >
      {props.body}
    </EuiCard>
  );
}
