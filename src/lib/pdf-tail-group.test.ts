import { describe, it, expect } from 'vitest';
import {
    splitItemsForTail,
    buildTailTableHtml,
    buildColGroup,
    wrapTailGroup,
    DEFAULT_TAIL_ROWS,
    ITEM_COLUMN_WIDTHS,
} from './pdf-tail-group';

const items = (n: number) => Array.from({ length: n }, (_, i) => `item-${i + 1}`);

describe('splitItemsForTail', () => {
    it('hands the last rows to the tail on a long list', () => {
        const { head, tail } = splitItemsForTail(items(20));

        expect(tail).toEqual(['item-18', 'item-19', 'item-20']);
        expect(head).toHaveLength(17);
        expect([...head, ...tail]).toEqual(items(20));
    });

    // A short quote fits on one page regardless. Splitting it would risk
    // pushing the tail group onto a second page for no reason at all.
    it('keeps everything in the head when the list is too short to give rows away', () => {
        expect(splitItemsForTail(items(4)).tail).toEqual([]);
        expect(splitItemsForTail(items(4)).head).toHaveLength(4);
    });

    // The boundary: with DEFAULT_TAIL_ROWS = 3 the table must still keep 2 rows,
    // so 5 is the first length that may split. A header plus one lonely row
    // looks as broken as the empty page this exists to prevent.
    it('splits at five rows but not at four', () => {
        expect(splitItemsForTail(items(5)).head).toHaveLength(2);
        expect(splitItemsForTail(items(5)).tail).toHaveLength(3);
        expect(splitItemsForTail(items(4)).tail).toEqual([]);
    });

    it('never loses or duplicates a row', () => {
        for (let n = 0; n <= 30; n++) {
            const { head, tail } = splitItemsForTail(items(n));
            expect([...head, ...tail]).toEqual(items(n));
        }
    });

    it('treats a zero or negative tail count as "do not split"', () => {
        expect(splitItemsForTail(items(20), 0).tail).toEqual([]);
        expect(splitItemsForTail(items(20), -3).tail).toEqual([]);
    });

    it('does not mutate the input', () => {
        const original = items(10);
        const copy = [...original];
        splitItemsForTail(original);
        expect(original).toEqual(copy);
    });

    it('defaults to three tail rows', () => {
        expect(DEFAULT_TAIL_ROWS).toBe(3);
        expect(splitItemsForTail(items(20)).tail).toHaveLength(3);
    });
});

describe('buildColGroup', () => {
    // Both tables must state the same widths, or the two halves disagree about
    // where each column starts and the split becomes visible as a jog.
    it('emits one col per width', () => {
        const html = buildColGroup();

        expect(html.match(/<col /g)).toHaveLength(ITEM_COLUMN_WIDTHS.length);
        for (const w of ITEM_COLUMN_WIDTHS) expect(html).toContain(`width:${w}`);
    });
});

describe('buildTailTableHtml', () => {
    it('wraps the tail rows in a table carrying the same column widths', () => {
        const html = buildTailTableHtml('<tr><td>x</td></tr>');

        expect(html).toContain('<tr><td>x</td></tr>');
        for (const w of ITEM_COLUMN_WIDTHS) expect(html).toContain(`width:${w}`);
    });

    // A repeated header would read as a new section rather than the same list
    // continuing onto the next page.
    it('does not repeat the table header', () => {
        expect(buildTailTableHtml('<tr><td>x</td></tr>')).not.toContain('<th');
    });

    it('closes the hairline between the two halves', () => {
        expect(buildTailTableHtml('<tr><td>x</td></tr>')).toContain('margin-top:-1px');
    });

    it('produces nothing for an empty tail', () => {
        expect(buildTailTableHtml('')).toBe('');
    });
});

describe('wrapTailGroup', () => {
    it('asks the renderer to keep the group whole, in both spellings', () => {
        const html = wrapTailGroup('<p>totals</p>');

        expect(html).toContain('page-break-inside:avoid');
        expect(html).toContain('break-inside:avoid');
        expect(html).toContain('<p>totals</p>');
    });
});
