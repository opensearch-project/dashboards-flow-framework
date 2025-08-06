# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## OpenSearch Flow Framework Dashboards Plugin

This plugin is part of the OpenSearch Dashboards ecosystem, providing a visual interface for the Flow Framework that allows users to build search and ingest pipelines. It focuses on AI/ML-enhanced use cases via ML inference processors.

## Common Development Commands

### Setup and Installation
```bash
# Bootstrap the plugin (run in the plugin directory)
yarn osd bootstrap

# Build plugin distributable
yarn build
```

### Running the Plugin
```bash
# Run OpenSearch Dashboards with this plugin (from OpenSearch Dashboards root directory)
yarn start --no-base-path
```

### Testing
```bash
# Run unit tests
yarn test:jest
```

### Formatting
```bash
# Format code using Prettier
yarn prettier --write <relative file path>
```

## Architecture Overview

### Plugin Structure
- **Server-side**: Implements an OpenSearch Dashboards plugin that interfaces with the Flow Framework OpenSearch plugin
- **Client-side**: Provides a React-based UI for building and configuring workflows

### Key Components

#### Server-side
- `plugin.ts`: Main plugin class that registers routes and creates OpenSearch clients
- `routes/`: API endpoints for interacting with OpenSearch and the Flow Framework
- `cluster/`: Custom APIs for interacting with OpenSearch plugins (Flow Framework, ML, Core)

#### Client-side
- `public/plugin.ts`: Client-side plugin initialization and setup
- `public/app.tsx`: Main application component
- `public/pages/`: UI pages for workflow list and workflow detail views
- `public/component_types/`: Component definitions for the workflow visual editor
- `public/configs/`: Configuration definitions for various processors and components
- `public/store/`: Redux store for state management

### Workflow Architecture
The plugin allows users to:
1. Create workflows (use cases) for different search and ingest patterns
2. Configure processors for data ingestion and search
3. Build visual pipelines using ReactFlow
4. Export workflow templates for use in other clusters

### Key Features
- Visual pipeline builder for search and ingest workflows
- Support for ML-powered processors
- Resource management for indices, pipelines, and more
- Multiple pre-defined workflow templates for common use cases

## Development Notes
1. The plugin runs within the OpenSearch Dashboards environment and depends on its APIs
2. Changes to workflow templates in `server/resources/templates/` affect the pre-defined workflow options
3. The frontend uses ReactFlow for the visual pipeline editor
4. Redux is used for state management