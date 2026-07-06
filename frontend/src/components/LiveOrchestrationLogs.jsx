import React, { useState, useEffect, useRef } from 'react';
import Card from './ui/Card.jsx';
import { ChevronDown, Terminal } from 'lucide-react';

/**
 * LiveOrchestrationLogs Component
 * 
 * Displays real-time logs from the LangGraph orchestrator via SSE stream.
 * Dark/Deep Teal terminal-style, monospace font, auto-scrolling.
 * Collapsible by default once complete.
 */
const LiveOrchestrationLogs = ({ itineraryId, isGenerating, onComplete }) => {
  const [logs, setLogs] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [status, setStatus] = useState('idle');
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (!itineraryId || !isGenerating) return;

    const streamUrl = new URL(`/api/itineraries/${itineraryId}/stream`, window.location.origin).href;
    const eventSource = new EventSource(streamUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'log') {
          setLogs(prev => [...prev, data]);
          setStatus('active');
          
          // Auto-scroll to bottom
          if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
          }
        } else if (data.type === 'status') {
          if (data.status === 'completed') {
            setStatus('completed');
            setIsExpanded(false); // Collapse by default when complete
            eventSource.close();
            if (onComplete) onComplete();
          } else if (data.status === 'failed') {
            setStatus('failed');
            eventSource.close();
          }
        } else if (data.type === 'result') {
          // Final itinerary result
          if (onComplete) onComplete(data.itinerary);
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
      setStatus('error');
    };

    return () => {
      eventSource.close();
    };
  }, [itineraryId, isGenerating, onComplete]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };

  const getStatusColor = () => {
    switch (status) {
      case 'active': return 'bg-[#00e676]'; // pulsing mint
      case 'completed': return 'bg-[#006d35]';
      case 'failed': return 'bg-danger';
      case 'error': return 'bg-danger';
      default: return 'bg-text-muted';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'active': return 'Orchestrating...';
      case 'completed': return 'Finished';
      case 'failed': return 'Failed';
      case 'error': return 'Connection Error';
      default: return 'Ready';
    }
  };

  if (!isGenerating && logs.length === 0) {
    return null;
  }

  return (
    <Card noPadding className="overflow-hidden border border-border-subtle mb-6">
      <div 
        className="bg-bg-elevated px-4 py-3.5 border-b border-border-subtle flex items-center justify-between cursor-pointer hover:bg-bg-elevated/75 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor()} ${status === 'active' ? 'animate-pulse-dot' : ''}`} />
          <span className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5 font-sans">
            <Terminal className="w-4 h-4 text-accent-blue" />
            Agent Orchestrator
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-bg-surface text-text-secondary border border-border/40 font-mono">
            {getStatusText()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-text-muted font-semibold tracking-wider">
            LANGGRAPH_AGENT_V1.0
          </span>
          <ChevronDown
            className={`w-4 h-4 text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>
      
      {isExpanded && (
        <div 
          ref={logContainerRef}
          className="p-4 bg-[#ebefec] font-mono text-[11px] text-text-secondary space-y-2.5 h-56 overflow-y-auto"
        >
          {logs.length === 0 ? (
            <div className="flex gap-3 text-text-muted italic">
              <span className="text-accent-blue font-bold">[System]</span>
              <span>Waiting for orchestrator logs to arrive...</span>
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="flex gap-3.5">
                <span className="text-accent-blue whitespace-nowrap font-semibold">
                  [{formatTimestamp(log.timestamp)}]
                </span>
                <span className="text-text-primary leading-normal">
                  <span className="text-[#006d35] font-bold">{log.agent}:</span> {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  );
};

export default LiveOrchestrationLogs;
