import { useState } from 'react';
import { Upload, Trash2, Youtube, FileText } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Card, SectionTitle, Button, Input, Tag, EmptyState } from '@/components/ui';
import type { PageKey } from '@/lib/types';

export function Library({ onNavigate }: { onNavigate: (p: PageKey) => void }) {
  const { resources, addResource, deleteResource, showToast } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const handleAdd = async () => {
    if (!title.trim()) return;
    const isYoutube = url.includes('youtube') || url.includes('youtu.be');
    const icon = isYoutube ? '🎬' : '📄';
    const meta = isYoutube ? `YouTube · ${new Date().toLocaleDateString()}` : `PDF · ${new Date().toLocaleDateString()}`;
    await addResource(icon, title.trim(), meta, [
      { label: 'Summary', color: 'gold' },
      { label: '5 Flashcards', color: 'teal' },
      { label: '5 MCQs', color: 'blue' },
    ]);
    setTitle('');
    setUrl('');
    setShowAdd(false);
    showToast('Resource added — AI summary, flashcards & quiz generated', 'gold');
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--text-primary)' }}>Library</div>
          <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 4 }}>Upload materials — AI generates summaries, flashcards & tests</div>
        </div>
        <Button variant="gold" size="sm" onClick={() => setShowAdd(!showAdd)}>
          <Upload size={14} /> Upload
        </Button>
      </div>

      {showAdd && (
        <Card style={{ marginBottom: 16 }}>
          <SectionTitle>Add Resource</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Input value={title} onChange={setTitle} placeholder="Resource title (e.g. Thermodynamics Notes)" onEnter={handleAdd} />
            <Input value={url} onChange={setUrl} placeholder="YouTube URL or file link (optional)" onEnter={handleAdd} />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="gold" onClick={handleAdd} disabled={!title.trim()}>Add & Process →</Button>
              <Button onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {resources.length === 0 ? (
        <Card>
          <EmptyState
            icon="◇"
            title="No resources yet"
            sub="Upload a PDF or paste a YouTube link. The AI will instantly generate summaries, flashcards, and practice tests."
            action={<Button variant="gold" size="sm" onClick={() => setShowAdd(true)}>Upload your first resource →</Button>}
          />
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {resources.map((r) => (
            <Card key={r.id} style={{ position: 'relative' }}>
              <button
                onClick={() => deleteResource(r.id)}
                style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.4 }}
              >
                <Trash2 size={14} />
              </button>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{r.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{r.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{r.meta}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {r.outputs?.map((o, i) => (
                  <Tag key={i} color={o.color}>{o.label}</Tag>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
