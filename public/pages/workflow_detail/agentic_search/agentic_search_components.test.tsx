/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AgenticSearchInfoModal } from './components/agentic_search_info_modal';
import { AgentMemory } from './configure_flow/agent_memory';
import { AGENT_MEMORY_TYPE } from '../../../../common';

describe('AgenticSearchInfoModal', () => {
  test('renders modal title and content', () => {
    render(<AgenticSearchInfoModal onClose={jest.fn()} />);
    expect(screen.getByText('What is Agentic Search?')).toBeInTheDocument();
  });

  test('calls onClose when Got it button is clicked', () => {
    const mockClose = jest.fn();
    render(<AgenticSearchInfoModal onClose={mockClose} />);
    fireEvent.click(screen.getByText('Got it'));
    expect(mockClose).toHaveBeenCalled();
  });

  test('renders documentation link', () => {
    render(<AgenticSearchInfoModal onClose={jest.fn()} />);
    expect(screen.getByText('documentation')).toBeInTheDocument();
  });
});

describe('AgentMemory', () => {
  test('renders memory type selector', () => {
    render(
      <AgentMemory agentForm={{}} setAgentForm={jest.fn()} />
    );
    expect(screen.getByLabelText('Select memory type')).toBeInTheDocument();
  });

  test('renders conversation index option', () => {
    render(
      <AgentMemory
        agentForm={{ memory: { type: AGENT_MEMORY_TYPE.CONVERSATION_INDEX } }}
        setAgentForm={jest.fn()}
      />
    );
    expect(screen.getByDisplayValue('Conversation index')).toBeInTheDocument();
  });

  test('calls setAgentForm on change', () => {
    const mockSetForm = jest.fn();
    render(
      <AgentMemory agentForm={{}} setAgentForm={mockSetForm} />
    );
    fireEvent.change(screen.getByLabelText('Select memory type'), {
      target: { value: AGENT_MEMORY_TYPE.CONVERSATION_INDEX },
    });
    expect(mockSetForm).toHaveBeenCalled();
  });
});
