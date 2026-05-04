/**
 * ReportsPage — MUI Tabs + date pickers.
 * Lazy-loaded from App.tsx; Recharts stays in its own code-split chunk.
 */
import React, { useState } from 'react';
import AreaOccupancyChart  from './AreaOccupancy';
import FloorOccupancyChart from './FloorOccupancy';
import BuildingUtilisation from './Utilisation';
import PeopleDayTable      from './PeopleDay';
import AlertsTable         from './Alerts';

import { Box, Typography, Tabs, Tab, TextField } from '@mui/material';

export interface DateParams {
  from: string;
  to: string;
  [key: string]: string; // index signature so DateParams is assignable to ReportParams
}

type TabId = 'area' | 'floor' | 'utilisation' | 'people-day' | 'alerts';

const TABS: { id: TabId; label: string }[] = [
  { id: 'area',        label: 'Area Occupancy'  },
  { id: 'floor',       label: 'Floor Occupancy' },
  { id: 'utilisation', label: 'Utilisation'     },
  { id: 'people-day',  label: 'People Day'      },
  { id: 'alerts',      label: 'Alerts'          },
];

function toIsoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('area');

  const defaultTo   = toIsoDate(new Date());
  const defaultFrom = toIsoDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));

  const [from, setFrom] = useState(defaultFrom);
  const [to,   setTo]   = useState(defaultTo);

  const dateParams: DateParams = { from, to };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Page header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 0.5 }}>
            Analyze
          </Typography>
          <Typography variant="h1">Reports</Typography>
        </Box>

        {/* Date range */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            label="From"
            type="date"
            size="small"
            value={from}
            slotProps={{ htmlInput: { max: to } }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFrom(e.target.value)}
            sx={{ width: 160 }}
          />
          <TextField
            label="To"
            type="date"
            size="small"
            value={to}
            slotProps={{ htmlInput: { min: from, max: defaultTo } }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTo(e.target.value)}
            sx={{ width: 160 }}
          />
        </Box>
      </Box>

      {/* Tab nav */}
      <Tabs
        value={activeTab}
        onChange={(_e: React.SyntheticEvent, val: TabId) => setActiveTab(val)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {TABS.map(({ id, label }) => (
          <Tab key={id} value={id} label={label} />
        ))}
      </Tabs>

      {/* Active report */}
      <Box>
        {activeTab === 'area'        && <AreaOccupancyChart  dateParams={dateParams} />}
        {activeTab === 'floor'       && <FloorOccupancyChart dateParams={dateParams} />}
        {activeTab === 'utilisation' && <BuildingUtilisation dateParams={dateParams} />}
        {activeTab === 'people-day'  && <PeopleDayTable      dateParams={dateParams} />}
        {activeTab === 'alerts'      && <AlertsTable         dateParams={dateParams} />}
      </Box>
    </Box>
  );
}
