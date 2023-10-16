/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormikValues } from 'formik';
import { ObjectSchema } from 'yup';
import { COMPONENT_CATEGORY, COMPONENT_CLASS } from '../utils';

/**
 * ************ Types *************************
 */
export type UIFlow = string;
export type FieldType = 'string' | 'json' | 'select';
// TODO: this may expand to more types in the future. Formik supports 'any' so we can too.
// For now, limiting scope to expected types.
export type FieldValue = string | {};
export type ComponentFormValues = FormikValues;
export type WorkspaceFormValues = {
  [componentId: string]: ComponentFormValues;
};
export type WorkspaceSchemaObj = {
  [componentId: string]: ObjectSchema<any, any, any>;
};
export type WorkspaceSchema = ObjectSchema<WorkspaceSchemaObj>;

/**
 * Represents a single base class as an input handle for a component.
 * It may be optional. It may also accept multiples of that class.
 */
export interface IComponentInput {
  id: string;
  label: string;
  baseClass: COMPONENT_CLASS;
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
  name: string;
  value?: FieldValue;
  placeholder?: string;
  optional?: boolean;
  advanced?: boolean;
}

/**
 * Represents the list of base classes as a single output handle for
 * a component.
 */
export interface IComponentOutput {
  label: string;
  baseClasses: COMPONENT_CLASS[];
}

/**
 * The base interface the components will implement.
 */
export interface IComponent {
  type: COMPONENT_CLASS;
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
  baseClasses?: COMPONENT_CLASS[];
  inputs?: IComponentInput[];
  fields?: IComponentField[];
  // if the component supports creation, we will have a different set of input fields
  // the user needs to fill out
  createFields?: IComponentField[];
  outputs?: IComponentOutput[];
}

/**
 * We need to include some extra instance-specific data to the ReactFlow component
 * to perform extra functionality, such as deleting the node from the ReactFlowInstance.
 */
export interface IComponentData extends IComponent {
  id: string;
}
