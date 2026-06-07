import React, { useState } from 'react';
import { AppState } from '../../types';
import { Button } from '../shared/Button';
import { Download, Copy, Check } from 'lucide-react';

interface ExportPageProps {
  state: AppState;
}

export const ExportPage: React.FC<ExportPageProps> = ({ state }) => {
  const [copied, setCopied] = useState(false);

  const exportData = {
    exportedAt: new Date().toISOString(),
    habits: state.habits,
    checkIns: state.checkIns,
    goals: state.goals,
  };

  const json = JSON.stringify(exportData, null, 2);

  const download = () => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, marginBottom: 6 }}>
          Export Data
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Download your complete habit tracking data as JSON.
        </p>
      </div>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { label: 'Habits', count: state.habits.length },
              { label: 'Check-ins', count: state.checkIns.length },
              { label: 'Goals', count: state.goals.length },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: 22, fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>{item.count}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" size="sm" icon={copied ? <Check size={14} /> : <Copy size={14} />}
              onClick={copyToClipboard}>
              {copied ? 'Copied!' : 'Copy JSON'}
            </Button>
            <Button variant="primary" size="sm" icon={<Download size={14} />} onClick={download}>
              Download
            </Button>
          </div>
        </div>

        <pre style={{
          background: 'var(--bg-deep)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          fontSize: 11,
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)',
          overflow: 'auto',
          maxHeight: 400,
          lineHeight: 1.6,
        }}>
          {json}
        </pre>
      </div>
    </div>
  );
};
