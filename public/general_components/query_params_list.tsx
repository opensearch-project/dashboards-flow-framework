/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { get } from 'lodash';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiFieldText,
  EuiComboBox,
  EuiCompressedFilePicker,
} from '@elastic/eui';
import { QueryParam, QueryParamType } from '../../common';

interface QueryParamsListProps {
  queryParams: QueryParam[];
  setQueryParams: (params: QueryParam[]) => void;
}

// The keys will be more static in general. Give more space for values where users
// will typically be writing out more complex transforms/configuration (in the case of ML inference processors).
const KEY_FLEX_RATIO = 3;
const TYPE_FLEX_RATIO = 2;
const VALUE_FLEX_RATIO = 5;

const OPTIONS = [
  {
    label: 'Text' as QueryParamType,
  },
  {
    label: 'Binary' as QueryParamType,
  },
];

/**
 * Basic, reusable component for displaying a list of query parameters, and allowing
 * users to freely enter values for each.
 */
export function QueryParamsList(props: QueryParamsListProps) {
  return (
    <>
      {props.queryParams?.length > 0 && (
        <EuiFlexItem grow={false}>
          <EuiFlexGroup direction="column" gutterSize="xs">
            <EuiFlexItem grow={false}>
              <EuiFlexGroup direction="row" gutterSize="s">
                <EuiFlexItem grow={KEY_FLEX_RATIO}>
                  <EuiText size="s" color="subdued">
                    Parameter
                  </EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={TYPE_FLEX_RATIO}>
                  <EuiText size="s" color="subdued">
                    Type
                  </EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={VALUE_FLEX_RATIO}>
                  <EuiText size="s" color="subdued">
                    Value
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
            {props.queryParams.map((queryParam, idx) => {
              return (
                <EuiFlexItem grow={false} key={idx}>
                  <EuiFlexGroup direction="row" gutterSize="s">
                    <EuiFlexItem grow={KEY_FLEX_RATIO}>
                      <EuiText size="s" style={{ paddingTop: '4px' }}>
                        {queryParam.name}
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={TYPE_FLEX_RATIO}>
                      <EuiComboBox
                        fullWidth={true}
                        compressed={true}
                        placeholder={`Type`}
                        singleSelection={{ asPlainText: true }}
                        isClearable={false}
                        options={OPTIONS}
                        selectedOptions={[{ label: queryParam.type || 'Text' }]}
                        onChange={(options) => {
                          props.setQueryParams(
                            props.queryParams.map((qp, i) =>
                              i === idx
                                ? { ...qp, type: get(options, '0.label') }
                                : qp
                            )
                          );
                        }}
                      />
                    </EuiFlexItem>
                    <EuiFlexItem grow={VALUE_FLEX_RATIO}>
                      {queryParam.type === 'Binary' ? (
                        // For binary filetypes, accept images
                        <EuiCompressedFilePicker
                          accept="image/*"
                          multiple={false}
                          initialPromptText="Select or drag and drop an image"
                          onChange={(files) => {
                            if (files && files.length > 0) {
                              const fileReader = new FileReader();
                              fileReader.onload = (e) => {
                                try {
                                  const binaryData = e.target?.result as string;
                                  const base64Str = binaryData.split(',')[1];
                                  props.setQueryParams(
                                    props.queryParams.map((qp, i) =>
                                      i === idx
                                        ? { ...qp, value: base64Str }
                                        : qp
                                    )
                                  );
                                } catch {}
                              };
                              fileReader.readAsDataURL(files[0]);
                            }
                          }}
                          display="default"
                        />
                      ) : (
                        // Default to freeform text input
                        <EuiFieldText
                          compressed={true}
                          fullWidth={true}
                          placeholder={`Value`}
                          value={queryParam.value}
                          onChange={(e) => {
                            props.setQueryParams(
                              props.queryParams.map((qp, i) =>
                                i === idx
                                  ? { ...qp, value: e?.target?.value }
                                  : qp
                              )
                            );
                          }}
                        />
                      )}
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
              );
            })}
          </EuiFlexGroup>
        </EuiFlexItem>
      )}
    </>
  );
}
