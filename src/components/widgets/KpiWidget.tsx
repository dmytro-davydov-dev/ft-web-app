import { Box, Card, CardContent, Typography, Chip } from '@mui/material';

interface KpiWidgetProps {
  label: string;
  value?: string;
  note?: string;
  accent?: 'default' | 'warning' | 'positive' | 'negative';
}

const ACCENT_COLORS: Record<string, { border: string; value: string }> = {
  default:  { border: 'rgba(0,212,255,0.20)',   value: '#e2e8f0'  },
  warning:  { border: 'rgba(251,191,36,0.30)',  value: '#fbbf24'  },
  positive: { border: 'rgba(74,222,128,0.25)',  value: '#4ade80'  },
  negative: { border: 'rgba(248,113,113,0.25)', value: '#f87171'  },
};

export default function KpiWidget({ label, value = '—', note, accent = 'default' }: KpiWidgetProps) {
  const colors = ACCENT_COLORS[accent];

  return (
    <Card
      sx={{
        borderColor: colors.border,
        borderRadius: 2,
        flex: 1,
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '0.04em' }}>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography
            sx={{
              fontSize: '2rem',
              fontWeight: 700,
              lineHeight: 1,
              color: colors.value,
              letterSpacing: '-0.02em',
            }}
          >
            {value}
          </Typography>
          {note && (
            <Chip
              label={note}
              size="small"
              sx={{ height: 20, fontSize: '0.6875rem', bgcolor: 'rgba(255,255,255,0.06)', color: 'text.disabled' }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
