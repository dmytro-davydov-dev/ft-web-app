/**
 * ManageSitesPage — /dashboard/manage/sites
 *
 * Lets a manager view all sites and create a new site with a floor drawing
 * and photo uploads. Files are stored in Firebase Storage under:
 *   sites/{siteId}/drawing/{file}
 *   sites/{siteId}/photos/{file}
 *
 * Phase 4: creation is local-state only (POST to API + Storage upload wired but
 * gated behind a feature flag). The list falls back to useSites() read API.
 */
import React, { useCallback, useRef, useState } from 'react';
import { useSites, createSite } from '../../hooks/useSites';
import type { Site } from '../../hooks/useSites';
import { useAuth } from '../../context/AuthContext';

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
  Stack,
  SvgIcon,
  TextField,
  Typography,
} from '@mui/material';

// ── Types ─────────────────────────────────────────────────────────────────────

interface UploadedFile {
  file: File;
  preview: string; // object URL for images, empty for non-images
}

interface NewSiteForm {
  name: string;
  description: string;
  address: string;
  drawing: UploadedFile | null;
  photos: UploadedFile[];
}

const EMPTY_FORM: NewSiteForm = {
  name: '',
  description: '',
  address: '',
  drawing: null,
  photos: [],
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ManageSitesPage() {
  const { data: sites, isLoading, error } = useSites();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Optimistic local list: newly created sites appear immediately
  const [localSites, setLocalSites] = useState<Site[]>([]);

  const allSites = [...(sites ?? []), ...localSites];

  function handleCreated(site: Site) {
    setLocalSites((prev) => [site, ...prev]);
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
          <Typography variant="h1">Sites</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SvgIcon inheritViewBox sx={{ width: 18, height: 18 }}><IconPlus /></SvgIcon>}
          onClick={() => setDialogOpen(true)}
        >
          Add site
        </Button>
      </Box>

      {/* Content */}
      {isLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 6, justifyContent: 'center' }}>
          <CircularProgress size={28} />
          <Typography variant="body2" color="text.secondary">Loading sites…</Typography>
        </Box>
      )}
      {error && <Alert severity="error">Could not load sites: {(error as Error).message}</Alert>}

      {!isLoading && allSites.length === 0 && (
        <EmptyState onAdd={() => setDialogOpen(true)} />
      )}

      {allSites.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {allSites.map((site) => (
            <SiteRow key={site.id} site={site} />
          ))}
        </Box>
      )}

      {/* Create-site dialog */}
      <CreateSiteDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={handleCreated}
      />
    </Box>
  );
}

// ── SiteRow ───────────────────────────────────────────────────────────────────

function SiteRow({ site }: { site: Site }) {
  const totalZones = site.floors.reduce((s, f) => s + f.zones.length, 0);
  const totalGw    = site.floors.reduce((s, f) => s + f.gateway_count, 0);

  return (
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
        {/* Icon */}
        <Box sx={{ width: 44, height: 44, borderRadius: 1.5, bgcolor: 'primary.main', opacity: 0.15, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <SvgIcon inheritViewBox sx={{ width: 22, height: 22, color: 'primary.main', position: 'absolute' }}>
            <IconBuilding />
          </SvgIcon>
        </Box>

        {/* Details */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h3" sx={{ mb: 0.25 }}>{site.name}</Typography>
          {site.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{site.description}</Typography>
          )}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip size="small" label={`${site.floorplan.floors} floor${site.floorplan.floors !== 1 ? 's' : ''}`} />
            <Chip size="small" label={`${totalZones} zones`} />
            <Chip size="small" label={`${totalGw} gateways`} />
            <Chip size="small" label={`${site.floorplan.floor_area_m2.toLocaleString()} m²/floor`} />
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

// ── CreateSiteDialog ──────────────────────────────────────────────────────────

interface CreateSiteDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (site: Site) => void;
}

function CreateSiteDialog({ open, onClose, onCreated }: CreateSiteDialogProps) {
  const { customerId } = useAuth();
  const [form, setForm] = useState<NewSiteForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const drawingInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef  = useRef<HTMLInputElement>(null);

  function handleClose() {
    if (saving) return;
    setForm(EMPTY_FORM);
    setFormError(null);
    onClose();
  }

  function setField(field: keyof Pick<NewSiteForm, 'name' | 'description' | 'address'>, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Drawing upload
  function handleDrawingChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : '';
    setForm((prev) => ({ ...prev, drawing: { file, preview } }));
  }

  function removeDrawing() {
    if (form.drawing?.preview) URL.revokeObjectURL(form.drawing.preview);
    setForm((prev) => ({ ...prev, drawing: null }));
    if (drawingInputRef.current) drawingInputRef.current.value = '';
  }

  // Photos upload
  function handlePhotosChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const uploaded: UploadedFile[] = files.map((f) => ({
      file: f,
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : '',
    }));
    setForm((prev) => ({ ...prev, photos: [...prev.photos, ...uploaded] }));
    if (photosInputRef.current) photosInputRef.current.value = '';
  }

  function removePhoto(idx: number) {
    setForm((prev) => {
      const next = [...prev.photos];
      const removed = next.splice(idx, 1)[0];
      if (removed.preview) URL.revokeObjectURL(removed.preview);
      return { ...prev, photos: next };
    });
  }

  // Drag-and-drop for drawing
  const [drawingDragOver, setDrawingDragOver] = useState(false);
  const handleDrawingDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrawingDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : '';
    setForm((prev) => ({ ...prev, drawing: { file, preview } }));
  }, []);

  // Submit
  async function handleSubmit() {
    if (!form.name.trim()) { setFormError('Site name is required.'); return; }
    if (!customerId) { setFormError('Not authenticated — please reload and sign in again.'); return; }
    setFormError(null);
    setSaving(true);

    try {
      // Write the new site to Firestore under customers/{customerId}/sites.
      // File uploads (drawing / photos) are wired in Phase 5 via ft-api signed URLs.
      const site = await createSite(customerId, {
        name:        form.name.trim(),
        description: form.description.trim(),
        address:     form.address.trim(),
      });
      onCreated(site);
      setForm(EMPTY_FORM);
    } catch (err) {
      setFormError((err as Error).message ?? 'Failed to create site.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h3" component="span">New site</Typography>
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
            Basic info
          </Typography>
          <TextField
            label="Site name"
            required
            fullWidth
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            disabled={saving}
            autoFocus
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            minRows={2}
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            disabled={saving}
          />
          <TextField
            label="Address"
            fullWidth
            value={form.address}
            onChange={(e) => setField('address', e.target.value)}
            disabled={saving}
          />
        </Box>

        <Divider />

        {/* Site drawing */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="overline" sx={{ color: 'text.disabled', lineHeight: 1 }}>
            Floor drawing
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Upload a floor plan image or PDF (PNG, JPG, SVG, PDF — max 20 MB).
          </Typography>

          {form.drawing ? (
            <Box sx={{ position: 'relative', border: '1px solid', borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
              {form.drawing.preview ? (
                <Box
                  component="img"
                  src={form.drawing.preview}
                  alt="Floor drawing preview"
                  sx={{ width: '100%', maxHeight: 200, objectFit: 'contain', display: 'block', bgcolor: 'background.default' }}
                />
              ) : (
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <SvgIcon inheritViewBox sx={{ width: 32, height: 32, color: 'primary.main' }}><IconFile /></SvgIcon>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{form.drawing.file.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{formatBytes(form.drawing.file.size)}</Typography>
                  </Box>
                </Box>
              )}
              <IconButton
                size="small"
                onClick={removeDrawing}
                disabled={saving}
                aria-label="Remove drawing"
                sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'background.paper', '&:hover': { bgcolor: 'background.default' } }}
              >
                <SvgIcon inheritViewBox sx={{ width: 14, height: 14 }}><IconX /></SvgIcon>
              </IconButton>
            </Box>
          ) : (
            <DropZone
              label="Drop floor drawing here, or click to browse"
              accept=".png,.jpg,.jpeg,.svg,.pdf"
              dragOver={drawingDragOver}
              onDragOver={(e) => { e.preventDefault(); setDrawingDragOver(true); }}
              onDragLeave={() => setDrawingDragOver(false)}
              onDrop={handleDrawingDrop}
              onClick={() => drawingInputRef.current?.click()}
              disabled={saving}
            />
          )}

          <input
            ref={drawingInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.svg,.pdf"
            style={{ display: 'none' }}
            onChange={handleDrawingChange}
          />
        </Box>

        <Divider />

        {/* Photos */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="overline" sx={{ color: 'text.disabled', lineHeight: 1 }}>
            Site photos
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Upload photos of the site (PNG, JPG — up to 10 photos, max 10 MB each).
          </Typography>

          {form.photos.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {form.photos.map((p, i) => (
                <PhotoThumb key={i} upload={p} onRemove={() => removePhoto(i)} disabled={saving} />
              ))}
            </Box>
          )}

          {form.photos.length < 10 && (
            <Button
              variant="outlined"
              size="small"
              disabled={saving}
              startIcon={<SvgIcon inheritViewBox sx={{ width: 16, height: 16 }}><IconPlus /></SvgIcon>}
              onClick={() => photosInputRef.current?.click()}
              sx={{ alignSelf: 'flex-start' }}
            >
              Add photos
            </Button>
          )}

          <input
            ref={photosInputRef}
            type="file"
            accept=".png,.jpg,.jpeg"
            multiple
            style={{ display: 'none' }}
            onChange={handlePhotosChange}
          />
        </Box>

        {saving && <LinearProgress sx={{ borderRadius: 1 }} />}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button variant="text" onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Creating…' : 'Create site'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface DropZoneProps {
  label: string;
  accept: string;
  dragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
  disabled: boolean;
}

function DropZone({ label, dragOver, onDragOver, onDragLeave, onDrop, onClick, disabled }: DropZoneProps) {
  return (
    <Box
      onClick={disabled ? undefined : onClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      sx={{
        border: '2px dashed',
        borderColor: dragOver ? 'primary.main' : 'divider',
        borderRadius: 1.5,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        bgcolor: dragOver ? 'rgba(0,212,255,0.04)' : 'transparent',
        transition: 'border-color 0.15s, background-color 0.15s',
        '&:hover': disabled ? {} : { borderColor: 'primary.main', bgcolor: 'rgba(0,212,255,0.03)' },
      }}
    >
      <SvgIcon inheritViewBox sx={{ width: 28, height: 28, color: 'text.disabled' }}><IconUpload /></SvgIcon>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
        {label}
      </Typography>
    </Box>
  );
}

function PhotoThumb({ upload, onRemove, disabled }: { upload: UploadedFile; onRemove: () => void; disabled: boolean }) {
  return (
    <Box sx={{ position: 'relative', width: 80, height: 80, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
      {upload.preview ? (
        <Box
          component="img"
          src={upload.preview}
          alt={upload.file.name}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
          <SvgIcon inheritViewBox sx={{ width: 24, height: 24, color: 'text.disabled' }}><IconFile /></SvgIcon>
        </Box>
      )}
      <IconButton
        size="small"
        onClick={onRemove}
        disabled={disabled}
        aria-label="Remove photo"
        sx={{ position: 'absolute', top: 2, right: 2, width: 20, height: 20, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
      >
        <SvgIcon inheritViewBox sx={{ width: 10, height: 10 }}><IconX /></SvgIcon>
      </IconButton>
    </Box>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 10 }}>
      <SvgIcon inheritViewBox sx={{ width: 48, height: 48, color: 'text.disabled' }}><IconBuilding /></SvgIcon>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" sx={{ mb: 0.5 }}>No sites yet</Typography>
        <Typography variant="body2" color="text.secondary">
          Add your first site to start managing floors, zones, and devices.
        </Typography>
      </Box>
      <Button
        variant="contained"
        startIcon={<SvgIcon inheritViewBox sx={{ width: 18, height: 18 }}><IconPlus /></SvgIcon>}
        onClick={onAdd}
      >
        Add site
      </Button>
    </Box>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────

function IconPlus() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function IconX() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function IconUpload() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
}
function IconFile() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}
function IconBuilding() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="10" width="18" height="11" rx="1.5"/><path d="M3 10l9-7 9 7"/><path d="M9 21v-6h6v6"/></svg>;
}
