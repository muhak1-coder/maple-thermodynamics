"""Regenerate the public blueprint PDF from its reviewed Markdown source.

Editorial utility only: requires reportlab. GitHub Pages builds use the committed PDF.
"""
from pathlib import Path
import json
import re
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

root = Path(__file__).resolve().parent.parent
font_candidates = [Path('C:/Windows/Fonts/arial.ttf'), Path('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')]
font_path = next((p for p in font_candidates if p.exists()), None)
if font_path is None:
    raise SystemExit('Install Arial or DejaVu Sans for Unicode mathematical characters.')
bold = font_path.with_name('arialbd.ttf' if font_path.name == 'arial.ttf' else 'DejaVuSans-Bold.ttf')
pdfmetrics.registerFont(TTFont('Academy', str(font_path)))
pdfmetrics.registerFont(TTFont('AcademyBold', str(bold)))
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='AcademyBody', fontName='Academy', fontSize=9.3, leading=14, spaceAfter=8))
styles.add(ParagraphStyle(name='AcademyTitle', fontName='AcademyBold', fontSize=20, leading=25, textColor=colors.HexColor('#163653'), spaceAfter=16))
styles.add(ParagraphStyle(name='AcademyHeading', fontName='AcademyBold', fontSize=12, leading=17, spaceBefore=12, spaceAfter=7, keepWithNext=True, textColor=colors.HexColor('#163653')))
styles.add(ParagraphStyle(name='AcademyCell', parent=styles['AcademyBody'], fontSize=8, leading=11, spaceAfter=0))
source = root / 'content/downloads/MAPLE_Phase_A_Blueprint.md'
target = source.with_suffix('.pdf')
lines = source.read_text(encoding='utf-8').splitlines()
story = []

def text(value):
    value = escape(value)
    return re.sub(r'https://[^\s<]+', lambda m: '<link href="'+m.group(0)+'" color="#175ec8">'+m.group(0)+'</link>', value)

i = 0
while i < len(lines):
    line = lines[i].strip()
    if not line:
        i += 1
        continue
    if line.startswith('|'):
        rows = []
        while i < len(lines) and lines[i].strip().startswith('|'):
            cells = [v.strip() for v in lines[i].strip().strip('|').split('|')]
            if not all(re.fullmatch(r'[-: ]+', v) for v in cells):
                rows.append([Paragraph(text(v), styles['AcademyCell']) for v in cells])
            i += 1
        table = Table(rows, colWidths=[55, 155, 160, 126], repeatRows=1, hAlign='LEFT')
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#eaf2ff')),
            ('GRID', (0, 0), (-1, -1), .4, colors.HexColor('#c5d2df')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6), ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 6)
        ]))
        story.extend([table, Spacer(1, 10)])
        continue
    if line.startswith('# '):
        story.append(Paragraph(text(line[2:]), styles['AcademyTitle']))
    elif line.startswith('## '):
        story.append(Paragraph(text(line[3:]), styles['AcademyHeading']))
    else:
        story.append(Paragraph(text(line), styles['AcademyBody']))
    i += 1

def footer(canvas, doc):
    canvas.setFont('Academy', 8)
    canvas.setFillColor(colors.HexColor('#536980'))
    canvas.drawString(58, 28, 'MAPLE THERMODYNAMICS ACADEMY | Public blueprint revision')
    canvas.drawRightString(554, 28, str(doc.page))

doc = SimpleDocTemplate(str(target), pagesize=letter, leftMargin=58, rightMargin=58, topMargin=45, bottomMargin=46,
                        title='Maple Thermodynamics Academy - Public Phase A Blueprint', author='Maple Thermodynamics Academy')
doc.build(story, onFirstPage=footer, onLaterPages=footer)
manifest_path = root / 'content/content_manifest.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
for resource in manifest['resources']:
    if resource['path'] in ['downloads/'+target.name, 'downloads/'+source.name]:
        resource['size_bytes'] = (root/'content'/resource['path']).stat().st_size
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print('Regenerated public blueprint PDF and manifest sizes.')
