/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GroupComponent } from './group_component';

interface SearchGroupComponentProps {
  data: { label: string };
}

/**
 * A lightweight wrapper on the group component.
 * Any specific additions to search can be specified here.
 */
export function SearchGroupComponent(props: SearchGroupComponentProps) {
  return <GroupComponent data={props.data} />;
}
