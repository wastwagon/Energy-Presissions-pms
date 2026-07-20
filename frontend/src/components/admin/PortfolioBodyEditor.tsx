import React, { useRef } from 'react';
import { Box, Button, ButtonGroup, Stack, TextField, Typography } from '@mui/material';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

const wrapSelection = (
  value: string,
  start: number,
  end: number,
  before: string,
  after: string,
  placeholder: string,
) => {
  const selected = value.slice(start, end) || placeholder;
  const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
  const cursor = start + before.length + selected.length + after.length;
  return { next, cursor };
};

const PortfolioBodyEditor: React.FC<Props> = ({ value, onChange }) => {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const apply = (before: string, after: string, placeholder: string) => {
    const el = ref.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const { next, cursor } = wrapSelection(value, start, end, before, after, placeholder);
    onChange(next);
    requestAnimationFrame(() => {
      if (!ref.current) return;
      ref.current.focus();
      ref.current.setSelectionRange(cursor, cursor);
    });
  };

  const insertLinePrefix = (prefix: string, placeholder: string) => {
    const el = ref.current;
    const start = el?.selectionStart ?? value.length;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const end = el?.selectionEnd ?? start;
    const selected = value.slice(start, end) || placeholder;
    const next = `${value.slice(0, lineStart)}${prefix}${selected}${value.slice(end)}`;
    onChange(next);
    requestAnimationFrame(() => {
      if (!ref.current) return;
      ref.current.focus();
      const cursor = lineStart + prefix.length + selected.length;
      ref.current.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <Box sx={{ mb: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }} flexWrap="wrap" useFlexGap>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
          Case study body
        </Typography>
        <ButtonGroup size="small" variant="outlined">
          <Button onClick={() => apply('**', '**', 'bold text')}>Bold</Button>
          <Button onClick={() => apply('*', '*', 'italic text')}>Italic</Button>
          <Button onClick={() => insertLinePrefix('## ', 'Section heading')}>Heading</Button>
          <Button onClick={() => insertLinePrefix('- ', 'List item')}>Bullet</Button>
        </ButtonGroup>
      </Stack>
      <TextField
        size="small"
        fullWidth
        value={value}
        onChange={(e) => onChange(e.target.value)}
        multiline
        minRows={5}
        inputRef={ref}
        placeholder={'Write the project story…\n\n## What we installed\n- Hybrid inverter\n- Lithium storage\n\nUse **bold** and *italic* as needed.'}
        helperText="Lightweight formatting: ## heading, **bold**, *italic*, - bullets. Separate paragraphs with a blank line."
      />
    </Box>
  );
};

export default PortfolioBodyEditor;
