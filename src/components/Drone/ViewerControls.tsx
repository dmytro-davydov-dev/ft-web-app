import { useState } from 'react';
import {
  Box,
  Slider,
  Switch,
  FormControlLabel,
  Button,
  Typography,
  Paper,
} from '@mui/material';

export interface ViewerControlsProps {
  onPointSizeChange: (value: number) => void;
  onColourByHeightChange: (on: boolean) => void;
  onResetView: () => void;
}

export default function ViewerControls({
  onPointSizeChange,
  onColourByHeightChange,
  onResetView,
}: ViewerControlsProps) {
  const [pointSize, setPointSize] = useState(1.5);
  const [colourByHeight, setColourByHeight] = useState(false);

  const handlePointSizeChange = (_: Event, value: number | number[]) => {
    const v = Array.isArray(value) ? value[0] : value;
    setPointSize(v);
    onPointSizeChange(v);
  };

  const handleColourToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const on = event.target.checked;
    setColourByHeight(on);
    onColourByHeightChange(on);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        top: 12,
        right: 12,
        width: 200,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        bgcolor: 'rgba(20,20,30,0.85)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          Point size: {pointSize.toFixed(1)}
        </Typography>
        <Slider
          min={0.5}
          max={5}
          step={0.1}
          value={pointSize}
          onChange={handlePointSizeChange}
          size="small"
          aria-label="Point size"
        />
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={colourByHeight}
            onChange={handleColourToggle}
            size="small"
          />
        }
        label={<Typography variant="caption">Colour by height</Typography>}
        sx={{ m: 0 }}
      />

      <Button
        size="small"
        variant="outlined"
        onClick={onResetView}
        sx={{ fontSize: '0.7rem' }}
      >
        ↺ Reset view
      </Button>
    </Paper>
  );
}
