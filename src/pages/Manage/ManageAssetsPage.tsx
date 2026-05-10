/**
 * ManageAssetsPage — /dashboard/manage/assets
 *
 * Lets a manager view and register BLE asset tags (type = 'asset').
 * Each asset tag has a label, hardware MAC, site/zone assignment, and notes.
 *
 * Phase 5: creation is local-state only (POST to API wired but gated behind
 * a feature flag). The list falls back to useTags() filtered to type='asset'.
 */
import { useState } from 'react';
import { useTags } from '../../hooks/useTags';
import type { Tag } from '../../hooks/useTags';
import { useSites } from '../../hooks/useSites';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  MenuItem,
  Stack,
  SvgIcon,
  TextField,
  Typography,
} from '@mui/material';

// ── Types ─────────────────────────────────────────────────────────────────────

interface NewAssetForm {
  label:   string;
  mac:     string;
  siteId:  string;
  zoneId:  string;
  notes:   string;
}

const EMPTY_FORM: NewAssetForm = {
  label:  '',
  mac:    '',
  siteId: '',
  zoneId: '',
  notes:  '',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ManageAssetsPage() {
  const { data: tags, isLoading, error } = useTags();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Only show asset-type tags (not badges)
  const assetTags = (tags ?? []).filter((t) => t.type === 'asset');

  // Optimistic local list: newly added assets appear immediately
  const [localAssets, setLocalAssets] = useState<Tag[]>([]);

  const allAssets = [...assetTags, ...localAssets];

  function handleCreated(asset: Tag) {
    setLocalAssets((prev) => [asset, ...prev]);
    setDialogOpen(false);
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 0.5 }}>
            Manage
          </Typography>
          <Typography variant="h1">Assets</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SvgIcon inheritViewBox sx={{ width: 18, height: 18 }}><IconPlus /></SvgIcon>}
          onClick={() => setDialogOpen(true)}
        >
          Add asset
        </Button>
      </Box>

      {/* Content */}
      {isLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 6, justifyContent: 'center' }}>
          <CircularProgress size={28} />
          <Typography variant="body2" color="text.secondary">Loading assets…</Typography>
        </Box>
      )}
      {error && <Alert severity="error">Could not load assets: {(error as Error).message}</Alert>}

      {!isLoading && allAssets.length === 0 && (
        <EmptyState onAdd={() => setDialogOpen(true)} />
      )}

      {allAssets.length > 0 && (
        <>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: -2 }}>
            <Chip
              label={`${allAssets.length} asset${allAssets.length !== 1 ? 's' : ''}`}
              size="small"
              sx={{ bgcolor: 'rgba(0,212,255,0.10)', color: '#00d4ff', fontWeight: 600 }}
            />
            <Chip
              label={`${allAssets.filter((a) => a.status === 'active').length} active`}
              size="small"
              sx={{ bgcolor: 'rgba(34,197,94,0.10)', color: '#22c55e', fontWeight: 600 }}
            />
            <Chip
              label={`${allAssets.filter((a) => a.status === 'low_battery').length} low battery`}
              size="small"
              sx={{ bgcolor: 'rgba(234,179,8,0.10)', color: '#eab308', fontWeight: 600 }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {allAssets.map((asset) => (
              <AssetRow key={asset.id} asset={asset} />
            ))}
          </Box>
        </>
      )}

      {/* Add asset dialog */}
      <AddAssetDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={handleCreated}
      />
    </Box>
  );
}

// ── AssetRow ──────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, { bg: string; fg: string }> = {
  active:      { bg: 'rgba(34,197,94,0.10)',  fg: '#22c55e' },
  inactive:    { bg: 'rgba(100,116,139,0.10)', fg: '#94a3b8' },
  low_battery: { bg: 'rgba(234,179,8,0.10)',  fg: '#eab308' },
};

function AssetRow({ asset }: { asset: Tag }) {
  const statusColors = STATUS_COLOR[asset.status] ?? STATUS_COLOR.inactive;
  const lastSeen = asset.lastSeen
    ? new Date(asset.lastSeen).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
    : null;

  return (
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
        {/* Icon */}
        <Box sx={{
          width: 44, height: 44, borderRadius: 1.5,
          bgcolor: 'rgba(0,212,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <SvgIcon inheritViewBox sx={{ width: 22, height: 22, color: 'primary.main' }}>
            <IconAsset />
          </SvgIcon>
        </Box>

        {/* Details */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h3" sx={{ mb: 0.25 }}>
            {asset.label || asset.id}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
            {asset.zoneId && (
              <Typography variant="caption" color="text.secondary">
                Zone: {asset.zoneId}
              </Typography>
            )}
            {asset.floor !== null && (
              <Typography variant="caption" color="text.secondary">
                · Floor {asset.floor}
              </Typography>
            )}
            {lastSeen && (
              <Typography variant="caption" color="text.disabled">
                · Last seen {lastSeen}
              </Typography>
            )}
          </Stack>
        </Box>

        {/* Battery */}
        {asset.batteryPct !== null && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <SvgIcon inheritViewBox sx={{ width: 14, height: 14, color: asset.batteryPct < 20 ? '#eab308' : 'text.disabled' }}>
              <IconBattery />
            </SvgIcon>
            <Typography variant="caption" color="text.secondary">{asset.batteryPct}%</Typography>
          </Box>
        )}

        {/* Status badge */}
        <Chip
          size="small"
          label={asset.status.replace('_', ' ')}
          sx={{ bgcolor: statusColors.bg, color: statusColors.fg, fontWeight: 600, textTransform: 'capitalize' }}
        />

        {/* Tag ID */}
        <Chip
          size="small"
          label={asset.id}
          sx={{ fontFamily: 'monospace', fontSize: '0.75rem', bgcolor: 'rgba(124,58,237,0.10)', color: '#9d5cf0', fontWeight: 600 }}
        />
      </CardContent>
    </Card>
  );
}

// ── AddAssetDialog ────────────────────────────────────────────────────────────

interface AddAssetDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (asset: Tag) => void;
}

function AddAssetDialog({ open, onClose, onCreated }: AddAssetDialogProps) {
  const { data: sites } = useSites();

  const [form, setForm]           = useState<NewAssetForm>(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Derive zones from selected site
  const selectedSite = (sites ?? []).find((s) => s.id === form.siteId);
  const allZones = selectedSite
    ? selectedSite.floors.flatMap((f) => f.zones.map((z) => ({ ...z, floorNum: f.floor })))
    : [];

  function handleClose() {
    if (saving) return;
    setForm(EMPTY_FORM);
    setFormError(null);
    onClose();
  }

  function setField<K extends keyof NewAssetForm>(field: K, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Reset zone when site changes
      if (field === 'siteId') next.zoneId = '';
      return next;
    });
  }

  async function handleSubmit() {
    if (!form.label.trim()) { setFormError('Asset label is required.'); return; }
    setFormError(null);
    setSaving(true);

    try {
      // TODO (Phase 5): POST to /api/v1/customers/{id}/tags with type='asset'
      await new Promise((r) => setTimeout(r, 600)); // simulate async

      const stubAsset: Tag = {
        id:         form.mac.trim() || `asset-${Date.now()}`,
        label:      form.label.trim(),
        type:       'asset',
        batteryPct: null,
        lastSeen:   null,
        zoneId:     form.zoneId || null,
        floor:      null,
        status:     'inactive',
      };
      onCreated(stubAsset);
      setForm(EMPTY_FORM);
    } catch (err) {
      setFormError((err as Error).message ?? 'Failed to add asset.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h3" component="span">New asset</Typography>
        <IconButton size="small" onClick={handleClose} disabled={saving} aria-label="close">
          <SvgIcon inheritViewBox sx={{ width: 18, height: 18 }}><IconX /></SvgIcon>
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {formError && <Alert severity="error" onClose={() => setFormError(null)}>{formError}</Alert>}

        {/* Basic info */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="overline" sx={{ color: 'text.disabled', lineHeight: 1 }}>
            Asset info
          </Typography>
          <TextField
            label="Asset label"
            required
            fullWidth
            value={form.label}
            onChange={(e) => setField('label', e.target.value)}
            disabled={saving}
            autoFocus
            placeholder="e.g. Forklift #3, Laptop Cart A"
          />
          <TextField
            label="Hardware ID / MAC address"
            fullWidth
            value={form.mac}
            onChange={(e) => setField('mac', e.target.value)}
            disabled={saving}
            placeholder="e.g. AA:BB:CC:DD:EE:FF"
            slotProps={{ htmlInput: { style: { fontFamily: 'monospace' } } }}
            helperText="BLE tag MAC address printed on the device (optional — auto-generated if blank)"
          />
          <TextField
            label="Notes"
            fullWidth
            multiline
            minRows={2}
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
            disabled={saving}
            placeholder="Any details about this asset…"
          />
        </Box>

        <Divider />

        {/* Location assignment */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="overline" sx={{ color: 'text.disabled', lineHeight: 1 }}>
            Location assignment
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Optionally assign this asset to a known site and zone.
          </Typography>
          <TextField
            label="Site"
            select
            fullWidth
            value={form.siteId}
            onChange={(e) => setField('siteId', e.target.value)}
            disabled={saving}
          >
            <MenuItem value=""><em>Unassigned</em></MenuItem>
            {(sites ?? []).map((site) => (
              <MenuItem key={site.id} value={site.id}>{site.name}</MenuItem>
            ))}
          </TextField>
          {form.siteId && (
            <TextField
              label="Zone"
              select
              fullWidth
              value={form.zoneId}
              onChange={(e) => setField('zoneId', e.target.value)}
              disabled={saving || allZones.length === 0}
              helperText={allZones.length === 0 ? 'No zones configured for this site' : undefined}
            >
              <MenuItem value=""><em>Unassigned</em></MenuItem>
              {allZones.map((zone) => (
                <MenuItem key={zone.id} value={zone.id}>{zone.label}</MenuItem>
              ))}
            </TextField>
          )}
        </Box>

        {saving && <LinearProgress sx={{ borderRadius: 1 }} />}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button variant="text" onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Adding…' : 'Add asset'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 10 }}>
      <SvgIcon inheritViewBox sx={{ width: 48, height: 48, color: 'text.disabled' }}>
        <IconAsset />
      </SvgIcon>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" sx={{ mb: 0.5 }}>No assets yet</Typography>
        <Typography variant="body2" color="text.secondary">
          Register BLE asset tags to track equipment, tools, and devices in real time.
        </Typography>
      </Box>
      <Button
        variant="contained"
        startIcon={<SvgIcon inheritViewBox sx={{ width: 18, height: 18 }}><IconPlus /></SvgIcon>}
        onClick={onAdd}
      >
        Add asset
      </Button>
    </Box>
  );
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────

function IconPlus() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function IconX() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function IconAsset() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="7" width="18" height="12" rx="2"/><path d="M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2"/><circle cx="12" cy="13" r="1.2" fill="currentColor" stroke="none"/></svg>;
}
function IconBattery() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="16" height="10" rx="1.5"/><path d="M22 11v2" strokeLinecap="round"/><rect x="4" y="9" width="8" height="6" rx="0.5" fill="currentColor" stroke="none"/></svg>;
}
