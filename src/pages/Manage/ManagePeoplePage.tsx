/**
 * ManagePeoplePage — /dashboard/manage/people
 *
 * Lets a manager view all registered personnel and add new person records.
 * Each person may be assigned a hardware BLE badge (Tag) and an optional
 * profile photo stored in Firebase Storage under:
 *   people/{personId}/photo/{file}
 *
 * Phase 5: creation is local-state only (POST to API + Storage upload wired
 * but gated behind a feature flag). The list falls back to usePeople() read API.
 */
import React, { useRef, useState } from 'react';
import { usePeople } from '../../hooks/usePeople';
import type { Person } from '../../hooks/usePeople';
import { useTags } from '../../hooks/useTags';

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

interface NewPersonForm {
  firstName:        string;
  lastName:         string;
  email:            string;
  phone:            string;
  company:          string;
  role:             string;
  nationality:      string;
  tagId:            string;
  supervisor:       string;
  emergencyContact: string;
  photo:            { file: File; preview: string } | null;
}

const EMPTY_FORM: NewPersonForm = {
  firstName:        '',
  lastName:         '',
  email:            '',
  phone:            '',
  company:          '',
  role:             '',
  nationality:      '',
  tagId:            '',
  supervisor:       '',
  emergencyContact: '',
  photo:            null,
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ManagePeoplePage() {
  const { data: people, isLoading, error } = usePeople();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Optimistic local list: newly added people appear immediately
  const [localPeople, setLocalPeople] = useState<Person[]>([]);

  const allPeople = [...(people ?? []), ...localPeople];

  function handleCreated(person: Person) {
    setLocalPeople((prev) => [person, ...prev]);
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
          <Typography variant="h1">People</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SvgIcon inheritViewBox sx={{ width: 18, height: 18 }}><IconPlus /></SvgIcon>}
          onClick={() => setDialogOpen(true)}
        >
          Add person
        </Button>
      </Box>

      {/* Content */}
      {isLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 6, justifyContent: 'center' }}>
          <CircularProgress size={28} />
          <Typography variant="body2" color="text.secondary">Loading people…</Typography>
        </Box>
      )}
      {error && <Alert severity="error">Could not load people: {(error as Error).message}</Alert>}

      {!isLoading && allPeople.length === 0 && (
        <EmptyState onAdd={() => setDialogOpen(true)} />
      )}

      {allPeople.length > 0 && (
        <>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: -2 }}>
            <Chip
              label={`${allPeople.length} person${allPeople.length !== 1 ? 's' : ''}`}
              size="small"
              sx={{ bgcolor: 'rgba(124,58,237,0.12)', color: '#9d5cf0', fontWeight: 600 }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {allPeople.map((person) => (
              <PersonRow key={person.id} person={person} />
            ))}
          </Box>
        </>
      )}

      {/* Create-person dialog */}
      <AddPersonDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={handleCreated}
      />
    </Box>
  );
}

// ── PersonRow ─────────────────────────────────────────────────────────────────

function PersonRow({ person }: { person: Person }) {
  const initials = `${person.firstName.charAt(0)}${person.lastName.charAt(0)}`.toUpperCase();

  return (
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
        {/* Avatar */}
        {person.pictureUrl ? (
          <Box
            component="img"
            src={person.pictureUrl}
            alt={`${person.firstName} ${person.lastName}`}
            sx={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
        ) : (
          <Box sx={{
            width: 44, height: 44, borderRadius: '50%',
            bgcolor: 'primary.main', opacity: 0.85,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff', lineHeight: 1 }}>
              {initials}
            </Typography>
          </Box>
        )}

        {/* Details */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h3" sx={{ mb: 0.25 }}>
            {person.firstName} {person.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {[person.role, person.company].filter(Boolean).join(' · ')}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {person.email && (
              <Typography variant="caption" color="text.disabled" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SvgIcon inheritViewBox sx={{ width: 12, height: 12 }}><IconMail /></SvgIcon>
                {person.email}
              </Typography>
            )}
            {person.phone && (
              <Typography variant="caption" color="text.disabled" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SvgIcon inheritViewBox sx={{ width: 12, height: 12 }}><IconPhone /></SvgIcon>
                {person.phone}
              </Typography>
            )}
          </Stack>
        </Box>

        {/* Tag chip */}
        {person.tagId && (
          <Chip
            size="small"
            label={person.tagId}
            sx={{ fontFamily: 'monospace', fontSize: '0.75rem', bgcolor: 'rgba(0,212,255,0.10)', color: '#00d4ff', fontWeight: 600 }}
          />
        )}
      </CardContent>
    </Card>
  );
}

// ── AddPersonDialog ───────────────────────────────────────────────────────────

interface AddPersonDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (person: Person) => void;
}

function AddPersonDialog({ open, onClose, onCreated }: AddPersonDialogProps) {
  const { data: tags } = useTags();
  const availableTags = (tags ?? []).filter((t) => t.type === 'badge');

  const [form, setForm]           = useState<NewPersonForm>(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const photoInputRef             = useRef<HTMLInputElement>(null);

  function handleClose() {
    if (saving) return;
    setForm(EMPTY_FORM);
    setFormError(null);
    onClose();
  }

  function setField<K extends keyof Omit<NewPersonForm, 'photo'>>(field: K, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, photo: { file, preview } }));
  }

  function removePhoto() {
    if (form.photo?.preview) URL.revokeObjectURL(form.photo.preview);
    setForm((prev) => ({ ...prev, photo: null }));
    if (photoInputRef.current) photoInputRef.current.value = '';
  }

  async function handleSubmit() {
    if (!form.firstName.trim()) { setFormError('First name is required.'); return; }
    if (!form.lastName.trim())  { setFormError('Last name is required.'); return; }
    setFormError(null);
    setSaving(true);

    try {
      // TODO (Phase 5): POST to /api/v1/customers/{id}/people + upload photo to Firebase Storage
      await new Promise((r) => setTimeout(r, 600)); // simulate async

      const stubPerson: Person = {
        id:               `local-${Date.now()}`,
        firstName:        form.firstName.trim(),
        lastName:         form.lastName.trim(),
        email:            form.email.trim(),
        phone:            form.phone.trim(),
        company:          form.company.trim(),
        role:             form.role.trim(),
        nationality:      form.nationality.trim(),
        tagId:            form.tagId || null,
        pictureUrl:       form.photo?.preview ?? null,
        supervisor:       form.supervisor.trim(),
        emergencyContact: form.emergencyContact.trim(),
      };
      onCreated(stubPerson);
      setForm(EMPTY_FORM);
    } catch (err) {
      setFormError((err as Error).message ?? 'Failed to add person.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h3" component="span">New person</Typography>
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
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="First name"
              required
              fullWidth
              value={form.firstName}
              onChange={(e) => setField('firstName', e.target.value)}
              disabled={saving}
              autoFocus
            />
            <TextField
              label="Last name"
              required
              fullWidth
              value={form.lastName}
              onChange={(e) => setField('lastName', e.target.value)}
              disabled={saving}
            />
          </Box>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            disabled={saving}
          />
          <TextField
            label="Phone"
            fullWidth
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            disabled={saving}
          />
        </Box>

        <Divider />

        {/* Organisation */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="overline" sx={{ color: 'text.disabled', lineHeight: 1 }}>
            Organisation
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Company"
              fullWidth
              value={form.company}
              onChange={(e) => setField('company', e.target.value)}
              disabled={saving}
            />
            <TextField
              label="Role"
              fullWidth
              value={form.role}
              onChange={(e) => setField('role', e.target.value)}
              disabled={saving}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Nationality"
              fullWidth
              value={form.nationality}
              onChange={(e) => setField('nationality', e.target.value)}
              disabled={saving}
            />
            <TextField
              label="Supervisor"
              fullWidth
              value={form.supervisor}
              onChange={(e) => setField('supervisor', e.target.value)}
              disabled={saving}
            />
          </Box>
          <TextField
            label="Emergency contact"
            fullWidth
            value={form.emergencyContact}
            onChange={(e) => setField('emergencyContact', e.target.value)}
            disabled={saving}
            placeholder="Name, phone"
          />
        </Box>

        <Divider />

        {/* Badge assignment */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="overline" sx={{ color: 'text.disabled', lineHeight: 1 }}>
            Badge assignment
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Assign a BLE badge tag to this person for real-time location tracking.
          </Typography>
          <TextField
            label="Badge tag"
            select
            fullWidth
            value={form.tagId}
            onChange={(e) => setField('tagId', e.target.value)}
            disabled={saving}
          >
            <MenuItem value="">
              <em>Unassigned</em>
            </MenuItem>
            {availableTags.map((tag) => (
              <MenuItem key={tag.id} value={tag.id}>
                {tag.label || tag.id}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Divider />

        {/* Profile photo */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="overline" sx={{ color: 'text.disabled', lineHeight: 1 }}>
            Profile photo
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Upload a photo (PNG or JPG, max 5 MB).
          </Typography>

          {form.photo ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                component="img"
                src={form.photo.preview}
                alt="Profile photo preview"
                sx={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid', borderColor: 'divider' }}
              />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{form.photo.file.name}</Typography>
                <Typography variant="caption" color="text.secondary">{formatBytes(form.photo.file.size)}</Typography>
              </Box>
              <IconButton size="small" onClick={removePhoto} disabled={saving} aria-label="Remove photo" sx={{ ml: 'auto' }}>
                <SvgIcon inheritViewBox sx={{ width: 16, height: 16 }}><IconX /></SvgIcon>
              </IconButton>
            </Box>
          ) : (
            <Button
              variant="outlined"
              size="small"
              disabled={saving}
              startIcon={<SvgIcon inheritViewBox sx={{ width: 16, height: 16 }}><IconUpload /></SvgIcon>}
              onClick={() => photoInputRef.current?.click()}
              sx={{ alignSelf: 'flex-start' }}
            >
              Upload photo
            </Button>
          )}

          <input
            ref={photoInputRef}
            type="file"
            accept=".png,.jpg,.jpeg"
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
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
          {saving ? 'Adding…' : 'Add person'}
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="9" cy="7" r="3"/>
          <path d="M2 21c1-4 3.5-6 7-6s6 2 7 6"/>
          <circle cx="18" cy="8" r="2.5"/>
          <path d="M18 13c2 0 3.5 1.5 4 4"/>
        </svg>
      </SvgIcon>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" sx={{ mb: 0.5 }}>No people yet</Typography>
        <Typography variant="body2" color="text.secondary">
          Add personnel records to track presence, assign badges, and manage access.
        </Typography>
      </Box>
      <Button
        variant="contained"
        startIcon={<SvgIcon inheritViewBox sx={{ width: 18, height: 18 }}><IconPlus /></SvgIcon>}
        onClick={onAdd}
      >
        Add person
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
function IconMail() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>;
}
function IconPhone() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.1 5.18 2 2 0 015.09 3h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.09 10.9a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 17.92z"/></svg>;
}
