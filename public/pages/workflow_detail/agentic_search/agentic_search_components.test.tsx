/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { AgenticSearchInfoModal } from './components/agentic_search_info_modal';
import { AgentMemory } from './configure_flow/agent_memory';
import { AGENT_MEMORY_TYPE } from '../../../../common';
import { INITIAL_ML_STATE } from '../../../store';

// Mock services to avoid UISettings error
jest.mock('../../../services', () => {
  const { mockCoreServices } = require('../../../../test/mocks');
  return {
    ...jest.requireActual('../../../services'),
    ...mockCoreServices,
  };
});

const mockStore = configureStore([]);
const store = mockStore({
  ml: {
    ...INITIAL_ML_STATE,
    memoryContainers: {
      'container-1': { id: 'container-1', name: 'Test Container' },
    },
  },
});

const renderWithStore = (ui: React.ReactElement) =>
  render(<Provider store={store}>{ui}</Provider>);

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
    renderWithStore(
      <AgentMemory agentForm={{}} setAgentForm={jest.fn()} />
    );
    expect(screen.getByLabelText('Select memory type')).toBeInTheDocument();
  });

  test('renders conversation index option', () => {
    renderWithStore(
      <AgentMemory
        agentForm={{ memory: { type: AGENT_MEMORY_TYPE.CONVERSATION_INDEX } }}
        setAgentForm={jest.fn()}
      />
    );
    expect(screen.getByDisplayValue('Conversation index')).toBeInTheDocument();
  });

  test('calls setAgentForm on change', () => {
    const mockSetForm = jest.fn();
    renderWithStore(
      <AgentMemory agentForm={{}} setAgentForm={mockSetForm} />
    );
    fireEvent.change(screen.getByLabelText('Select memory type'), {
      target: { value: AGENT_MEMORY_TYPE.CONVERSATION_INDEX },
    });
    expect(mockSetForm).toHaveBeenCalled();
  });

  test('shows container dropdown when agentic memory is selected', () => {
    renderWithStore(
      <AgentMemory
        agentForm={{ memory: { type: AGENT_MEMORY_TYPE.AGENTIC_MEMORY } }}
        setAgentForm={jest.fn()}
      />
    );
    expect(screen.getByLabelText('Select memory container')).toBeInTheDocument();
    expect(screen.getByText('Test Container')).toBeInTheDocument();
  });

  test('does not show container dropdown for conversation index', () => {
    renderWithStore(
      <AgentMemory
        agentForm={{ memory: { type: AGENT_MEMORY_TYPE.CONVERSATION_INDEX } }}
        setAgentForm={jest.fn()}
      />
    );
    expect(screen.queryByLabelText('Select memory container')).toBeNull();
  });

  test('calls setAgentForm with memory_container_id on container selection', () => {
    const mockSetForm = jest.fn();
    renderWithStore(
      <AgentMemory
        agentForm={{ memory: { type: AGENT_MEMORY_TYPE.AGENTIC_MEMORY } }}
        setAgentForm={mockSetForm}
      />
    );
    fireEvent.change(screen.getByLabelText('Select memory container'), {
      target: { value: 'container-1' },
    });
    expect(mockSetForm).toHaveBeenCalledWith(
      expect.objectContaining({
        memory: expect.objectContaining({
          type: AGENT_MEMORY_TYPE.AGENTIC_MEMORY,
          memory_container_id: 'container-1',
        }),
      })
    );
  });

  test('disables dropdowns when readOnly is true', () => {
    renderWithStore(
      <AgentMemory
        agentForm={{
          memory: {
            type: AGENT_MEMORY_TYPE.AGENTIC_MEMORY,
            memory_container_id: 'container-1',
          },
        }}
        setAgentForm={jest.fn()}
        readOnly={true}
      />
    );
    expect(screen.getByLabelText('Select memory type')).toBeDisabled();
    expect(screen.getByLabelText('Select memory container')).toBeDisabled();
  });

  test('agentic memory without container ID should be considered invalid', () => {
    // This mirrors the validation in configure_flow.tsx:
    // agentForm.memory.type === AGENTIC_MEMORY && isEmpty(memory_container_id)
    const agentFormNoContainer = {
      memory: { type: AGENT_MEMORY_TYPE.AGENTIC_MEMORY },
    };
    const agentFormWithContainer = {
      memory: {
        type: AGENT_MEMORY_TYPE.AGENTIC_MEMORY,
        memory_container_id: 'container-1',
      },
    };
    const agentFormConversation = {
      memory: { type: AGENT_MEMORY_TYPE.CONVERSATION_INDEX },
    };

    const isInvalid = (form: any) =>
      form?.memory?.type === AGENT_MEMORY_TYPE.AGENTIC_MEMORY &&
      !form?.memory?.memory_container_id;

    expect(isInvalid(agentFormNoContainer)).toBe(true);
    expect(isInvalid(agentFormWithContainer)).toBe(false);
    expect(isInvalid(agentFormConversation)).toBe(false);
  });
});
