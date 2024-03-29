/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ResizableComponent } from './resizable_component';

interface SearchGroupComponentProps {
  data: { label: string };
}

/**
 * A lightweight wrapper on the resizable component.
 * Any specific additions to search can be specified here.
 */
export function SearchGroupComponent(props: SearchGroupComponentProps) {
  return <ResizableComponent data={props.data} />;
}
