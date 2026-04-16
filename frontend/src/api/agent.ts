/**
 * Agent API
 * API for chat and agent interactions using Server-Sent Events (SSE)
 */

import apiClient from './client';
import type { ChatRequest, ChatMessage } from '../types/ontology';
import {
  extractToolName,
  extractToolInput,
  extractToolOutput,
  parseToolCall,
  isSqlContent,
  type SSEEvent,
  type SSEResponseType,
} from '../utils/agentHelpers';

class AgentApi {
  /**
   * Stream chat - Using Server-Sent Events (SSE)
   */
  async streamChat(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onToolCall?: (tool: any) => void,
    onDone?: () => void,
    signal?: AbortSignal
  ): Promise<void> {
    const url = `${apiClient.baseURL}/api/v1/chat/stream`;
    console.log('[Agent API] Fetching', url, 'with query:', request.query);

    try {
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: request.query,
          session_id: 'default'
        }),
        signal,
      });

      console.log('[Agent API] Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Agent API] Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let streamCompleted = false;
      let chunkCount = 0;
      let currentEvent: SSEResponseType | '' = '';
      let toolCallCount = 0;

      while (!streamCompleted) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('[Agent API] Stream ended by server');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();

          if (!trimmedLine) continue;

          console.log(`[Agent API] Raw line #${chunkCount}:`, trimmedLine);
          chunkCount++;

          if (trimmedLine.startsWith('event: ')) {
            currentEvent = trimmedLine.slice(7) as SSEResponseType;
            console.log('[Agent API] Event type set to:', currentEvent);
          } else if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.slice(6);
            console.log('[Agent API] Data line:', dataStr);

            if (dataStr && dataStr.trim()) {
              try {
                const parsed = JSON.parse(dataStr) as SSEEvent;
                console.log('[Agent API] Parsed JSON:', parsed);

                // Check for error
                if ('error' in parsed && parsed.error) {
                  throw new Error(parsed.error);
                }

                // Handle different event types
                if (currentEvent === 'message') {
                  const messageType = parsed.type || parsed.event_type || parsed.event;
                  console.log('[Agent API] Processing message event, type:', messageType);

                  // Handle content/text - this is the model's thinking/response
                  if ((messageType === 'content' || messageType === 'text') &&
                      !(messageType === 'tool' || messageType === 'tool_call' ||
                        messageType === 'tool_start' || messageType === 'tool_end')) {
                    const content = 'content' in parsed ? parsed.content : 'text' in parsed ? parsed.text : undefined;
                    if (content) {
                      console.log('[Agent API] Calling onChunk with content:', content.substring(0, 50) + '...');
                      // Pass content as-is, ReactMarkdown will handle formatting
                      onChunk(content);
                    }
                  }

                  // Handle tool calls
                  if (messageType === 'tool_call' || messageType === 'tool' || parsed.type === 'tool') {
                    console.log('[Agent API] Tool/tool_call event detected');
                    if (onToolCall) onToolCall(parsed);

                    if (onChunk) {
                      const toolData = parseToolCall(parsed);
                      toolCallCount++;

                      // Use CLEAR SEPARATOR to distinguish tool results from model thinking
                      let toolDisplay = `\n\n=== TOOL_CALL_SEPARATOR ===\n\n## 🔧 工具步骤 ${toolCallCount}: ${toolData.name}\n\n`;

                      if (toolData.output) {
                        if (typeof toolData.output === 'string') {
                          toolDisplay += toolData.output + '\n';
                        } else {
                          toolDisplay += JSON.stringify(toolData.output, null, 2) + '\n';
                        }
                      } else {
                        toolDisplay += '(无输出)\n';
                      }

                      toolDisplay += '\n=== TOOL_CALL_END ===\n\n';

                      onChunk(toolDisplay);
                    }
                  } else if (messageType === 'tool_start') {
                    console.log('[Agent API] Tool start event:', parsed);
                    if (onToolCall) onToolCall(parsed);
                  } else if (messageType === 'tool_end') {
                    console.log('[Agent API] Tool end event:', parsed);
                    if (onToolCall) onToolCall(parsed);
                  } else if (messageType === 'metadata') {
                    console.log('[Agent API] Metadata event:', parsed);
                  } else {
                    console.log('[Agent API] Unknown message type, displaying raw:', parsed);
                    const content = 'content' in parsed ? parsed.content : 'text' in parsed ? parsed.text : 'message' in parsed ? parsed.message : undefined;
                    if (content) {
                      onChunk(content);
                    }
                  }
                }

                // Check for completion
                if (currentEvent === 'done' && 'status' in parsed && parsed.status) {
                  console.log('[Agent API] Stream completed with status:', parsed.status);
                  streamCompleted = true;
                  if (onDone) onDone();
                }

              } catch (e) {
                console.error('[Agent API] JSON parse error:', e, 'for data:', dataStr);
              }
            }
          }
        }
      }

    } catch (error) {
      console.error('[Agent API] Fetch error:', error);
      if ((error as Error).name === 'AbortError') {
        console.log('[Agent API] Stream aborted');
      } else {
        throw error;
      }
    }
  }
}

export const agentApi = new AgentApi();
