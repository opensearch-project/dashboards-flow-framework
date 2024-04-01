/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GroupComponent } from './group_component';

interface IngestGroupComponentProps {
  data: { label: string };
}

/**
 * A lightweight wrapper on the group component.
 * Any specific additions to ingest can be specified here.
 */
export function IngestGroupComponent(props: IngestGroupComponentProps) {
  return <GroupComponent data={props.data} />;
}
