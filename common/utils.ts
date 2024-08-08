/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import moment from 'moment';
import { DATE_FORMAT_PATTERN } from './';
import { isEmpty } from 'lodash';

export function toFormattedDate(timestampMillis: number): String {
  return moment(new Date(timestampMillis)).format(DATE_FORMAT_PATTERN);
}

const PERMISSIONS_ERROR_PATTERN = /no permissions for \[(.+)\] and User \[name=(.+), backend_roles/;

export const prettifyErrorMessage = (rawErrorMessage: string) => {
  if (isEmpty(rawErrorMessage) || rawErrorMessage === 'undefined') {
    return 'Unknown error is returned.';
  }
  const match = rawErrorMessage.match(PERMISSIONS_ERROR_PATTERN);
  if (isEmpty(match)) {
    return rawErrorMessage;
  } else {
    return `User ${match[2]} has no permissions to [${match[1]}].`;
  }
};
