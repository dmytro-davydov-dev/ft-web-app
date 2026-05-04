/**
 * Comprehensive MUI mock for Jest.
 * Renders semantic HTML so @testing-library queries (role, placeholder, text) work correctly.
 * Used via moduleNameMapper — all @mui/material/* imports resolve here.
 */
import * as React from 'react';

// ── Helpers ───────────────────────────────────────────────────────────────────
type AnyProps = Record<string, unknown> & { children?: React.ReactNode };

function fwd(Tag: keyof JSX.IntrinsicElements, extra?: object) {
  return function MockComponent({ children, sx: _sx, component: _c, ...rest }: AnyProps) {
    return React.createElement(Tag, { ...extra, ...rest }, children);
  };
}

// ── Core layout ───────────────────────────────────────────────────────────────
export const Box = ({ children, sx: _sx, component, ...rest }: AnyProps & { component?: string }) => {
  const Tag = (component as keyof JSX.IntrinsicElements) ?? 'div';
  return React.createElement(Tag, rest as object, children);
};
export const Stack     = fwd('div');
export const Container = fwd('div');
export const Grid2     = ({ children, ...rest }: AnyProps) => {
  const { size: _s, spacing: _sp, container: _c, ...divProps } = rest as AnyProps & { size?: unknown; spacing?: unknown; container?: unknown };
  return <div {...(divProps as object)}>{children}</div>;
};
// Named exports that some files use
export const Grid = Grid2;

// ── Surface ───────────────────────────────────────────────────────────────────
export const Paper      = fwd('div');
export const Card       = fwd('div');
export const CardContent = fwd('div');
export const CardActions = fwd('div');
export const CardHeader  = ({ title, subheader, disableTypography: _, sx: _sx, ...rest }: AnyProps & { title?: React.ReactNode; subheader?: React.ReactNode; disableTypography?: boolean }) => (
  <div {...(rest as object)}>
    {title && <div>{title}</div>}
    {subheader && <div>{subheader}</div>}
  </div>
);
export const CardMedia = fwd('div');

// ── Typography ────────────────────────────────────────────────────────────────
const VARIANT_TAG: Record<string, keyof JSX.IntrinsicElements> = {
  h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6',
  subtitle1: 'h6', subtitle2: 'h6',
  body1: 'p', body2: 'p',
  caption: 'span', overline: 'span', button: 'span', inherit: 'span',
};
export const Typography = ({ variant = 'body1', children, sx: _sx, color: _c, component, ...rest }: AnyProps & { variant?: string; color?: unknown; component?: string }) => {
  const Tag = (component as keyof JSX.IntrinsicElements) ?? VARIANT_TAG[variant] ?? 'p';
  return React.createElement(Tag, rest as object, children);
};

// ── Button ─────────────────────────────────────────────────────────────────── 
export const Button = ({ children, variant: _v, size: _s, color: _c, sx: _sx, startIcon: _si, endIcon: _ei, fullWidth: _fw, disableRipple: _dr, disableElevation: _de, ...rest }: AnyProps & { variant?: string; size?: string; color?: unknown; startIcon?: React.ReactNode; endIcon?: React.ReactNode; fullWidth?: boolean; disableRipple?: boolean; disableElevation?: boolean }) =>
  <button {...(rest as object)}>{children}</button>;

export const IconButton = ({ children, size: _s, color: _c, sx: _sx, ...rest }: AnyProps & { size?: string; color?: unknown }) =>
  <button {...(rest as object)}>{children}</button>;

export const ButtonBase = fwd('button');
export const Fab = fwd('button');

// ── TextField ────────────────────────────────────────────────────────────────
export const TextField = ({ label, type = 'text', placeholder, value, onChange, required, autoComplete, fullWidth: _fw, size: _s, sx: _sx, inputProps, slotProps, ...rest }: AnyProps & { label?: string; type?: string; placeholder?: string; value?: string; onChange?: React.ChangeEventHandler<HTMLInputElement>; required?: boolean; autoComplete?: string; fullWidth?: boolean; size?: string; inputProps?: Record<string, unknown>; slotProps?: Record<string, unknown> }) => {
  const mergedInputProps = { ...(inputProps ?? {}), ...((slotProps as { input?: object } | undefined)?.input ?? {}) };
  return (
    <label>
      {label}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        {...mergedInputProps}
        {...(rest as object)}
      />
    </label>
  );
};

export const InputAdornment = fwd('span');
export const InputBase     = fwd('input');
export const OutlinedInput = fwd('input');
export const Input         = fwd('input');
export const InputLabel    = fwd('label');
export const FormControl   = fwd('div');
export const FormHelperText = fwd('span');
export const FormLabel     = fwd('label');
export const Select        = ({ children, ...rest }: AnyProps) => <select {...(rest as object)}>{children}</select>;
export const MenuItem      = ({ children, value, ...rest }: AnyProps & { value?: unknown }) => <option value={value as string} {...(rest as object)}>{children}</option>;

// ── Alert ────────────────────────────────────────────────────────────────────
export const Alert = ({ children, severity: _s, sx: _sx, ...rest }: AnyProps & { severity?: string }) =>
  <div role="alert" {...(rest as object)}>{children}</div>;
export const AlertTitle = fwd('strong');

// ── Feedback ─────────────────────────────────────────────────────────────────
export const CircularProgress = ({ size: _s, sx: _sx, ...rest }: AnyProps & { size?: number }) =>
  <div role="progressbar" {...(rest as object)}>Loading…</div>;
export const LinearProgress = ({ value: _v, variant: _variant, sx: _sx, ...rest }: AnyProps & { value?: number; variant?: string }) =>
  <div role="progressbar" {...(rest as object)} />;
export const Skeleton = ({ variant: _v, width: _w, height: _h, sx: _sx, ...rest }: AnyProps & { variant?: string; width?: number | string; height?: number | string }) =>
  <div aria-hidden {...(rest as object)} />;
export const Snackbar = fwd('div');

// ── Navigation / Shell ───────────────────────────────────────────────────────
export const Drawer = ({ children, variant: _v, sx: _sx, open: _o, ...rest }: AnyProps & { variant?: string; open?: boolean }) =>
  <div {...(rest as object)}>{children}</div>;
export const AppBar  = fwd('header');
export const Toolbar = fwd('div');

export const List = ({ children, subheader, disablePadding: _dp, sx: _sx, ...rest }: AnyProps & { subheader?: React.ReactNode; disablePadding?: boolean }) => (
  <ul {...(rest as object)}>
    {subheader}
    {children}
  </ul>
);
export const ListSubheader = ({ children, disableGutters: _dg, sx: _sx, ...rest }: AnyProps & { disableGutters?: boolean }) =>
  <li {...(rest as object)}>{children}</li>;
export const ListItem       = fwd('li');
export const ListItemAvatar = fwd('div');
export const ListItemButton = ({ children, selected: _sel, sx: _sx, ...rest }: AnyProps & { selected?: boolean }) =>
  <li><button {...(rest as object)}>{children}</button></li>;
export const ListItemIcon = ({ children, sx: _sx, ...rest }: AnyProps) =>
  <span {...(rest as object)}>{children}</span>;
export const ListItemText = ({ primary, secondary, sx: _sx, ...rest }: AnyProps & { primary?: React.ReactNode; secondary?: React.ReactNode }) =>
  <span {...(rest as object)}>{primary}{secondary && <span>{secondary}</span>}</span>;
export const ListItemSecondaryAction = fwd('div');

// ── Tabs ─────────────────────────────────────────────────────────────────────
export const Tabs = ({
  children, value: currentValue, onChange, variant: _variant, scrollButtons: _sb, sx: _sx, ...rest
}: AnyProps & { value?: unknown; onChange?: (e: React.SyntheticEvent, val: unknown) => void; variant?: string; scrollButtons?: unknown }) => {
  const cloned = React.Children.map(children as React.ReactNode, (child) => {
    if (!React.isValidElement(child)) return child;
    return React.cloneElement(child as React.ReactElement<AnyProps>, {
      _tabsOnChange: onChange,
      _tabsCurrentValue: currentValue,
    });
  });
  return <div role="tablist" {...(rest as object)}>{cloned}</div>;
};
export const Tab = ({
  label, value, sx: _sx, onClick, _tabsOnChange, _tabsCurrentValue, ...rest
}: AnyProps & {
  label?: React.ReactNode; value?: unknown;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  _tabsOnChange?: (e: React.SyntheticEvent, val: unknown) => void;
  _tabsCurrentValue?: unknown;
}) => {
  const isSelected = value === _tabsCurrentValue;
  return (
    <button
      role="tab"
      aria-selected={isSelected}
      onClick={(e) => { onClick?.(e); _tabsOnChange?.(e as unknown as React.SyntheticEvent, value); }}
      {...(rest as object)}
    >
      {label}
    </button>
  );
};

// ── Toggle ───────────────────────────────────────────────────────────────────
export const ToggleButtonGroup = ({ children, value: _v, exclusive: _e, onChange: _o, size: _s, sx: _sx, ...rest }: AnyProps & { value?: unknown; exclusive?: boolean; onChange?: unknown; size?: string }) =>
  <div {...(rest as object)}>{children}</div>;
export const ToggleButton = ({ children, value, sx: _sx, ...rest }: AnyProps & { value?: unknown }) =>
  <button data-value={value as string} {...(rest as object)}>{children}</button>;

// ── Table ─────────────────────────────────────────────────────────────────────
export const TableContainer = fwd('div');
export const Table          = fwd('table');
export const TableHead      = fwd('thead');
export const TableBody      = fwd('tbody');
export const TableFooter    = fwd('tfoot');
export const TableRow       = fwd('tr');
export const TableCell      = ({ children, align: _a, sx: _sx, sortDirection: _sd, ...rest }: AnyProps & { align?: string; sortDirection?: unknown }) =>
  <td {...(rest as object)}>{children}</td>;
export const TableSortLabel = ({ children, active: _a, direction: _d, onClick, sx: _sx, ...rest }: AnyProps & { active?: boolean; direction?: string }) =>
  <span role="button" onClick={onClick as React.MouseEventHandler} {...(rest as object)}>{children}</span>;
export const TablePagination = fwd('div');

// ── Surfaces / overlays ──────────────────────────────────────────────────────
export const Avatar = ({ children, sx: _sx, ...rest }: AnyProps) =>
  <div {...(rest as object)}>{children}</div>;
export const Chip = ({ label, size: _s, color: _c, variant: _v, sx: _sx, onDelete: _od, ...rest }: AnyProps & { label?: React.ReactNode; size?: string; color?: string; variant?: string; onDelete?: unknown }) =>
  <span {...(rest as object)}>{label}</span>;
export const Badge  = fwd('span');
export const Divider = ({ sx: _sx, ...rest }: AnyProps) => <hr {...(rest as object)} />;
export const Tooltip = ({ children, title: _t, sx: _sx, ...rest }: AnyProps & { title?: React.ReactNode }) =>
  <>{children}</>;

// ── Menus / Popovers ─────────────────────────────────────────────────────────
export const Menu       = ({ children, open, anchorEl: _a, onClose: _oc, sx: _sx, ...rest }: AnyProps & { open?: boolean; anchorEl?: unknown; onClose?: unknown }) =>
  open ? <div {...(rest as object)}>{children}</div> : null;
export const MenuList   = fwd('ul');
export const Popover    = fwd('div');
export const Popper     = fwd('div');

// ── Dialog ───────────────────────────────────────────────────────────────────
export const Dialog             = ({ children, open, onClose: _oc, sx: _sx, ...rest }: AnyProps & { open?: boolean; onClose?: unknown }) =>
  open ? <div role="dialog" {...(rest as object)}>{children}</div> : null;
export const DialogTitle        = fwd('h2');
export const DialogContent      = fwd('div');
export const DialogContentText  = fwd('p');
export const DialogActions      = fwd('div');

// ── SvgIcon ──────────────────────────────────────────────────────────────────
export const SvgIcon = ({ children, sx: _sx, inheritViewBox: _iv, component: _c, ...rest }: AnyProps & { inheritViewBox?: boolean; component?: unknown }) =>
  <svg aria-hidden {...(rest as object)}>{children}</svg>;

// ── Misc ─────────────────────────────────────────────────────────────────────
export const Collapse = ({ children, in: _in, ...rest }: AnyProps & { in?: boolean }) => <div {...(rest as object)}>{children}</div>;
export const Fade     = ({ children, in: _in, ...rest }: AnyProps & { in?: boolean }) => <div {...(rest as object)}>{children}</div>;
export const Grow     = fwd('div');
export const Slide    = fwd('div');
export const Zoom     = fwd('div');
export const Portal   = fwd('div');
export const Backdrop = ({ children, open: _o, sx: _sx, ...rest }: AnyProps & { open?: boolean }) => <div {...(rest as object)}>{children}</div>;
export const Modal    = ({ children, open, onClose: _oc, sx: _sx, ...rest }: AnyProps & { open?: boolean; onClose?: unknown }) =>
  open ? <div role="presentation" {...(rest as object)}>{children}</div> : null;
export const CssBaseline    = () => null;
export const GlobalStyles   = () => null;
export const ThemeProvider  = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const StyledEngineProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const useMediaQuery  = () => false;
export const useTheme       = () => ({});
export const createTheme    = () => ({});

// ── Accordion ────────────────────────────────────────────────────────────────
export const Accordion        = fwd('div');
export const AccordionSummary = fwd('div');
export const AccordionDetails = fwd('div');

// ── Pagination ───────────────────────────────────────────────────────────────
export const Pagination     = fwd('nav');
export const PaginationItem = fwd('button');

// ── Radio / Checkbox / Switch ─────────────────────────────────────────────────
export const Radio             = (props: AnyProps) => <input type="radio" {...(props as object)} />;
export const RadioGroup        = fwd('div');
export const Checkbox          = (props: AnyProps) => <input type="checkbox" {...(props as object)} />;
export const Switch            = ({ sx: _sx, ...props }: AnyProps) => <input type="checkbox" {...(props as object)} />;
export const FormControlLabel  = ({ label, control, sx: _sx, ...rest }: AnyProps & { label?: React.ReactNode; control?: React.ReactNode }) =>
  <label {...(rest as object)}>{control}{label}</label>;
export const FormGroup         = fwd('div');

// styles sub-package
export const styled = (tag: string | React.ComponentType) => {
  return (..._args: unknown[]) => {
    const Component = typeof tag === 'string' ? (props: AnyProps) => React.createElement(tag, props as object) : tag;
    return Component;
  };
};
