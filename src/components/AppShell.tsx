/**
 * AppShell — MUI Drawer sidebar + AppBar topbar layout.
 */
import React from 'react';
import type { SVGProps } from 'react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box, Drawer, AppBar, Toolbar, List, ListSubheader,
  ListItemButton, ListItemIcon, ListItemText, Avatar,
  Typography, TextField, ToggleButton, ToggleButtonGroup,
  InputAdornment, Divider, Button, SvgIcon,
} from '@mui/material';

const DRAWER_WIDTH = 248;

interface NavItem {
  to: string;
  label: string;
  icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
  end?: boolean;
}
interface NavSection { section: string; items: NavItem[]; }

const NAV_ITEMS: NavSection[] = [
  {
    section: 'Live',
    items: [
      { to: '/dashboard',           label: 'Overview',       icon: IconGrid,       end: true },
      { to: '/dashboard/sites',     label: 'Sites & floors', icon: IconSites       },
      { to: '/dashboard/events',    label: 'Events stream',  icon: IconEvents      },
      { to: '/dashboard/geofences', label: 'Geofences',      icon: IconGeofences   },
    ],
  },
  {
    section: 'Assets',
    items: [
      { to: '/dashboard/people',   label: 'People',         icon: IconPeople   },
      { to: '/dashboard/tags',     label: 'Tags & devices', icon: IconTags     },
      { to: '/dashboard/gateways', label: 'Gateways',       icon: IconGateways },
    ],
  },
  {
    section: 'Analyze',
    items: [
      { to: '/dashboard/reports',   label: 'Reports',          icon: IconReports   },
      { to: '/dashboard/occupancy', label: 'Occupancy trends', icon: IconOccupancy },
    ],
  },
];

type TimeFilter = 'live' | '1h' | 'today' | '7d';

export default function AppShell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('live');

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  const initials = (user?.displayName ?? user?.email ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Box sx={{ display: 'flex', height: '100%', minHeight: '100vh' }}>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            py: 3,
            px: 1.5,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, mb: 3 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: '4px', background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', flexShrink: 0 }} />
          <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Flowterra
          </Typography>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {NAV_ITEMS.map(({ section, items }) => (
            <List
              key={section}
              disablePadding
              subheader={
                <ListSubheader
                  disableGutters
                  sx={{ bgcolor: 'transparent', color: 'text.disabled', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1, pt: 2.5, pb: 1, px: 1 }}
                >
                  {section}
                </ListSubheader>
              }
            >
              {items.map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end} style={{ textDecoration: 'none' }}>
                  {({ isActive }: { isActive: boolean }) => (
                    <ListItemButton selected={isActive} sx={{ mb: 0.25, gap: 1 }}>
                      <ListItemIcon sx={{ minWidth: 'auto' }}>
                        <SvgIcon inheritViewBox sx={{ width: 18, height: 18, color: 'inherit' }}>
                          <Icon />
                        </SvgIcon>
                      </ListItemIcon>
                      <ListItemText primary={label} />
                    </ListItemButton>
                  )}
                </NavLink>
              ))}
            </List>
          ))}
        </Box>

        <Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
            <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', fontWeight: 700, background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', color: '#041018', flexShrink: 0 }}>
              {initials}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.displayName ?? user?.email}
              </Typography>
              <Button
                variant="text" size="small" onClick={handleSignOut}
                sx={{ p: 0, minWidth: 0, height: 'auto', fontSize: '0.75rem', color: 'text.disabled', fontWeight: 400, lineHeight: 1.5, textTransform: 'none', '&:hover': { color: 'text.secondary', bgcolor: 'transparent' } }}
              >
                Sign out
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <AppBar position="sticky" elevation={0} sx={{ left: 0 }}>
          <Toolbar sx={{ gap: 3, minHeight: '64px !important', px: 4 }}>
            <TextField
              size="small"
              placeholder="Search tags, people, gateways, events…"
              sx={{ maxWidth: 420, width: '100%' }}
              slotProps={{
                input: { startAdornment: <InputAdornment position="start"><IconSearch /></InputAdornment> },
              }}
            />
            <Box sx={{ flex: 1 }} />
            <ToggleButtonGroup
              value={timeFilter}
              exclusive
              onChange={(_e: React.MouseEvent<HTMLElement>, val: TimeFilter | null) => { if (val) setTimeFilter(val); }}
              size="small"
              sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '999px', p: '4px', gap: '2px', '& .MuiToggleButtonGroup-grouped': { border: 0, borderRadius: '999px !important', px: 1.75, py: 0.75, fontSize: '0.875rem', fontWeight: 600, color: 'text.secondary', textTransform: 'none', '&.Mui-selected': { bgcolor: 'background.default', color: 'text.primary' }, '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' } } }}
            >
              <ToggleButton value="live">Live</ToggleButton>
              <ToggleButton value="1h">Last hour</ToggleButton>
              <ToggleButton value="today">Today</ToggleButton>
              <ToggleButton value="7d">7d</ToggleButton>
            </ToggleButtonGroup>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flex: 1, p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

function IconSearch() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>;
}
function IconGrid() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>; }
function IconSites() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg>; }
function IconEvents() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h16M4 12h16M4 18h10"/></svg>; }
function IconGeofences() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>; }
function IconPeople() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>; }
function IconTags() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="7" width="18" height="12" rx="2"/><path d="M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2"/></svg>; }
function IconGateways() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 12a8 8 0 0116 0"/><path d="M8 12a4 4 0 018 0"/><circle cx="12" cy="12" r="1.2"/></svg>; }
function IconReports() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19V7M10 19V4M16 19v-7M22 19H2"/></svg>; }
function IconOccupancy() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3v18h18"/><path d="M7 14l3-3 3 3 5-6"/></svg>; }
