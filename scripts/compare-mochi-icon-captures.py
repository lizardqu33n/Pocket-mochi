"""Compare sequential Phase 3 captures with retained Phase 2 captures (Pillow).
Set MOCHI_ICON_BASELINE to the directory containing phase2-THEME-WIDTH-after.
No application, data store or network access is used.
"""
from PIL import Image, ImageChops
from pathlib import Path
import hashlib, json, os

root = Path(__file__).resolve().parent.parent
baseline = Path(os.environ.get('MOCHI_ICON_BASELINE', str(root.parent / 'Pocket-mochi' / 'tmp')))
entries = []
for folder in ['phase3-final-1280', 'phase3-final-390', 'phase3-final-320']:
    for path in sorted((root / 'tmp' / folder).glob('*.png')):
        theme, width = path.name.split('-')[:2]
        before = baseline / f'phase2-{theme}-{width}-after' / path.name
        record = {'scene': path.name, 'afterSHA256': hashlib.sha256(path.read_bytes()).hexdigest()}
        if before.exists():
            old, new = Image.open(before).convert('RGB'), Image.open(path).convert('RGB')
            assert old.size == new.size
            diff = ImageChops.difference(old, new)
            red, green, blue = diff.split()
            changed = old.width * old.height - ImageChops.lighter(ImageChops.lighter(red, green), blue).histogram()[0]
            record.update(beforeSHA256=hashlib.sha256(before.read_bytes()).hexdigest(), changedPixels=changed,
                          changedFraction=round(changed / (old.width * old.height), 6), differenceBounds=diff.getbbox())
        entries.append(record)
compared = [entry for entry in entries if 'changedPixels' in entry]
assert len(entries) == 376, 'Finish all four palettes at 1280/390/320 before recording evidence.'
assert len(compared) == 376, 'All retained Phase 2 baselines are required for comparison.'
gallery = json.loads((root / 'tmp/phase3-icons/results.json').read_text())
production = json.loads((root / 'tmp/phase3-production/results.json').read_text())
result = {'base': 'b6ee1accc5bd73afbf1760b3af4bbb1623d37d56', 'captures': len(entries),
          'comparedToPhase2': len(compared), 'pixelIdentical': sum(entry['changedPixels'] == 0 for entry in compared),
          'maxChangedFraction': max(entry['changedFraction'] for entry in compared), 'iconCases': gallery, 'productionCases': production,
          'note': 'Icon artwork and glyph footprints intentionally change; screenshot equality is not claimed. '
                  'Layout/overflow and interaction assertions run in the sequential synthetic browser matrix.', 'entries': entries}
(root / 'src/mochi/ui/phase3-validation.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({key: value for key, value in result.items() if key not in ['entries', 'iconCases', 'productionCases']}, indent=2))
