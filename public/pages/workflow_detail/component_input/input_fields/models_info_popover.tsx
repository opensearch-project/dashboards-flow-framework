/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
    EuiLink,
    EuiPopover,
    EuiSmallButtonEmpty,
} from '@elastic/eui';
import {
    MODEL_CATEGORY,
    ML_MODELS_SETUP_DOCS_LINK,
    COHERE_EMBEDDING_MODEL_DOCS_LINK,
    BEDROCK_TITAN_EMBEDDING_DOCS_LINK,
    BEDROCK_CLAUDE_3_SONNET_DOCS_LINK,
    OPENAI_GPT35_DOCS_LINK,
    DEEPSEEK_CHAT_DOCS_LINK,
} from '../../../../../common';

interface ModelInfoPopoverProps {
    modelCategory?: MODEL_CATEGORY;
}

export function ModelInfoPopover({ modelCategory }: ModelInfoPopoverProps) {
    const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

    const getModelLinks = () => {
        if (modelCategory === MODEL_CATEGORY.EMBEDDING) {
            return (
                <>
                    <EuiLink external href={COHERE_EMBEDDING_MODEL_DOCS_LINK} target="_blank">
                        Cohere Embed
                    </EuiLink>
                    {' '}or{' '}
                    <EuiLink external href={BEDROCK_TITAN_EMBEDDING_DOCS_LINK} target="_blank">
                        Amazon Bedrock Titan Embedding
                    </EuiLink>
                </>
            );
        } else if (modelCategory === MODEL_CATEGORY.LLM) {
            return (
                <>
                    <EuiLink external href={BEDROCK_CLAUDE_3_SONNET_DOCS_LINK} target="_blank">
                        Amazon Bedrock Claude 3 Sonnet
                    </EuiLink>
                    {', '}
                    <EuiLink external href={OPENAI_GPT35_DOCS_LINK} target="_blank">
                        OpenAI GPT-3.5
                    </EuiLink>
                    {', or '}
                    <EuiLink external href={DEEPSEEK_CHAT_DOCS_LINK} target="_blank">
                        DeepSeek Chat model
                    </EuiLink>
                </>
            );
        }
        return null;
    };

    const getModelTypeText = () => {
        if (modelCategory === MODEL_CATEGORY.EMBEDDING) {
            return 'n embedding';
        } else if (modelCategory === MODEL_CATEGORY.LLM) {
            return ' large language';
        }
        return '';
    };

    return (
        <EuiPopover
            isOpen={isPopoverOpen}
            initialFocus={false}
            anchorPosition="leftCenter"
            closePopover={() => setIsPopoverOpen(false)}
            button={
                <EuiSmallButtonEmpty
                    style={{ marginTop: '-4px' }}
                    onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                >
                    Learn more
                </EuiSmallButtonEmpty>
            }
        >
            <div style={{ padding: '12px', width: '400px' }}>
                <p style={{ margin: '0', lineHeight: '1.5' }}>
                    To create this workflow, you must select a{getModelTypeText()} model. 
                    {getModelLinks() && <> For example: {getModelLinks()}.</>}
                </p>
                <p style={{ margin: '24px 0 0 0', lineHeight: '1.5' }}>
                    <EuiLink external href={ML_MODELS_SETUP_DOCS_LINK} target="_blank">
                        Learn more
                    </EuiLink>
                    {' '}about integrating ML models.
                </p>
            </div>
        </EuiPopover>
    );
    
}
