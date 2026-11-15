# Sample format files

Small files for testing format import (D-040). They are written by `prototype/checks/make-format-fixtures.py` and **invented**: nothing here is copied from a real template, and the layout numbers are made up. Regenerate them with `python3 prototype/checks/make-format-fixtures.py`.

| File | What it tests |
|---|---|
| `fringe-house.openact-format.json` | An OpenAct format file based on the UK stage play |
| `example-screenplay.fdxt` | A Final Draft style template: six elements, A4, a 1.25 inch left margin |
| `example-stage.docx` | A Word document with named paragraph styles and an A4 page |
| `example-stage.dotx` | A Word template with the same styles and no page setup |
| `not-a-template.fdx`, `old-word.doc`, `newer-version.openact-format.json` | Files that should be refused with a clear message |

To try OpenAct on a real template, import your own file from the menu: **More, then Import a format file**.
