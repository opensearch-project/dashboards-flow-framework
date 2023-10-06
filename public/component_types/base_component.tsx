/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * A base component class.
 */
export abstract class BaseComponent {
  // Persist a standard toObj() fn that all component classes can use. This is necessary
  // so we have standard JS Object when serializing comoponent state in redux.
  toObj() {
    return Object.assign({}, this);
  }
}
