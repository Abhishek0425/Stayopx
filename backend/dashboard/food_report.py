from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from datetime import date
from io import BytesIO

W, H = landscape(A4)
MARGIN = 10 * mm
FW     = W - 2 * MARGIN

C_HDR_BG  = colors.HexColor('#4a5fa5')
C_HDR_TXT = colors.white
C_HDR_SUB = colors.HexColor('#d0d8f0')
C_TH_BG   = colors.HexColor('#1a1a2e')
C_TH_TXT  = colors.white
C_BORDER  = colors.HexColor('#999999')
C_DAY_BG  = colors.HexColor('#f4f4f4')
C_WHITE   = colors.white
C_DARK    = colors.HexColor('#1a1a1a')
C_MUTED   = colors.HexColor('#888888')

def _p(txt, fn='Helvetica', sz=8, col=None, al=TA_LEFT, lead=10.5):
    if col is None: col = C_DARK
    return Paragraph(str(txt) if txt else '',
                     ParagraphStyle('x', fontName=fn, fontSize=sz,
                                    textColor=col, alignment=al,
                                    leading=lead, spaceAfter=0, spaceBefore=0))

def generate_food_pdf(property_name, property_code, week_label, menu_data):
    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=landscape(A4),
                            leftMargin=MARGIN, rightMargin=MARGIN,
                            topMargin=MARGIN, bottomMargin=5*mm)
    story = []

    # ── Header banner as a table ──────────────────────────────────
    hdr = Table([[
        Paragraph(f'<b>{property_name}</b><br/>'
                  f'<font size="9" color="#d0d8f0">{property_code}</font>',
                  ParagraphStyle('hn', fontName='Helvetica-Bold', fontSize=13,
                                 textColor=C_HDR_TXT, leading=18)),
        Paragraph('<font color="#d0d8f0">●  STAYOPX</font>',
                  ParagraphStyle('lo', fontName='Helvetica-Bold', fontSize=9,
                                 textColor=C_HDR_TXT, alignment=TA_RIGHT, leading=12)),
    ]], colWidths=[FW * 0.78, FW * 0.22])
    hdr.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(-1,-1), C_HDR_BG),
        ('VALIGN',        (0,0),(-1,-1), 'MIDDLE'),
        ('TOPPADDING',    (0,0),(-1,-1), 10),
        ('BOTTOMPADDING', (0,0),(-1,-1), 10),
        ('LEFTPADDING',   (0,0),(0,0),   10),
        ('RIGHTPADDING',  (-1,0),(-1,-1),10),
    ]))
    story.append(hdr)
    story.append(Spacer(1, 3))
    story.append(_p(week_label, sz=7.5, col=C_MUTED))
    story.append(Spacer(1, 3))

    # ── Column widths ─────────────────────────────────────────────
    CW_DAY = 16 * mm
    CW_BF  = (FW - CW_DAY) * 0.215
    CW_LN  = (FW - CW_DAY) * 0.285
    CW_SN  = (FW - CW_DAY) * 0.185
    CW_DN  = (FW - CW_DAY) * 0.315
    col_w  = [CW_DAY, CW_BF, CW_LN, CW_SN, CW_DN]

    def th(t): return _p(t,'Helvetica-Bold',8.5,C_TH_TXT,TA_CENTER,11)
    def dc(t): return _p(t,'Helvetica-Bold',8,C_DARK,TA_LEFT,11)
    def td(t): return _p(t or '','Helvetica',7.5,C_DARK,TA_LEFT,10.5)

    rows = [[th('Day'),th('Breakfast'),th('Lunch'),th('Snacks'),th('Dinner')]]
    for r in menu_data:
        rows.append([dc(r.get('day','')), td(r.get('breakfast','')),
                     td(r.get('lunch','')), td(r.get('snacks','')),
                     td(r.get('dinner',''))])

    tbl = Table(rows, colWidths=col_w, repeatRows=1)
    tbl.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(-1,0),  C_TH_BG),
        ('ALIGN',         (0,0),(-1,0),  'CENTER'),
        ('TOPPADDING',    (0,0),(-1,0),  5),
        ('BOTTOMPADDING', (0,0),(-1,0),  5),
        ('BACKGROUND',    (0,1),(-1,-1), C_WHITE),
        ('BACKGROUND',    (0,1),(0,-1),  C_DAY_BG),
        ('VALIGN',        (0,0),(-1,-1), 'TOP'),
        ('VALIGN',        (0,1),(0,-1),  'MIDDLE'),
        ('TOPPADDING',    (0,1),(-1,-1), 4),
        ('BOTTOMPADDING', (0,1),(-1,-1), 4),
        ('LEFTPADDING',   (0,0),(-1,-1), 4),
        ('RIGHTPADDING',  (0,0),(-1,-1), 4),
        ('BOX',           (0,0),(-1,-1), 0.75, C_BORDER),
        ('INNERGRID',     (0,0),(-1,-1), 0.4,  C_BORDER),
        ('LINEBELOW',     (0,0),(-1,0),  1.2,  C_TH_BG),
    ]))
    story.append(tbl)
    story.append(Spacer(1, 3))
    story.append(_p(
        f'Generated: {date.today().strftime("%d %b %Y")}  ·  Stayopx Platform',
        sz=7, col=C_MUTED, al=TA_RIGHT))

    doc.build(story)
    buf.seek(0)
    return buf.read()
