/**
 * Agent Helpers
 * Utility functions for parsing agent responses and tool calls
 */

import type { ChatMessage } from '../types/ontology';

// SSE Event Types
export type SSEResponseType =
  | 'message'
  | 'tool'
  | 'tool_call'
  | 'tool_start'
  | 'tool_end'
  | 'metadata'
  | 'done'
  | 'error';

export interface SSEMessageEvent {
  type: 'content' | 'text' | 'tool' | 'tool_call' | 'tool_start' | 'tool_end' | 'metadata';
  content?: string;
  text?: string;
  tools?: any[];
  data?: any;
  [key: string]: any;
}

export interface SSEDoneEvent {
  status: string;
}

export interface SSEErrorEvent {
  error: string;
}

export type SSEEvent = SSEMessageEvent | SSEDoneEvent | SSEErrorEvent;

// Tool Call Data Structure
export interface ToolCallData {
  name: string;
  input: any;
  output?: any;
  toolCallId?: string;
}

/**
 * Helper to extract tool name from various data structures
 */
export const extractToolName = (obj: any): string => {
  if (!obj) return 'unknown_tool';
  return (
    obj.name ||
    obj.tool_name ||
    obj.tool ||
    obj.function_name ||
    obj.function?.name ||
    obj.action ||
    'unknown_tool'
  );
};

/**
 * Helper to extract tool input/arguments from various data structures
 */
export const extractToolInput = (obj: any): any => {
  if (!obj) return {};
  return (
    obj.input ||
    obj.arguments ||
    obj.params ||
    obj.parameters ||
    obj.args ||
    obj.function?.arguments ||
    obj.function?.input ||
    obj.data ||
    {}
  );
};

/**
 * Helper to extract tool output/result from various data structures
 */
export const extractToolOutput = (obj: any): any => {
  if (!obj) return undefined;
  return (
    obj.output ||
    obj.result ||
    obj.return ||
    obj.response ||
    obj.content ||
    obj.data ||
    obj.function?.output ||
    obj.function?.result ||
    undefined
  );
};

/**
 * Parse tool call from various data structures
 */
export const parseToolCall = (data: any): ToolCallData => {
  // Check for nested tools structure
  const tools = data.tools || data.data?.tools;

  if (tools) {
    // Check for messages array (the actual format from backend)
    if (Array.isArray(tools.messages) && tools.messages.length > 0) {
      const msg = tools.messages[0];
      return {
        name: extractToolName(msg),
        input: extractToolInput(msg),
        output: extractToolOutput(msg),
        toolCallId: msg.tool_call_id,
      };
    }

    if (Array.isArray(tools) && tools.length > 0) {
      const tool = tools[0];
      return {
        name: extractToolName(tool),
        input: extractToolInput(tool),
        output: extractToolOutput(tool),
      };
    }
  }

  // Fallback: treat the whole object as a tool
  return {
    name: extractToolName(data),
    input: extractToolInput(data),
    output: extractToolOutput(data),
  };
};

/**
 * Format tool content for display
 */
export const formatToolContent = (tool: ToolCallData): string => {
  let content = '';

  if (tool.output) {
    content += `**结果:**\n\n`;
    if (typeof tool.output === 'string') {
      content += tool.output;
    } else {
      content += '```json\n' + JSON.stringify(tool.output, null, 2) + '\n```';
    }
  } else {
    content += `**参数:**\n\n`;
    if (tool.input && typeof tool.input === 'object' && Object.keys(tool.input).length > 0) {
      content += '```json\n' + JSON.stringify(tool.input, null, 2) + '\n```';
    } else if (tool.input && typeof tool.input === 'string') {
      content += tool.input;
    } else {
      content += '(无参数)';
    }
  }

  return content;
};

/**
 * Generate unique ID for chat messages
 */
export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create a new chat message
 */
export const createChatMessage = (
  role: ChatMessage['role'],
  content: string
): ChatMessage => ({
  id: generateMessageId(),
  role,
  content,
  timestamp: new Date().toISOString(),
});

/**
 * Check if content looks like SQL
 */
export const isSqlContent = (content: string): boolean => {
  const sqlKeywords = ['CREATE TABLE', 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'FROM', 'WHERE', 'JOIN'];
  const upperContent = content.toUpperCase();
  return sqlKeywords.some(keyword => upperContent.includes(keyword));
};

/**
 * Check if content looks like JSON
 */
export const isJsonContent = (content: string): boolean => {
  const trimmed = content.trim();
  return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
         (trimmed.startsWith('[') && trimmed.endsWith(']'));
};

/**
 * Try to format JSON string
 */
export const tryFormatJson = (content: string): string => {
  try {
    const parsed = JSON.parse(content);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return content;
  }
};
