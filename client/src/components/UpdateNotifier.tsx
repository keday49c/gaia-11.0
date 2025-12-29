import React, { useEffect, useState, Suspense } from 'react';
const ChangelogModal = React.lazy(() => import('./ChangelogModal'));
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function UpdateNotifier() {
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    if (typeof (window as any).gaia === 'undefined') return;

    const gaia = (window as any).gaia;

    gaia.onUpdateAvailable((i: any) => {
      setStatus('available');
      setInfo(i);
    });

    gaia.onUpdateNotAvailable(() => {
      setStatus('not-available');
    });

    gaia.onDownloadProgress((p: any) => {
      setStatus('downloading');
      setProgress(Math.round((p.percent || 0)));
    });

    gaia.onUpdateDownloaded((i: any) => {
      setStatus('downloaded');
      setInfo(i);
      setProgress(100);
    });

    return () => {
      // no-op: ipcRenderer.removeListener isn't exposed here
    };
  }, []);

  const [showChangelog, setShowChangelog] = useState(false);

  const checkForUpdates = async () => {
    if (typeof (window as any).gaia === 'undefined') return;
    setStatus('checking');
    const res = await (window as any).gaia.checkForUpdates();
    if (!res || !res.success) setStatus('error');
  };

  const installUpdate = async () => {
    if (typeof (window as any).gaia === 'undefined') return;
    await (window as any).gaia.installUpdate();
  };

  const createBackup = async () => {
    if (typeof (window as any).gaia === 'undefined') return;
    const res = await (window as any).gaia.createBackup();
    if (res?.success) alert('✅ Backup criado em: ' + res.path);
    else alert('❌ Falha ao criar backup: ' + (res?.error || res?.message || 'unknown'));
  };

  const rollback = async () => {
    if (typeof (window as any).gaia === 'undefined') return;
    const res = await (window as any).gaia.rollback();
    if (res?.success) alert('⚠️ Backup encontrado: ' + res.path + '\n' + res.message);
    else alert('❌ Rollback indisponível: ' + (res?.error || res?.message || 'Nenhum backup'));
  };

  if (!((window as any).gaia)) return null;

  return (
    <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 999 }}>
      <Card className="p-3">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div>
            <strong>Atualizações</strong>
            <div style={{ fontSize: 12, color: '#666' }}>{status || 'inativo'}</div>
            {progress !== null && <div style={{ fontSize: 12 }}>{progress}%</div>}
          </div>
          <div>
            <Button onClick={checkForUpdates} className="mr-2">🔎 Verificar</Button>
            {status === 'available' && <Button onClick={() => setShowChangelog(true)}>Ver Changelog</Button>}
            {status === 'downloaded' && <Button onClick={installUpdate}>Instalar</Button>}
            <Button variant="outline" onClick={createBackup} className="ml-2">Backup</Button>
            <Button variant="ghost" onClick={rollback} className="ml-2">Rollback</Button>
          </div>
        </div>
      </Card>
      {/* Changelog modal */}
      {showChangelog && <div> 
        {/* lazy-load changelog modal */}
        <Suspense fallback={<div>Loading changelog...</div>}>
          <ChangelogModal open={showChangelog} onClose={() => setShowChangelog(false)} release={info} />
        </Suspense>
      </div>}
    </div>
  );
}
