/**
 * Web Search Tool - بحث آمن عبر DuckDuckGo
 */

export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

export async function webSearch(query: string, maxResults: number = 5): Promise<SearchResult[]> {
  try {
    const encoded = encodeURIComponent(query);
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&skip_disambig=1`,
      {
        headers: { 'User-Agent': 'AQIOM/1.0' },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();

    const results: SearchResult[] = [];

    if (data.AbstractText) {
      results.push({
        title: data.Heading || 'ملخص',
        snippet: data.AbstractText,
        url: data.AbstractURL || '',
      });
    }

    for (const item of (data.RelatedTopics || []).slice(0, maxResults)) {
      if (item?.Text && item?.FirstURL) {
        results.push({
          title: item.Text.split(' - ')[0] || 'معلومة',
          snippet: item.Text,
          url: item.FirstURL,
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Web search error:', error);
    return [];
  }
}

export async function formatSearchResults(query: string): Promise<string> {
  const results = await webSearch(query, 4);
  
  if (results.length === 0) {
    return `لم أجد نتائج واضحة لـ "${query}". حاول بكلمات أخرى.`;
  }

  const output = [`📡 نتائج البحث عن: "${query}"`, ''];

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    output.push(`${i + 1}. **${r.title}**`);
    output.push(`   ${r.snippet.substring(0, 300)}`);
    if (r.url) output.push(`   🔗 ${r.url}`);
    output.push('');
  }

  return output.join('\n');
}
