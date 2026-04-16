/**
 * AgentChat Component
 * Chat interface for AI agent with streaming responses
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, Send, Square, ChevronDown, ChevronRight, Wrench, Database, Terminal } from 'lucide-react';
import { agentApi } from '../../api/agent';
import { ChatMessage, GraphData } from '../../types/ontology';

interface AgentChatProps {
  graphData?: GraphData;
  selectedNodes?: string[];
  fullWidth?: boolean;
  // External state management (optional)
  messages?: ChatMessage[];
  onMessagesChange?: (messages: ChatMessage[]) => void;
}

// Parse message content into sections (text and tool calls)
interface MessageSection {
  id: string;
  type: 'text' | 'tool';
  content: string;
  toolName?: string;
  toolNumber?: number;
  isCollapsed?: boolean;
}

const parseMessageContent = (content: string): MessageSection[] => {
  const sections: MessageSection[] = [];

  // First, use our CLEAR SEPARATORS to split content
  // Pattern: === TOOL_CALL_SEPARATOR === ... === TOOL_CALL_END ===
  const toolSectionRegex = /=== TOOL_CALL_SEPARATOR ===\s*\n\n## 🔧 工具步骤 (\d+): ([^\n]+)\s*\n\n([\s\S]*?)\n\n=== TOOL_CALL_END ===/g;

  let lastIndex = 0;
  let match;

  while ((match = toolSectionRegex.exec(content)) !== null) {
    // Add text before tool section - this is the MODEL'S THINKING/CONTENT
    if (match.index > lastIndex) {
      const textContent = content.slice(lastIndex, match.index).trim();
      if (textContent) {
        sections.push({
          id: `text-${Date.now()}-${sections.length}`,
          type: 'text',
          content: textContent,
        });
      }
    }

    // Clean tool content
    let toolContent = match[3].trim();
    // Remove any remaining "**结果:**" prefix just in case
    if (toolContent.startsWith('**结果:**')) {
      toolContent = toolContent.slice('**结果:**'.length).trim();
    }

    // Add tool section - this is the TOOL RESULT
    sections.push({
      id: `tool-${Date.now()}-${sections.length}`,
      type: 'tool',
      toolNumber: parseInt(match[1]),
      toolName: match[2],
      content: toolContent,
      isCollapsed: true, // collapsed by default
    });

    lastIndex = toolSectionRegex.lastIndex;
  }

  // Add remaining text - this is MORE MODEL THINKING/CONTENT after last tool
  if (lastIndex < content.length) {
    const textContent = content.slice(lastIndex).trim();
    if (textContent) {
      sections.push({
        id: `text-${Date.now()}-${sections.length}`,
        type: 'text',
        content: textContent,
      });
    }
  }

  // Fallback: if no sections with new separators, try the old format
  if (sections.length === 0) {
    const oldToolSectionRegex = /---\s*\n\n## 🔧 工具步骤 (\d+): ([^\n]+)\s*\n\n([\s\S]*?)(?=\n\n---|\n\n##|$)/g;
    lastIndex = 0;

    while ((match = oldToolSectionRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        const textContent = content.slice(lastIndex, match.index).trim();
        if (textContent) {
          sections.push({
            id: `text-${Date.now()}-${sections.length}`,
            type: 'text',
            content: textContent,
          });
        }
      }

      let toolContent = match[3].trim();
      if (toolContent.startsWith('**结果:**')) {
        toolContent = toolContent.slice('**结果:**'.length).trim();
      }

      sections.push({
        id: `tool-${Date.now()}-${sections.length}`,
        type: 'tool',
        toolNumber: parseInt(match[1]),
        toolName: match[2],
        content: toolContent,
        isCollapsed: true,
      });

      lastIndex = oldToolSectionRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      const textContent = content.slice(lastIndex).trim();
      if (textContent) {
        sections.push({
          id: `text-${Date.now()}-${sections.length}`,
          type: 'text',
          content: textContent,
        });
      }
    }
  }

  // If still no sections, treat everything as text
  if (sections.length === 0 && content.trim()) {
    sections.push({
      id: `text-${Date.now()}-0`,
      type: 'text',
      content,
    });
  }

  return sections;
};

export const AgentChat: React.FC<AgentChatProps> = ({
  graphData,
  selectedNodes = [],
  fullWidth = false,
}) => {
  // Simple internal state only
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [collapsedTools, setCollapsedTools] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamingMessageIdRef = useRef<string | null>(null);

  // Generate unique ID
  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Toggle tool collapse state
  const toggleTool = (toolId: string) => {
    setCollapsedTools((prev) => {
      const next = new Set(prev);
      if (next.has(toolId)) {
        next.delete(toolId);
      } else {
        next.add(toolId);
      }
      return next;
    });
  };

  // Handle message send - with streaming API
  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    console.log('AgentChat: Adding user message:', userMessage);

    // Add user message
    setMessages((prev) => [...prev, userMessage]);
    const sentMessage = input;
    setInput('');
    setIsStreaming(true);

    // Create assistant message placeholder
    const assistantId = generateId();
    streamingMessageIdRef.current = assistantId;
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      },
    ]);

    // Create AbortController for cancel
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    console.log('AgentChat: Sending message:', sentMessage, 'assistantId:', assistantId);

    try {
      await agentApi.streamChat(
        {
          query: sentMessage,
          conversation_history: messages,
          context: {
            graph_data: graphData,
            selected_nodes: selectedNodes,
          },
        },
        (chunk) => {
          console.log('AgentChat: Received chunk:', chunk);
          // Update message with new content
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === assistantId);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = {
                ...updated[idx],
                content: updated[idx].content + chunk,
              };
              return updated;
            }
            return prev;
          });
        },
        (tool) => {
          console.log('AgentChat: Tool called:', tool);
        },
        () => {
          console.log('AgentChat: Stream completed');
        },
        abortController.signal
      );
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'system',
          content: `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsStreaming(false);
      streamingMessageIdRef.current = null;
      abortControllerRef.current = null;
    }
  };

  // Cancel streaming message
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      streamingMessageIdRef.current = null;
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={`agent-chat ${fullWidth ? 'full-width' : ''}`}>
      {/* Debug info - REMOVE LATER */}
      <div style={{ display: 'none' }}>
        Debug: messages count = {messages.length}
        {JSON.stringify(messages)}
      </div>

      {/* Message list */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <Bot className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500">Start a conversation with AI assistant</p>
            <p className="text-gray-400 text-sm mt-2">Ask about the ontology graph, nodes, relationships, and more</p>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessageItem
            key={message.id}
            message={message}
            collapsedTools={collapsedTools}
            onToggleTool={toggleTool}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="chat-input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Enter your question... (Enter to send, Shift+Enter for new line)"
          disabled={isStreaming}
          className="chat-textarea"
        />
        <div className="chat-actions">
          {isStreaming ? (
            <button onClick={handleStop} className="chat-btn stop-btn">
              <Square className="w-4 h-4" />
              Stop
            </button>
          ) : (
            <button onClick={handleSend} disabled={!input.trim()} className="chat-btn send-btn">
              <Send className="w-4 h-4" />
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ChatMessageItem subcomponent
interface ChatMessageItemProps {
  message: ChatMessage;
  collapsedTools: Set<string>;
  onToggleTool: (toolId: string) => void;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, collapsedTools, onToggleTool }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  console.log('ChatMessageItem rendering:', message.role, message.content.substring(0, 50));

  // User message - simple render with inline styles
  if (isUser) {
    return (
      <div className="chat-message user" style={{ display: 'flex', gap: '12px', flexDirection: 'row-reverse', maxWidth: '100%' }}>
        <div style={{ background: '#7B2D8E', color: 'white', borderRadius: '12px 12px 4px 12px', maxWidth: '80%', marginLeft: 'auto', padding: '12px 16px', flex: 1 }}>
          {message.content}
        </div>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#EAEAEA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <User className="w-5 h-5" />
        </div>
      </div>
    );
  }

  // System message - simple render with inline styles
  if (isSystem) {
    return (
      <div className="chat-message system" style={{ display: 'flex', gap: '12px', maxWidth: '100%' }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', borderRadius: '8px', padding: '8px 12px' }}>
          <span>{message.content}</span>
        </div>
      </div>
    );
  }

  // Assistant message - parse sections
  const sections = useMemo(() => {
    return parseMessageContent(message.content);
  }, [message.content]);

  // If no sections, render simple assistant message
  if (sections.length === 0) {
    return (
      <div className="chat-message assistant" style={{ display: 'flex', gap: '12px', maxWidth: '100%' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#EAEAEA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Bot className="w-5 h-5" />
        </div>
        <div style={{ background: '#F5F5F5', color: '#333', borderRadius: '12px 12px 12px 4px', maxWidth: '80%', padding: '12px 16px', flex: 1 }}>
          <div>{message.content}</div>
        </div>
      </div>
    );
  }

  // Render with collapsible tool sections
  return (
    <div className={`chat-message ${message.role}`} style={{ display: 'flex', gap: '12px', maxWidth: '100%' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#EAEAEA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Bot className="w-5 h-5" />
      </div>
      <div style={{ flex: 1 }}>
        {sections.map((section) => {
          if (section.type === 'text') {
            return (
              <div key={section.id} style={{ margin: '8px 0' }}>
                <ReactMarkdown>{section.content}</ReactMarkdown>
              </div>
            );
          }

          const isCollapsed = collapsedTools.has(section.id);
          const isSql = section.toolName?.toLowerCase().includes('sql') || false;
          const Icon = isSql ? Database : Wrench;

          return (
            <div key={section.id} style={{ margin: '12px 0', border: '1.5px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
              <button
                onClick={() => onToggleTool(section.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F9FAFB', border: 'none', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  <Icon className="w-4 h-4" style={{ color: '#7B2D8E' }} />
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>
                    步骤 {section.toolNumber}: {section.toolName}
                  </span>
                </div>
              </button>
              {!isCollapsed && (
                <div style={{ padding: '12px 14px', background: 'white', borderTop: '1px solid var(--border-color)', color: '#333' }}>
                  <FormattedToolContent content={section.content} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Formatted tool content with better readability
const FormattedToolContent: React.FC<{ content: string }> = ({ content }) => {
  // Check for result label (already stripped in parseMessageContent, but keep just in case)
  let displayContent = content;
  if (displayContent.startsWith('**结果:**')) {
    displayContent = displayContent.slice('**结果:**'.length).trim();
  }

  // Check for code blocks - handle multiple code blocks properly
  // First, check if there's any code block
  const hasCodeBlock = /```[\s\S]*?```/.test(displayContent);

  if (hasCodeBlock) {
    // Extract the first code block (simplified approach)
    const codeBlockMatch = displayContent.match(/```(\w+)?\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      const lang = codeBlockMatch[1] || 'text';
      const code = codeBlockMatch[2];
      return (
        <div className="code-block-wrapper">
          <div className="code-block-header">
            <Terminal className="w-3 h-3" />
            <span className="code-lang">{lang}</span>
          </div>
          <pre>
            <code className={`language-${lang}`}>{code}</code>
          </pre>
        </div>
      );
    }
  }

  // Check if it looks like SQL without code block - more comprehensive check
  const upperContent = displayContent.toUpperCase();
  if (upperContent.includes('CREATE TABLE') ||
      upperContent.includes('SELECT ') ||
      upperContent.includes('INSERT ') ||
      upperContent.includes('UPDATE ') ||
      upperContent.includes('DELETE ') ||
      upperContent.includes('ALTER TABLE') ||
      upperContent.includes('DROP TABLE') ||
      upperContent.includes('CREATE INDEX') ||
      (upperContent.includes('DC_ID') && upperContent.includes('VARCHAR'))) {
    return (
      <div className="code-block-wrapper">
        <div className="code-block-header">
          <Terminal className="w-3 h-3" />
          <span className="code-lang">sql</span>
        </div>
        <pre>
          <code className="language-sql">{displayContent}</code>
        </pre>
      </div>
    );
  }

  // Check if it looks like JSON without code block
  if ((displayContent.trim().startsWith('{') && displayContent.trim().endsWith('}')) ||
      (displayContent.trim().startsWith('[') && displayContent.trim().endsWith(']'))) {
    try {
      const parsed = JSON.parse(displayContent);
      return (
        <div className="code-block-wrapper">
          <div className="code-block-header">
            <Terminal className="w-3 h-3" />
            <span className="code-lang">json</span>
          </div>
          <pre>
            <code className="language-json">{JSON.stringify(parsed, null, 2)}</code>
          </pre>
        </div>
      );
    } catch {
      // Not valid JSON, just render as markdown
    }
  }

  return <ReactMarkdown>{displayContent}</ReactMarkdown>;
};
