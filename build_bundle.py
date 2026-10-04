# -*- coding: utf-8 -*-
"""
Bundles the ADsP Master App into a single self-contained standalone HTML file
and a unified bundle.js.
Supports PWA (Progressive Web App), Mobile Installation, PDF Print Styles, and Offline Operation.
"""
import os

base_dir = os.path.dirname(os.path.abspath(__file__))

# Component files in dependency order
components = [
    os.path.join(base_dir, "js", "MarkdownText.js"),
    os.path.join(base_dir, "js", "DashboardView.js"),
    os.path.join(base_dir, "js", "ConceptBookView.js"),
    os.path.join(base_dir, "js", "ExamSelectView.js"),
    os.path.join(base_dir, "js", "ExamRunnerView.js"),
    os.path.join(base_dir, "js", "QuizCornerView.js"),
    os.path.join(base_dir, "js", "WrongNotesView.js"),
    os.path.join(base_dir, "js", "SearchView.js"),
    os.path.join(base_dir, "js", "app.js")
]

bundle_js_content = """// ADsP Master Unified Bundle
const { useState, useEffect, useMemo, useRef, useCallback } = React;
"""
for c_path in components:
    with open(c_path, "r", encoding="utf-8") as f:
        bundle_js_content += f"\n// === {os.path.basename(c_path)} ===\n" + f.read() + "\n"

bundle_path = os.path.join(base_dir, "js", "bundle.js")
with open(bundle_path, "w", encoding="utf-8") as f:
    f.write(bundle_js_content)

print(f"Created {bundle_path} ({os.path.getsize(bundle_path):,} bytes)")

# Update index.html to use bundle.js cleanly
index_html = f"""<!DOCTYPE html>
<html lang="ko" class="h-full">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>ADsP 마스터 - 데이터분석 준전문가 기출문제 풀이 & 비전공자 개념서</title>

  <!-- PWA & Mobile Web App Meta Tags -->
  <link rel="manifest" href="manifest.json" />
  <meta name="theme-color" content="#4F46E5" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="ADsP마스터" />
  <link rel="apple-touch-icon" href="icons/apple-touch-icon.png" />
  <link rel="icon" type="image/png" href="icons/icon-192.png" />

  <!-- Pretendard Korean Font -->
  <link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {{
      darkMode: 'class',
      theme: {{
        extend: {{
          fontFamily: {{
            sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
          }},
          animation: {{
            fadeIn: 'fadeIn 0.25s ease-out forwards',
            bounceShort: 'bounceShort 0.5s ease-in-out',
          }},
          keyframes: {{
            fadeIn: {{
              '0%': {{ opacity: '0', transform: 'translateY(6px)' }},
              '100%': {{ opacity: '1', transform: 'translateY(0)' }},
            }},
            bounceShort: {{
              '0%, 100%': {{ transform: 'scale(1)' }},
              '50%': {{ transform: 'scale(1.05)' }},
            }}
          }}
        }}
      }}
    }};
  </script>

  <!-- Canvas Confetti for Celebration -->
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>

  <!-- React 18 & ReactDOM 18 -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

  <!-- Babel Standalone for JSX -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <style>
    html, body {{
      font-family: 'Pretendard', sans-serif;
    }}
    ::-webkit-scrollbar {{
      width: 6px;
      height: 6px;
    }}
    ::-webkit-scrollbar-track {{
      background: transparent;
    }}
    ::-webkit-scrollbar-thumb {{
      background: rgba(156, 163, 175, 0.5);
      border-radius: 9999px;
    }}
    ::-webkit-scrollbar-thumb:hover {{
      background: rgba(107, 114, 128, 0.8);
    }}
    @media print {{
      header, nav, footer, .print\\:hidden {{
        display: none !important;
      }}
      .print\\:block {{
        display: block !important;
      }}
      body {{
        background: white !important;
        color: black !important;
      }}
      .page-break-after-always {{
        page-break-after: always;
      }}
      .page-break-inside-avoid {{
        page-break-inside: avoid;
      }}
    }}
  </style>
</head>
<body class="h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-indigo-500 selection:text-white">
  <div id="root">
    <div class="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div class="w-12 h-12 rounded-2xl bg-indigo-600 animate-spin flex items-center justify-center text-white font-bold">
        AD
      </div>
      <p class="text-sm font-bold text-slate-600">ADsP 마스터 앱을 불러오는 중입니다...</p>
    </div>
  </div>

  <!-- Data Sets -->
  <script src="data/examSets.js?v=48"></script>
  <script src="data/quizSets.js?v=48"></script>
  <script src="data/conceptBookData.js?v=48"></script>

  <!-- Unified Inlined Bundle for 100% Reliable Execution (Both file:/// and http://) -->
  <script type="text/babel">
{bundle_js_content}

    // Error Boundary Component
    class GlobalErrorBoundary extends React.Component {{
      constructor(props) {{
        super(props);
        this.state = {{ hasError: false, error: null }};
      }}
      static getDerivedStateFromError(error) {{
        return {{ hasError: true, error }};
      }}
      componentDidCatch(error, errorInfo) {{
        console.error("ErrorBoundary caught:", error, errorInfo);
      }}
      render() {{
        if (this.state.hasError) {{
          return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-center">
              <div className="max-w-md w-full p-8 bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900 shadow-xl space-y-4">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center text-2xl font-bold">
                  ⚠️
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">화면 표시 중 오류가 발생했습니다</h2>
                <p className="text-xs text-rose-500 font-mono bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl break-all">
                  {{this.state.error?.toString() || '오류 발생'}}
                </p>
                <button
                  onClick={{() => {{ this.setState({{ hasError: false, error: null }}); window.location.reload(); }}}}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  새로고침하여 복구하기
                </button>
              </div>
            </div>
          );
        }}
        return this.props.children;
      }}
    }}

    // Mount
    const rootElement = document.getElementById('root');
    if (rootElement && window.ADSP_APP) {{
      const root = ReactDOM.createRoot(rootElement);
      root.render(
        <GlobalErrorBoundary>
          <window.ADSP_APP />
        </GlobalErrorBoundary>
      );
    }}
  </script>

  <!-- PWA Service Worker Registration -->
  <script>
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {{
      window.addEventListener('load', () => {{
        navigator.serviceWorker.register('./sw.js').then(reg => {{
          console.log('[PWA] Service Worker registered successfully', reg.scope);
        }}).catch(err => {{
          console.log('[PWA] Service Worker registration failed', err);
        }});
      }});
    }}
  </script>
</body>
</html>
"""

index_path = os.path.join(base_dir, "index.html")
with open(index_path, "w", encoding="utf-8") as f:
    f.write(index_html)

print(f"Updated {index_path} ({os.path.getsize(index_path):,} bytes). Ready for instant execution!")
