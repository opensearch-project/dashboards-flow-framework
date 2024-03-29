/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ResizableComponent } from './resizable_component';

interface IngestGroupComponentProps {
  data: { label: string };
}

/**
 * A lightweight wrapper on the resizable component.
 * Any specific additions to ingest can be specified here.
 */
export function IngestGroupComponent(props: IngestGroupComponentProps) {
  return <ResizableComponent data={props.data} />;
}
