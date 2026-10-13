export const MOCHI_REACTION_STYLES=`
.mochi-view .mochi-reactions,.mochi-view .mochi-reaction-palette,.mochi-sheet .mochi-reaction-palette{display:flex;flex-wrap:wrap;gap:5px;min-width:0;max-width:100%;margin-top:5px}
.mochi-view .mochi-reactions:empty{display:none}
.mochi-view .mochi-reaction{font:inherit;font-size:12px;color:inherit;min-height:32px;padding:4px 8px;border:1px solid var(--mochi-border);border-radius:12px;background:var(--lp-surface-2,#ffffff0c);cursor:pointer;max-width:100%}.mochi-view .mochi-reaction-palette .mochi-reaction{min-width:44px;min-height:44px;font-size:20px}
.mochi-view .mochi-reaction[aria-pressed=true]{border-color:var(--mochi-accent);background:var(--lp-surface-2,#ffffff18)}.mochi-view .mochi-reaction:focus-visible{outline:2px solid var(--mochi-accent);outline-offset:2px}
.mochi-sheet .mochi-reaction{min-width:44px;min-height:44px;font-size:20px;border-radius:12px;border:1px solid var(--mochi-border);background:var(--lp-surface-2,#ffffff0c);color:inherit;cursor:pointer}.mochi-sheet .mochi-reaction:focus-visible{outline:2px solid var(--mochi-accent);outline-offset:2px}.mochi-sheet .mochi-reaction[aria-pressed=true]{border-color:var(--mochi-accent)}
`
