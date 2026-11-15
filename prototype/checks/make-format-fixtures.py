"""Writes small original sample files for the import-a-format check (D-040) into docs/samples/formats/.
Nothing here is copied from any real template: the layout numbers are invented for testing.
Usage: python3 prototype/checks/make-format-fixtures.py
"""
import json, pathlib, zipfile

out = pathlib.Path(__file__).resolve().parents[2] / 'docs' / 'samples' / 'formats'
out.mkdir(parents=True, exist_ok=True)

# 1. An OpenAct format file.
fmt = {
    'kind': 'openact-format', 'version': 1, 'slug': 'fringe-house', 'name': 'Fringe house style',
    'blurb': 'An invented small-theatre layout for testing.', 'base': 'stage-uk', 'paper': 'a4',
    'marginLeft': 1.25, 'marginRight': 1.0,
    'styles': {
        'scene': {'left': 1.25, 'width': 60, 'before': 2, 'upper': True, 'bold': True},
        'action': {'left': 2.25, 'width': 50, 'before': 1, 'italic': True},
        'dialogue': {'left': 3.0, 'width': 40, 'before': 0},
    },
}
(out / 'fringe-house.openact-format.json').write_text(json.dumps(fmt, indent=2) + '\n')

# 2. A Final Draft style template (.fdxt), original numbers.
def el(t, style, left, right, before, align='Left', spacing='1', new='No'):
    return (f'  <ElementSettings Type="{t}">\n    <FontSpec Font="Courier Prime" Size="12" Style="{style}"/>\n'
            f'    <ParagraphSpec Alignment="{align}" LeftIndent="{left}" RightIndent="{right}" SpaceBefore="{before}" Spacing="{spacing}" StartsNewPage="{new}"/>\n  </ElementSettings>\n')
fdx = ('<?xml version="1.0" encoding="UTF-8" standalone="no" ?>\n<FinalDraft DocumentType="Template" Template="Yes" Version="3">\n'
       + el('Scene Heading', 'AllCaps+Bold', '1.25', '7.25', '24')
       + el('Action', '', '1.25', '7.25', '12')
       + el('Character', 'AllCaps', '3.50', '7.00', '12')
       + el('Parenthetical', 'Italic', '3.00', '5.50', '0')
       + el('Dialogue', '', '2.50', '6.50', '0')
       + el('Transition', 'AllCaps', '5.50', '7.25', '12', align='Right')
       + '  <PageLayout FooterMargin="0.50" HeaderMargin="0.50" TopMargin="1.00">\n    <PageSize Height="11.69" Width="8.27"/>\n    <PageMargins Bottom="1.00" Left="1.25" Right="1.00" Top="1.00"/>\n  </PageLayout>\n</FinalDraft>\n')
(out / 'example-screenplay.fdxt').write_text(fdx)

# 3. Word files (.docx and .dotx), original styles.
W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'
def style(sid, name, ppr='', rpr='', based='Normal', default=False):
    d = ' w:default="1"' if default else ''
    b = f'<w:basedOn w:val="{based}"/>' if based and not default else ''
    return f'<w:style w:type="paragraph"{d} w:styleId="{sid}"><w:name w:val="{name}"/>{b}<w:pPr>{ppr}</w:pPr><w:rPr>{rpr}</w:rPr></w:style>'
styles = (f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles {W}>'
          '<w:docDefaults><w:rPrDefault><w:rPr><w:sz w:val="24"/></w:rPr></w:rPrDefault></w:docDefaults>'
          + style('Normal', 'Normal', default=True)
          + style('SceneHeading', 'Scene Heading', '<w:spacing w:before="480"/><w:jc w:val="center"/>', '<w:caps/><w:b/>')
          + style('StageDirection', 'Stage Direction', '<w:spacing w:before="240"/><w:ind w:left="1440"/>', '<w:i/>')
          + style('Speaker', 'Speaker', '<w:spacing w:before="240"/>', '<w:caps/><w:b/>')
          + style('Speech', 'Speech', '<w:ind w:left="2160" w:right="720"/>')
          + style('Parenthetical', 'Parenthetical', '<w:ind w:left="2160"/>', '<w:i/>')
          + '</w:styles>')
def para(sid, text):
    return f'<w:p><w:pPr><w:pStyle w:val="{sid}"/></w:pPr><w:r><w:t>{text}</w:t></w:r></w:p>'
sect = '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>'
doc = (f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document {W}><w:body>'
       + para('SceneHeading', 'Scene 1: The kitchen') + para('StageDirection', 'Nell fills the kettle.')
       + para('Speaker', 'Nell') + para('Speech', 'Where did I leave it?') + sect + '</w:body></w:document>')
doc_empty = f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document {W}><w:body><w:p><w:r><w:t>Template</w:t></w:r></w:p></w:body></w:document>'
rels = '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
def ct(main):
    return ('<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>'
            f'<Override PartName="/word/document.xml" ContentType="{main}"/>'
            '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>')
def pack(path, main, body):
    with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('[Content_Types].xml', ct(main)); z.writestr('_rels/.rels', rels)
        z.writestr('word/document.xml', body); z.writestr('word/styles.xml', styles)
pack(out / 'example-stage.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml', doc)
pack(out / 'example-stage.dotx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml', doc_empty)

# 4. Files that should be refused with a clear message.
(out / 'not-a-template.fdx').write_text('this is not xml')
(out / 'old-word.doc').write_bytes(b'\xd0\xcf\x11\xe0 old binary word file')
(out / 'newer-version.openact-format.json').write_text(json.dumps({**fmt, 'version': 2}))
print('wrote', sorted(p.name for p in out.iterdir()))
