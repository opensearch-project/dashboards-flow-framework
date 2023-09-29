/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CATEGORY } from '../utils';

/**
 * ************ Types **************************
 */

// TODO: may change some/all of these to enums later
export type BaseClass = string;
export type UIFlow = string;
export type FieldType = 'string' | 'json' | 'select';

/**
 * ************ Base interfaces ****************
 */

/**
 * Represents a single base class as an input handle for a component.
 * It may be optional. It may also accept multiples of that class.
 */
export interface IComponentInput {
  id: string;
  label: string;
  baseClass: string;
  optional: boolean;
  acceptMultiple: boolean;
}

/**
 * An input field for a component. Specifies enough configuration for the
 * UI node to render it properly within the component (show it as optional,
 * put it in advanced settings, placeholder values, etc.)
 */
export interface IComponentField {
  label: string;
  type: FieldType;
  placeholder?: string;
  optional?: boolean;
  advanced?: boolean;
}

/**
 * Represents the list of base classes as a single output handle for
 * a component.
 */
export interface IComponentOutput {
  id: string;
  label: string;
  baseClasses: BaseClass[];
}

/**
 * The base interface the components will implement.
 */
export interface IComponent {
  id: string;
  type: BaseClass;
  label: string;
  description: string;
  // will be used for grouping together in the drag-and-drop component library
  category: COMPONENT_CATEGORY;
  // determines if this component allows for new creation. this means to
  // allow a "create" option on the UI component, as well as potentially
  // include in the use case template construction ('provisioning' flow)
  allowsCreation: boolean;
  // determines if this is something that will be included in the use
  // case template construction (query or ingest flows). provisioning flow
  // is handled by the allowsCreation flag above.
  isApplicationStep: boolean;
  // the set of allowed flows this component can be drug into the workspace
  allowedFlows: UIFlow[];
  // the list of base classes that will be used in the component output
  baseClasses?: BaseClass[];
  inputs?: IComponentInput[];
  fields?: IComponentField[];
  // if the component supports creation, we will have a different set of input fields
  // the user needs to fill out
  createFields?: IComponentField[];
  outputs?: IComponentOutput[];
  // we will need some init function when the component is drug into the workspace
  init?(): Promise<any>;
}
