/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiHorizontalRule,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonEmpty,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiTitle,
  EuiCodeBlock,
  EuiText,
  EuiPanel,
} from '@elastic/eui';
import {
  customStringify,
  SearchHit,
  getCharacterLimitedString,
} from '../../../../../common';

interface VisualizedHitsProps {
  hits: SearchHit[];
  imageFieldName: string;
}

const NUM_PREVIEW_FIELDS = 3;
const IMAGE_DIMENSION = '100px';
const IMAGE_DIMENSION_FLYOUT = '300px';
const MAX_PREVIEW_FIELD_VALUE_CHARACTERS = 50;

export function VisualizedHits({ hits, imageFieldName }: VisualizedHitsProps) {
  const [flyoutHit, setFlyoutHit] = useState<SearchHit | undefined>(undefined);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const formatSourcePreview = (source: any) => {
    const entries = Object.entries(source).filter(
      ([key]) => key !== imageFieldName
    );
    const preview = entries.slice(0, NUM_PREVIEW_FIELDS);
    const hasMore = entries.length > NUM_PREVIEW_FIELDS;

    return { preview, hasMore };
  };

  return (
    <>
      {flyoutHit && (
        <EuiFlyout
          onClose={() => setFlyoutHit(undefined)}
          style={{ width: '40vw' }}
        >
          <EuiFlyoutHeader>
            <EuiTitle size="m">
              <h2>Search result details</h2>
            </EuiTitle>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            {imageFieldName && flyoutHit._source?.[imageFieldName] && (
              <div style={{ marginBottom: '16px' }}>
                <img
                  src={flyoutHit._source[imageFieldName]}
                  alt="Hit image"
                  style={{
                    maxWidth: IMAGE_DIMENSION_FLYOUT,
                    maxHeight: IMAGE_DIMENSION_FLYOUT,
                    display: 'block',
                  }}
                />
              </div>
            )}
            <EuiCodeBlock
              language="json"
              fontSize="s"
              paddingSize="m"
              isCopyable
            >
              {customStringify(flyoutHit._source)}
            </EuiCodeBlock>
          </EuiFlyoutBody>
        </EuiFlyout>
      )}

      {hits.map((hit, index) => {
        const source = hit?._source || {};
        const hasImage = imageFieldName && imageFieldName in source;
        const imageUrl = hasImage ? source[imageFieldName] : null;
        const { preview, hasMore } = formatSourcePreview(source);

        return (
          <EuiFlexItem key={hit._id || index}>
            {index === 0 && <EuiHorizontalRule margin="xs" />}
            <EuiFlexGroup gutterSize="s" alignItems="flexStart">
              {hasImage && (
                <EuiFlexItem
                  grow={false}
                  style={{ width: IMAGE_DIMENSION, height: IMAGE_DIMENSION }}
                >
                  {imageErrors.has(imageUrl) ? (
                    <EuiPanel
                      paddingSize="none"
                      color="subdued"
                      style={{
                        width: IMAGE_DIMENSION,
                        height: IMAGE_DIMENSION,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <EuiText size="xs" color="subdued">
                        <i>Image not found</i>
                      </EuiText>
                    </EuiPanel>
                  ) : (
                    <img
                      src={imageUrl}
                      alt="Hit image"
                      style={{
                        maxWidth: IMAGE_DIMENSION,
                        maxHeight: IMAGE_DIMENSION,
                        objectFit: 'contain',
                      }}
                      onError={() => {
                        setImageErrors((prev) => new Set(prev).add(imageUrl));
                      }}
                    />
                  )}
                </EuiFlexItem>
              )}
              <EuiFlexItem>
                <div>
                  {preview.map(([key, value], idx) => {
                    const valueStr = String(value || '');
                    return (
                      <div key={key} style={{ marginBottom: '2px' }}>
                        <EuiText size="s">
                          <strong>{key}:</strong>{' '}
                          {getCharacterLimitedString(
                            valueStr,
                            MAX_PREVIEW_FIELD_VALUE_CHARACTERS
                          )}
                        </EuiText>
                      </div>
                    );
                  })}
                  {hasMore && (
                    <EuiButtonEmpty
                      size="xs"
                      onClick={() => setFlyoutHit(hit)}
                      style={{ marginTop: '0px', marginLeft: '-8px' }}
                    >
                      View more
                    </EuiButtonEmpty>
                  )}
                </div>
              </EuiFlexItem>
            </EuiFlexGroup>
            {index < hits.length - 1 && <EuiHorizontalRule margin="xs" />}
          </EuiFlexItem>
        );
      })}
    </>
  );
}
