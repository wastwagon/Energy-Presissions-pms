import React from 'react';
import { Box, Typography } from '@mui/material';

/** Split body into blocks: headings, paragraphs, bullet lists. */
export type PortfolioBodyBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] };

export function parsePortfolioBody(body: string | undefined, fallback = ''): PortfolioBodyBlock[] {
  const raw = (body || '').trim();
  const source = raw || fallback.trim();
  if (!source) return [];

  const lines = source.split('\n');
  const blocks: PortfolioBodyBlock[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    const text = paragraph.join('\n').trim();
    if (text) blocks.push({ type: 'paragraph', text });
    paragraph = [];
  };

  const flushList = () => {
    if (listItems.length) blocks.push({ type: 'list', items: listItems });
    listItems = [];
  };

  for (const line of lines) {
    const heading = line.match(/^##\s+(.+)\s*$/);
    const bullet = line.match(/^[-*]\s+(.+)\s*$/);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'heading', text: heading[1].trim() });
      continue;
    }
    if (bullet) {
      flushParagraph();
      listItems.push(bullet[1].trim());
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}

/** Render **bold** and *italic* inline markers safely (no HTML). */
export function renderPortfolioInline(text: string): React.ReactNode {
  const nodes: React.ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const token = match[0];
    if (token.startsWith('**')) {
      nodes.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else {
      nodes.push(<em key={key++}>{token.slice(1, -1)}</em>);
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes.length ? nodes : text;
}

type PortfolioBodyViewProps = {
  body?: string;
  fallback?: string;
  paragraphSx?: object;
  headingSx?: object;
};

export const PortfolioBodyView: React.FC<PortfolioBodyViewProps> = ({
  body,
  fallback = '',
  paragraphSx,
  headingSx,
}) => {
  const blocks = parsePortfolioBody(body, fallback);
  if (!blocks.length) return null;

  return (
    <Box>
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <Typography key={index} component="h3" sx={{ fontWeight: 800, mb: 1.25, mt: index ? 2 : 0, ...headingSx }}>
              {renderPortfolioInline(block.text)}
            </Typography>
          );
        }
        if (block.type === 'list') {
          return (
            <Box key={index} component="ul" sx={{ m: 0, mb: 2, pl: 2.5, ...paragraphSx }}>
              {block.items.map((item, i) => (
                <Typography key={i} component="li" sx={{ mb: 0.75, ...paragraphSx }}>
                  {renderPortfolioInline(item)}
                </Typography>
              ))}
            </Box>
          );
        }
        return (
          <Typography key={index} sx={{ mb: 2, whiteSpace: 'pre-wrap', ...paragraphSx }}>
            {renderPortfolioInline(block.text)}
          </Typography>
        );
      })}
    </Box>
  );
};
