type SiteTotals = { clicks: number; impressions: number; ctr: number; position: number | null };

export const TREND_WINDOW_DAYS = 7;

// A week of this site carries single-digit clicks, so a percentage on its own
// invites reading noise as a trend: 16 -> 9 prints as -44% and means nothing.
// Below this many clicks the report says so instead of leaving the number bare.
const CLICKS_FOR_A_MEANINGFUL_TREND = 30;

export function delta(now: number, before: number): string {
    if (before === 0) return now > 0 ? '(nuevo)' : '';
    const pct = Math.round(((now - before) / before) * 100);
    if (pct === 0) return '(=)';
    return pct > 0 ? `(+${pct}%)` : `(${pct}%)`;
}

export function buildSiteBlock(now: SiteTotals, prev: SiteTotals): string[] {
    // A higher average position is a WORSE rank. The explanatory note used to
    // print unconditionally, so the 8 Sept report announced a worsening position
    // on a week it improved from 34.5 to 34.1.
    const positionWorsened =
        now.position !== null && prev.position !== null && now.position > prev.position;
    const impressionsRose = now.impressions > prev.impressions;

    return [
        '━━━━━━━━━━━━━━',
        `🌐 <b>Todo el sitio (${TREND_WINDOW_DAYS} días vs. anteriores):</b>`,
        `• Clics: <b>${now.clicks}</b> ${delta(now.clicks, prev.clicks)} · antes ${prev.clicks}`,
        `• Impresiones: <b>${now.impressions}</b> ${delta(now.impressions, prev.impressions)} · antes ${prev.impressions}`,
        `• CTR: <b>${(now.ctr * 100).toFixed(2)}%</b> · antes ${(prev.ctr * 100).toFixed(2)}%`,
        now.position !== null && prev.position !== null
            ? `• Posición media: <b>${now.position.toFixed(1)}</b> · antes ${prev.position.toFixed(1)}`
            : '',
        Math.max(now.clicks, prev.clicks) < CLICKS_FOR_A_MEANINGFUL_TREND
            ? `<i>Con ${now.clicks} clics en la semana, esa variación es ruido estadístico: haría falta superar ${CLICKS_FOR_A_MEANINGFUL_TREND} clics semanales para que el porcentaje signifique algo. Mira las impresiones y la posición media.</i>`
            : '',
        positionWorsened && impressionsRose
            ? '<i>Una posición media que empeora mientras suben las impresiones suele significar páginas nuevas entrando en el índice, no posiciones perdidas.</i>'
            : '',
        '',
    ].filter(Boolean);
}

export type { SiteTotals };
