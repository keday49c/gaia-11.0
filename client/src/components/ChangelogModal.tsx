import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ChangelogModal({ open, onClose, release }: any) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const notes = release?.releaseNotes || release?.notes || release?.body || 'Sem changelog disponível.';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Card className="p-6 max-w-2xl" style={{ maxHeight: '80vh', overflowY: 'auto', background: 'rgba(10,10,10,0.85)', color: '#eee' }}>
        <h3 className="text-xl font-semibold mb-2">Changelog — {release?.version || ''}</h3>
        <div className="prose text-sm mb-4" style={{ color: '#ccc' }}>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{notes}</pre>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          <Button onClick={async () => { await (window as any).gaia.installUpdate(); }}>Instalar agora</Button>
        </div>
      </Card>
    </div>
  );
}