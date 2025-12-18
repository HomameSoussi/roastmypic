'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AnalyticsEvent {
  id: number;
  event: string;
  properties: any;
  timestamp: number;
  created_at: string;
}

interface EventSummary {
  event: string;
  count: number;
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [summary, setSummary] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string>('all');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedEvent]);

  const fetchAnalytics = async () => {
    try {
      const url = selectedEvent === 'all' 
        ? '/api/analytics?limit=100'
        : `/api/analytics?event=${selectedEvent}&limit=100`;
      
      const response = await fetch(url);
      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }
      
      const data = await response.json();
      setEvents(data.events || []);
      
      // Calculate summary
      const eventCounts: { [key: string]: number } = {};
      (data.events || []).forEach((event: AnalyticsEvent) => {
        eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;
      });
      
      const summaryArray = Object.entries(eventCounts).map(([event, count]) => ({
        event,
        count,
      })).sort((a, b) => b.count - a.count);
      
      setSummary(summaryArray);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">📊 Analytics Dashboard</h1>
            <p className="text-gray-400">
              Track platform usage and user behavior
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700">
            <div className="text-gray-400 text-sm mb-2">Total Events</div>
            <div className="text-4xl font-bold text-white">{events.length}</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700">
            <div className="text-gray-400 text-sm mb-2">Event Types</div>
            <div className="text-4xl font-bold text-white">{summary.length}</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700">
            <div className="text-gray-400 text-sm mb-2">Most Common</div>
            <div className="text-2xl font-bold text-white">
              {summary[0]?.event || 'N/A'}
            </div>
          </div>
        </div>

        {/* Event Filter */}
        <div className="mb-6">
          <label className="block text-white font-semibold mb-2">Filter by Event</label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">All Events</option>
            {summary.map((item) => (
              <option key={item.event} value={item.event}>
                {item.event} ({item.count})
              </option>
            ))}
          </select>
        </div>

        {/* Event Summary */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Event Summary</h2>
          <div className="space-y-3">
            {summary.map((item) => (
              <div key={item.event} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <span className="text-white font-medium">{item.event}</span>
                <span className="text-pink-400 font-bold">{item.count} events</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-4">Recent Events</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {events.map((event) => (
              <div key={event.id} className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-pink-400 font-bold">{event.event}</span>
                  <span className="text-gray-400 text-sm">{formatDate(event.timestamp)}</span>
                </div>
                {event.properties && Object.keys(event.properties).length > 0 && (
                  <div className="text-gray-300 text-sm">
                    <pre className="bg-slate-900/50 p-2 rounded overflow-x-auto">
                      {JSON.stringify(event.properties, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
