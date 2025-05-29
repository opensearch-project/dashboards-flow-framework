/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIn, useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import { EuiFlexGroup, EuiText } from '@elastic/eui';

interface SearchResultsProps {}

/**
 * Fetch the final transformed query, view a summary of the processors, and quick-navigate to the test panel
 * for running end-to-end search.
 */
export function SearchResults(props: SearchResultsProps) {
  return <EuiText>TODO</EuiText>;
}
