/**
 * 根页面——通过 meta refresh 重定向到中文首页
 * 静态导出模式下无法使用 redirect() 和 cookies()
 */
export default function RootPage() {
  return (
    <html>
      <head>
        <meta httpEquiv="refresh" content="0;url=/DreamPulse/zh" />
      </head>
      <body>
        <p>Redirecting to <a href="/DreamPulse/zh">DreamPulse</a>...</p>
      </body>
    </html>
  );
}
