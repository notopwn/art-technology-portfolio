# Art & Technology Portfolio

DigitalTactillity, FinderNode, PhotoEditor, EliteComposer를 소개하는 한국어·영어 정적 포트폴리오입니다.

- `index.html`: 프로젝트 소개
- `digitaltactillity.html`: DigitalTactillity 상세
- `findernode.html`: FinderNode 상세
- `assets/`: 실제 앱 화면, 영상, 포트폴리오 PDF와 웹 폰트

외부 라이브러리나 빌드 없이 동작합니다. GitHub Pages는 `main` 브랜치의 루트 폴더에서 배포합니다.

앱 화면과 영상은 프로젝트 제작자가 제공한 실제 결과물입니다. 각 프로젝트의 과정 보고서를 함께 제공합니다. 앱 원본 코드와 API 키는 포함하지 않습니다. 코딩 에이전트와 협업해 구현했습니다.

한글 웹 폰트는 Noto Sans KR의 부분집합이며 SIL Open Font License로 배포됩니다. 라이선스: `assets/OFL.txt`.

## Languages

Korean pages live at the repository root; their English counterparts live in `en/`.
The language switch preserves the current project and section. First visits follow the first supported language in the browser preference list;
other languages fall back to English, and missing language information falls back to Korean.
An explicit URL choice or a manually saved choice takes priority over browser settings. PDFs and app screenshots retain their original language.

After editing Korean copy, update `scripts/translations.en.json` and run:

```sh
python scripts/build-locales.py
python scripts/check-locales.py
node scripts/test-locales.cjs
```

The generator fails on missing translations and produces static English pages that remain readable without JavaScript.
