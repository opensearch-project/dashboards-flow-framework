/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexItem, EuiSpacer } from '@elastic/eui';
import { TextField, ModelField, MapField } from './input_fields';
import { IConfig } from '../../../../common';

/**
 * A helper component to format all of the input fields for a component. Dynamically
 * render based on the input type.
 */

interface ConfigFieldListProps {
  config: IConfig;
  baseConfigPath: string; // the base path of the nested config, if applicable. e.g., 'ingest.enrich'
  onFormChange: () => void;
}

const CONFIG_FIELD_SPACER_SIZE = 'm';

export function ConfigFieldList(props: ConfigFieldListProps) {
  const configFields = props.config.fields || [];
  const configId = props.config.id;
  return (
    <EuiFlexItem grow={false}>
      {configFields.map((field, idx) => {
        let el;
        switch (field.type) {
          // case 'string': {
          //   el = (
          //     <EuiFlexItem key={idx}>
          //       <TextField
          //         field={field}
          //         fieldPath={`${props.baseConfigPath}.${configId}.${field.id}`}
          //         onFormChange={props.onFormChange}
          //       />
          //       <EuiSpacer size={CONFIG_FIELD_SPACER_SIZE} />
          //     </EuiFlexItem>
          //   );
          //   break;
          // }
          case 'model': {
            el = (
              <EuiFlexItem key={idx}>
                <ModelField
                  field={field}
                  fieldPath={`${props.baseConfigPath}.${configId}.${field.id}`}
                  onFormChange={props.onFormChange}
                />
                <EuiSpacer size={CONFIG_FIELD_SPACER_SIZE} />
              </EuiFlexItem>
            );
            break;
          }
        }
        return el;
      })}
    </EuiFlexItem>
  );
}
