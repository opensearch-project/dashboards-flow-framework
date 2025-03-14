/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { isEmpty } from 'lodash';
import {
  MapCache,
  InputMapEntry,
  OutputMapEntry,
  Transform,
} from '../../../../../../common';

// Update a cache of data transform values based on a given form value
export function updateCache(
  cache: MapCache,
  mapEntry: InputMapEntry | OutputMapEntry,
  idx: number // the mapEntry index
): MapCache {
  const updatedCache = cache;
  const curCache = updatedCache[idx];
  if (curCache === undefined || isEmpty(curCache)) {
    // case 1: there is no persisted state for this entry index. create a fresh arr
    updatedCache[idx] = [mapEntry.value];
  } else if (
    !curCache.some(
      (transform: Transform) =>
        transform.transformType === mapEntry.value.transformType
    )
  ) {
    // case 2: there is persisted state for this entry index, but not for the particular
    // transform type. append to the arr
    updatedCache[idx] = [...updatedCache[idx], mapEntry.value];
  } else {
    // case 3: there is persisted state for this entry index, and for the particular transform type.
    // Update the cache with the current form value(s)
    updatedCache[idx] = updatedCache[idx].map((cachedEntry) => {
      if (cachedEntry.transformType === mapEntry.value.transformType) {
        return mapEntry.value;
      } else {
        return cachedEntry;
      }
    });
  }
  return updatedCache;
}
