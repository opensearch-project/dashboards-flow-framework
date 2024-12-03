/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiText, EuiFieldText } from '@elastic/eui';
import { QueryParam } from '../../common';

interface QueryParamsListProps {
  queryParams: QueryParam[];
  setQueryParams: (params: QueryParam[]) => void;
}

/**
 * Basic, reusable component for displaying a list of query parameters, and allowing
 * users to freely enter values for each.
 */
export function QueryParamsList(props: QueryParamsListProps) {
  return (
    <>
      {props.queryParams?.length > 0 && (
        <EuiFlexItem>
          <EuiFlexGroup direction="column" gutterSize="xs">
            <EuiFlexItem grow={false}>
              <EuiFlexGroup direction="row" gutterSize="s">
                <EuiFlexItem grow={3}>
                  <EuiText size="s" color="subdued">
                    Parameter
                  </EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={7}>
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
                    <EuiFlexItem grow={3}>
                      <EuiText size="s" style={{ paddingTop: '4px' }}>
                        {queryParam.name}
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={7}>
                      <EuiFieldText
                        compressed={true}
                        fullWidth={true}
                        placeholder={`Value`}
                        value={queryParam.value}
                        onChange={(e) => {
                          props.setQueryParams(
                            props.queryParams.map((qp, i) =>
                              i === idx ? { ...qp, value: e.target.value } : qp
                            )
                          );
                        }}
                      />
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
