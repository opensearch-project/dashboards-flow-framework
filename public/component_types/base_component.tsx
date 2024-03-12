/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CATEGORY, COMPONENT_CLASS } from '../utils';
import {
  IComponent,
  IComponentField,
  IComponentInput,
  IComponentOutput,
} from './interfaces';

/**
 * A base UI drag-and-drop component class.
 */
export abstract class BaseComponent implements IComponent {
  type: COMPONENT_CLASS;
  label: string;
  description: string;
  categories: COMPONENT_CATEGORY[];
  allowsCreation: boolean;
  baseClasses: COMPONENT_CLASS[];
  inputs?: IComponentInput[];
  fields?: IComponentField[];
  createFields?: IComponentField[];
  outputs?: IComponentOutput[];

  // No-op constructor. If there are general / defaults for field values, add in here.
  constructor() {}

  // Persist a standard toObj() fn that all component classes can use. This is necessary
  // so we have standard JS Object when serializing comoponent state in redux.
  toObj() {
    return Object.assign({}, this);
  }
}
