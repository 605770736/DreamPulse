/**
 * AI 摘要生成器
 * 调用 OpenAI API，输入原文 → 输出中文摘要 + 英文摘要
 */

import type { FetchedArticle } from './fetcher';

/** AI 摘要结果 */
export interface SummarizedArticle extends FetchedArticle {
  /** 中文摘要（由 AI 生成，约 200 字） */
  summaryZh: string;
  /** 英文摘要（由 AI 生成，约 150 词） */
  summaryEn: string;
}

/** 中文摘要 Prompt */
const PROMPT_ZH = `你是一位专业的新闻编辑。请将以下新闻内容改写为一段约200字的中文摘要。
要求：
1. 保留核心事实和关键信息
2. 语言精炼、客观中立
3. 不添加个人观点或推测
4. 直接输出摘要文本，无需标题或前言

新闻内容：`;

/** 英文摘要 Prompt */
const PROMPT_EN = `You are a professional news editor. Please rewrite the following news content into a concise English summary of about 150 words.
Requirements:
1. Retain core facts and key information
2. Use clear, objective language
3. Do not add personal opinions or speculation
4. Output the summary text directly, no title or introduction needed

News content:`;

/**
 * 对单篇文章生成中英文摘要
 *
 * @param article - 抓取到的原始文章
 * @param apiKey - OpenAI API Key
 * @param model - 模型名称（默认 gpt-4o-mini）
 * @param baseUrl - API 基础 URL
 * @returns 包含摘要的文章数据
 */
export async function summarizeArticle(
  article: FetchedArticle,
  apiKey: string,
  model: string = 'gpt-4o-mini',
  baseUrl: string = 'https://api.openai.com/v1'
): Promise<SummarizedArticle> {
  // 截取正文，避免超过 token 限制
  const content = article.content.slice(0, 4000);

  // 并行请求中英文摘要
  const [summaryZh, summaryEn] = await Promise.all([
    generateSummary(content, PROMPT_ZH, apiKey, model, baseUrl),
    generateSummary(content, PROMPT_EN, apiKey, model, baseUrl),
  ]);

  return {
    ...article,
    summaryZh: summaryZh || article.content.slice(0, 200),
    summaryEn: summaryEn || article.content.slice(0, 150),
  };
}

/**
 * 调用 OpenAI Chat Completions API 生成摘要
 *
 * @param content - 新闻正文
 * @param prompt - 系统 Prompt
 * @param apiKey - API Key
 * @param model - 模型名称
 * @param baseUrl - API 基础 URL
 * @returns 摘要文本
 */
async function generateSummary(
  content: string,
  prompt: string,
  apiKey: string,
  model: string,
  baseUrl: string
): Promise<string> {
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content },
        ],
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI] API 请求失败: ${response.status}`, errorText);
      return '';
    }

    const data = await response.json() as Record<string, unknown>;
    const choices = data.choices as Array<Record<string, unknown>> | undefined;
    const message = choices?.[0]?.message as Record<string, unknown> | undefined;
    return (message?.content as string ?? '').trim();
  } catch (err) {
    console.error('[AI] 摘要生成异常:', err);
    return '';
  }
}
