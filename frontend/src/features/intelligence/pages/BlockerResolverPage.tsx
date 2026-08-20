import React from 'react';
import { PageHeader } from '@shared/ui/PageHeader';
import { BlockerResolverInterface } from '../components/BlockerResolverInterface';
import { IconSparkles, IconDatabase, IconCpu } from '@tabler/icons-react';

export function BlockerResolverPage() {
  return (
    <div className="space-y-4">
      {/* Page Header */}
      <PageHeader
        title="AI Blocker Resolver (Vector RAG)"
        subtitle="Autonomous context synthesis powered by Pinecone vector memory and Google Gemini 3.5 Flash"
        actions={
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-purple-subtle text-purple border border-purple-subtle px-2.5 py-1 rounded-pill small fw-semibold d-inline-flex align-items-center gap-1.5">
              <IconSparkles size={14} />
              <span>Gemini 3.5 Flash Active</span>
            </span>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 rounded-pill small fw-semibold d-inline-flex align-items-center gap-1.5">
              <IconDatabase size={14} />
              <span>Pinecone Vector Memory</span>
            </span>
          </div>
        }
      />

      {/* Main Chat / Synthesis Interface */}
      <BlockerResolverInterface />
    </div>
  );
}

export default BlockerResolverPage;
