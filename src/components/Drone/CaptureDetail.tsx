import { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Capture } from '../../hooks/useCaptureStatus';
import { apiFetch } from '../../api/client';

export interface CaptureDetailProps {
  siteId: string;
  capture: Capture;
  onDeleted: (captureId: string) => void;
}

type GsdTier = 'High' | 'Medium' | 'Low';

function gsdTier(gsd: number): GsdTier {
  if (gsd < 3) return 'High';
  if (gsd <= 5) return 'Medium';
  return 'Low';
}

function gsdChipColor(tier: GsdTier): 'success' | 'warning' | 'error' {
  if (tier === 'High') return 'success';
  if (tier === 'Medium') return 'warning';
  return 'error';
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface MetaRowProps {
  label: string;
  value: React.ReactNode;
}

function MetaRow({ label, value }: MetaRowProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
        {label}:
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}

export default function CaptureDetail({ siteId, capture, onDeleted }: CaptureDetailProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const gsd = capture.metadata?.gsd_cm;
  const tier = gsd != null ? gsdTier(gsd) : null;

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await apiFetch(
        `/api/v1/drone/sites/${siteId}/captures/${capture.id}`,
        { method: 'DELETE' },
      );
      if (res.status === 409) {
        setDeleteError('Cannot delete a capture that is currently processing.');
        return;
      }
      if (!res.ok) {
        setDeleteError(`Delete failed (${res.status}). Please try again.`);
        return;
      }
      setConfirmOpen(false);
      onDeleted(capture.id);
    } catch {
      setDeleteError('Network error. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <MetaRow label="Flight date" value={formatDateTime(capture.captured_at)} />
      {capture.photo_count != null && (
        <MetaRow label="Photos" value={capture.photo_count} />
      )}
      <MetaRow
        label="GSD"
        value={
          gsd != null && tier ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {gsd.toFixed(1)} cm/px
              <Chip
                label={tier}
                color={gsdChipColor(tier)}
                size="small"
                variant="outlined"
              />
            </Box>
          ) : (
            '—'
          )
        }
      />
      {capture.metadata?.odm_version && (
        <MetaRow label="ODM version" value={capture.metadata.odm_version} />
      )}
      {capture.metadata?.processed_at && (
        <MetaRow label="Processed" value={formatDateTime(capture.metadata.processed_at)} />
      )}

      <Box sx={{ mt: 1 }}>
        <Button
          size="small"
          color="error"
          variant="outlined"
          startIcon={<DeleteIcon />}
          onClick={() => setConfirmOpen(true)}
        >
          Delete capture
        </Button>
      </Box>

      <Dialog open={confirmOpen} onClose={() => !deleting && setConfirmOpen(false)}>
        <DialogTitle>Delete capture?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete the capture from{' '}
            <strong>{new Date(capture.captured_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>{' '}
            and all associated GCS data (raw photos, processed files, and 3D tiles). This action cannot be undone.
          </DialogContentText>
          {deleteError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {deleteError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
