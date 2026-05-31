import { query } from '@/lib/db/client';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { isValidLocale, DEFAULT_LOCALE } from '@/lib/i18n/config';
import type { ArticleRow, CategoryRow } from '@/lib/db/schema';

const FALLBACK_CATEGORIES: { slug: string; name: string; name_en: string; icon: string; color: string; }[] = [
  { slug: 'tech', name: '科技', name_en: 'Tech', icon: '⚡', color: '#818cf8' },
  { slug: 'society', name: '社会', name_en: 'Society', icon: '🏙️', color: '#34d399' },
  { slug: 'emotion', name: '情感', name_en: 'Emotion', icon: '❤️', color: '#f472b6' },
  { slug: 'sports', name: '体育', name_en: 'Sports', icon: '🏃', color: '#fb923c' },
  { slug: 'entertainment', name: '娱乐', name_en: 'Entertainment', icon: '🎬', color: '#c084fc' },
  { slug: 'video', name: '视频', name_en: 'Video', icon: '🎥', color: '#fbbf24' },
];

const FALLBACK_ARTICLES: Record<string, Array<{
  emoji: string; tag: string; title: string; desc: string; author: string; time: string;
}>> = {
  tech: [
    { emoji: '🤖', tag: 'AI', title: 'OpenAI 最新发布：多模态模型让机器终于「看懂」了世界', desc: '这一次，AI 不只是识别图像，而是真正理解了画面背后的故事与情感。', author: '张天宇', time: '1 小时前' },
    { emoji: '🛸', tag: '航天', title: '中国空间站迎来新一批航天员，这次有一项秘密任务', desc: '据知情人士透露，本次任务将测试多项首次在轨验证的前沿技术。', author: '刘宇航', time: '3 小时前' },
    { emoji: '🔬', tag: '科研', title: '量子计算新突破：科学家实现千公里级量子密钥分发', desc: '这项研究意味着量子通信向实用化迈出关键一步，有望在五年内投入商用。', author: '陈思远', time: '5 小时前' },
  ],
  society: [
    { emoji: '🏘️', tag: '城市', title: '城市微光：那些在深夜仍亮着的便利店，守护着谁的孤独', desc: '24小时便利店不只是卖东西的地方，它是都市夜归人的临时避风港，也是无数微小梦想的见证者。', author: '陈思远', time: '3 小时前' },
    { emoji: '🌱', tag: '环保', title: '零废弃社区实验：这个小区用一年时间实现了垃圾不出区', desc: '从堆肥到二手交换，居民们摸索出了一套真正可持续的社区生活方式。', author: '王小榕', time: '6 小时前' },
    { emoji: '🎓', tag: '教育', title: '山村教师的坚守：他用一辆摩托车驮起了整座山的孩子', desc: '在云南怒江州，有一位老师每天骑行两个小时，只为了不让一个孩子掉队。', author: '李梦琳', time: '8 小时前' },
  ],
  emotion: [
    { emoji: '💌', tag: '故事', title: '异地恋第七年，他们用 2000 封手写信拼出了爱情最真的样子', desc: '在这个即时通讯的时代，还有人愿意用笔墨慢慢诉说思念。读这些信，像看了一场关于时间的展览。', author: '苏小暖', time: '2 小时前' },
    { emoji: '🏠', tag: '家庭', title: '「我选择不结婚，但我和我的家人很快乐」', desc: '她今年 42 岁，一个人生活，把父母接来同住。她说：「家的定义，不该只有一种答案。」', author: '林知夏', time: '5 小时前' },
    { emoji: '🌈', tag: '治愈', title: '失恋后，她养了一只猫，开了间花店，然后遇见了更好的自己', desc: '「那些以为走不过去的日子，回头看，都是通往自己的路。」', author: '赵小鹿', time: '7 小时前' },
  ],
  sports: [
    { emoji: '🏃', tag: '马拉松', title: '马拉松女孩：从零基础到完赛，她只用了六个月', desc: '不是每个人生来就是跑者，但每个人都可以成为更好的自己。她的故事，或许也是你的。', author: '王力行', time: '5 小时前' },
    { emoji: '⚽', tag: '足球', title: '亚洲杯冷门迭爆：这支世界排名百名开外的球队，打赢了冠军热门', desc: '足球最美的时刻，就是当梦想击碎偏见的那一刻。全场数据告诉你，他们配得上这场胜利。', author: '周天宇', time: '3 小时前' },
    { emoji: '🧘', tag: '健身', title: '瑜伽改变了她的人生——但不是你想象的那种方式', desc: '「瑜伽教会我的不是柔韧身体，而是如何在混乱中保持呼吸。」她的故事让无数人开始重新审视自己的生活。', author: '吴桐', time: '7 小时前' },
  ],
  entertainment: [
    { emoji: '🎬', tag: '电影', title: '戛纳电影节落幕：一部亚洲电影拿下了金棕榈', desc: '这是亚洲电影时隔多年再次拿下最高荣誉，导演在领奖时说了一句让全场沉默的话。', author: '许知远', time: '2 小时前' },
    { emoji: '🎵', tag: '音乐', title: '独立音乐人的春天：为什么越来越多人选择「不红了」', desc: '在流量至上的时代，一群音乐人选择回归创作本身。他们的答案是什么？', author: '赵小鹿', time: '6 小时前' },
    { emoji: '📺', tag: '综艺', title: '这档没有明星的慢综艺，悄悄登上了播放量第一', desc: '没有剧本、没有冲突、没有明星——这档「三无」综艺，为什么让无数人看哭了？', author: '钱小雨', time: '9 小时前' },
  ],
  video: [
    { emoji: '🎥', tag: '纪录片', title: '「我在菜市场卖了一天菜」：一部让 3000 万人流泪的短片', desc: '镜头对准了那些我们每天路过却从未认真看过的面孔。有人看完后，给妈妈打了三年来的第一个电话。', author: '孙一涵', time: '4 小时前' },
    { emoji: '🎙️', tag: '访谈', title: '对话那位辞去高管工作的面包师：「面粉比 PPT 更有温度」', desc: '他用一把剁面刀，剁碎了所有人的偏见。这期播客上线 48 小时，播放量破千万。', author: '黄小米', time: '7 小时前' },
    { emoji: '🌍', tag: '旅行', title: '一个人，一辆单车，跨越 3000 公里：她的骑行日记', desc: '从云南到西藏，她用一台 GoPro 记录下了沿途每一张笑脸和每一滴眼泪。', author: '林远舟', time: '10 小时前' },
  ],
};

const CAT_ICONS: Record<string, string> =
  Object.fromEntries(FALLBACK_CATEGORIES.map(c => [c.slug, c.icon]));

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);

  const categories = await query<CategoryRow>(
    'SELECT * FROM categories WHERE is_visible = 1 ORDER BY sort_order ASC'
  );

  const heroArticles = await query<ArticleRow>(
    `SELECT * FROM articles WHERE status = 'published' AND cover_image IS NOT NULL
     ORDER BY view_count DESC, published_at DESC LIMIT 5`
  );

  const latestArticles = await query<ArticleRow>(
    `SELECT * FROM articles WHERE status = 'published'
     ORDER BY published_at DESC LIMIT 20`
  );

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const articlesByCategory = FALLBACK_CATEGORIES.map((fallback) => {
    const dbCat = categories.find((c) => c.slug === fallback.slug);
    const articles = latestArticles.filter(
      (a) => dbCat && a.category_id === dbCat.id
    );
    return {
      slug: fallback.slug,
      name: locale === 'en' ? fallback.name_en : fallback.name,
      icon: fallback.icon,
      color: fallback.color,
      articles,
    };
  });

  const firstArticleHref = latestArticles.length > 0
    ? `/${locale}/article/${latestArticles[0].id}`
    : '#hero';

  return (
    <div>
      {/* Hero */}
      <section className="hero" id="hero">
        <div className="hero-badge">
          <span className="dot"></span>
          实时更新 · 追逐每一个梦想故事
        </div>
        <h1>
          捕捉世界的<br /><span className="gradient-text">每一次脉动</span>
        </h1>
        <p>DreamPulse 用温暖的方式，为你呈现这个时代最真实的故事。科技有温度，新闻有灵魂。</p>
        <div className="hero-actions">
          <a href={firstArticleHref} className="btn-hero-primary">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            探索今日热榜
          </a>
          <a href="#sec-featured" className="btn-hero-secondary">了解我们的故事</a>
        </div>
      </section>

      {/* 今日焦点 */}
      <section className="section" id="sec-featured">
        <div className="section-header reveal">
          <span className="section-tag">今日焦点</span>
          <h2>值得你关注的故事</h2>
          <p>编辑精选，每天为你筛选最有温度的新闻</p>
        </div>

        <div className="featured reveal">
          <div className="featured-main">
            <div className="card-image" style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(167,139,250,0.2))' }}>
              <span>🌌</span>
              <span className="card-tag">科技</span>
            </div>
            <div className="card-body">
              <h3>AI 正在重新定义「创作」的边界：一场关于灵感与算法的对话</h3>
              <p>当 AI 可以写出一首诗、画一幅画，我们不禁要问：创作的本质究竟是什么？DreamPulse 深度访谈了五位前沿艺术家与 AI 研究者。</p>
              <div className="card-meta">
                <span className="author"><span className="avatar"></span> 林小雨 · 深度报道</span>
                <span>8 分钟前</span>
              </div>
            </div>
          </div>
          <div className="featured-side">
            <div className="side-card">
              <div className="side-img">❤️</div>
              <div className="side-body">
                <h4>那些在城市里独自追梦的年轻人，后来都怎么样了？</h4>
                <span>情感 · 23 分钟前</span>
              </div>
            </div>
            <div className="side-card">
              <div className="side-img">⚡</div>
              <div className="side-body">
                <h4>新能源赛道再起波澜：三家造车新势力同时发布重磅技术</h4>
                <span>科技 · 1 小时前</span>
              </div>
            </div>
            <div className="side-card">
              <div className="side-img">🎬</div>
              <div className="side-body">
                <h4>戛纳电影节落幕：一部亚洲电影拿下了金棕榈</h4>
                <span>娱乐 · 2 小时前</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Sections */}
      {articlesByCategory.map(({ slug, name, icon, color, articles }) => {
        const fallbacks = FALLBACK_ARTICLES[slug] ?? [];
        const displayArticles = articles.length > 0 ? articles.slice(0, 3) : [];
        const useFallback = articles.length === 0;

        return (
          <section key={slug} className={`section category-section sec-${slug}`} id={`sec-${slug}`}>
            <div className="section-divider" style={{ '--cat-color': color } as React.CSSProperties}></div>
            <div className="category-header reveal">
              <div className="category-header-left">
                <div className="category-dot" style={{ background: color, boxShadow: `0 0 10px ${color}` }}></div>
                <h3>{icon} {name}</h3>
              </div>
              <a href={`/${locale}/section/${slug}`}>查看更多 →</a>
            </div>
            <div className="news-grid reveal-stagger">
              {useFallback ? (
                fallbacks.map((item, i) => (
                  <div key={i} className="news-card reveal" style={{ '--cat-color': color } as React.CSSProperties}>
                    <div className="card-image" style={{ background: `linear-gradient(135deg,${color}28,${color}12)` }}>
                      <div className="img-placeholder">{item.emoji}</div>
                      <span className="card-tag">{item.tag}</span>
                    </div>
                    <div className="cat-bar" style={{ background: `linear-gradient(90deg,${color},${color}88)` }}></div>
                    <div className="card-body">
                      <h3>{item.title}</h3>
                      <p>{item.desc}</p>
                      <div className="card-meta">
                        <span className="author"><span className="avatar"></span> {item.author}</span>
                        <span>{item.time}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                displayArticles.map((article) => {
                  const dbCat = categoryMap.get(article.category_id);
                  return (
                    <a key={article.id} href={`/${locale}/article/${article.id}`} className="news-card reveal" style={{ '--cat-color': color } as React.CSSProperties}>
                      <div className="card-image" style={{ background: `linear-gradient(135deg,${color}28,${color}12)` }}>
                        <div className="img-placeholder">{icon}</div>
                        {dbCat && <span className="card-tag">{dbCat.name}</span>}
                      </div>
                      <div className="cat-bar" style={{ background: `linear-gradient(90deg,${color},${color}88)` }}></div>
                      <div className="card-body">
                        <h3>{locale === 'en' && article.title_en ? article.title_en : article.title}</h3>
                        <p>{article.summary || ''}</p>
                        <div className="card-meta">
                          <span className="author"><span className="avatar"></span> DreamPulse</span>
                          <span>{article.view_count} 次浏览</span>
                        </div>
                      </div>
                    </a>
                  );
                })
              )}
            </div>
          </section>
        );
      })}

      {/* Newsletter CTA */}
      <section className="section section--flush">
        <div className="cta reveal">
          <h2>不要错过任何一个梦想故事</h2>
          <p>订阅 DreamPulse，每天早晨收到一封精心编辑的新闻信，用 5 分钟了解这个世界的温度。</p>
          <form className="cta-form">
            <input type="email" placeholder="输入你的邮箱地址" />
            <button type="submit">免费订阅</button>
          </form>
        </div>
      </section>
    </div>
  );
}
