/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexItem, EuiText } from '@elastic/eui';
import { Workflow } from '../../../../common';

interface PrototypeProps {
  workflow?: Workflow;
}

/**
 * The prototype page. Dedicated for testing out a launched workflow.
 * Will have default simple interfaces for common application types, such as
 * conversational chatbots.
 */
export function Prototype(props: PrototypeProps) {
  return (
    <EuiFlexItem>
      <EuiText>TODO: add prototype page</EuiText>
    </EuiFlexItem>
  );
}
