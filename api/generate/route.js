const BACKEND_BASE = 'https://backend.gulfbusiness.com/wp-json/wp/v2/posts';

function stripHtml(input = '') {
  return input
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}

function escapeHtml(input = '') {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normaliseLink(raw = '') {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

function getSlugFromUrl(urlString) {
  const url = new URL(urlString);
  const parts = url.pathname.split('/').filter(Boolean);
  return parts[parts.length - 1];
}

async function fetchStory(url) {
  const slug = getSlugFromUrl(url);
  const apiUrl = `${BACKEND_BASE}?slug=${encodeURIComponent(slug)}&_embed=1`;

  const res = await fetch(apiUrl, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'GulfBusinessNewsletterBuilder/2.0'
    },
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error(`Backend returned ${res.status} for ${url}`);
  }

  const posts = await res.json();
  if (!Array.isArray(posts) || posts.length === 0) {
    throw new Error(`No backend post found for ${url}`);
  }

  const post = posts[0];
  const media = post?._embedded?.['wp:featuredmedia']?.[0];

  return {
    title: stripHtml(post.title?.rendered || ''),
    excerpt: stripHtml(post.excerpt?.rendered || '').replace(/\s*Read More\s*$/i, ''),
    image: media?.source_url || '',
    url,
    backendLink: post.link || url
  };
}

function trackedUrl(url) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}elqTrack=true`;
}

function imageTag(story, width, height) {
  if (!story.image) return '';
  return `<a target="_blank" href="${escapeHtml(trackedUrl(story.url))}"><img src="${escapeHtml(story.image)}" width="${width}" height="${height}" style="width:100%;height:auto;max-width:${width}px;border:0;display:block;"></a>`;
}

function buildLead(story) {
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;" role="presentation">
  <tr><td style="padding:14px 10px 4px 10px;font-family:Arial, sans-serif;"><a href="${escapeHtml(trackedUrl(story.url))}" target="_blank" style="font-size:28px;line-height:30px;color:#000000;text-decoration:none;font-weight:bold;">${escapeHtml(story.title)}</a></td></tr>
  <tr><td style="padding:8px 10px 12px 10px;font-family:Arial, sans-serif;font-size:15px;line-height:22px;color:#333333;">${escapeHtml(story.excerpt)}</td></tr>
  <tr><td style="padding:0 10px 16px 10px;">${imageTag(story, 580, 326)}</td></tr>
</table>`;
}

function buildTwoColumn(stories) {
  if (stories.length === 0) return '';
  const cells = stories.map((story, idx) => `
<td width="50%" valign="top" style="padding:0 10px 18px 10px;${idx === 0 ? 'border-right:1px solid #D9D9D9;' : ''}">
  ${imageTag(story, 280, 158)}
  <div style="padding-top:10px;font-family:Arial, sans-serif;"><a href="${escapeHtml(trackedUrl(story.url))}" target="_blank" style="font-size:17px;line-height:19px;color:#000000;text-decoration:none;font-weight:bold;">${escapeHtml(story.title)}</a></div>
</td>`).join('');

  return `
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;" role="presentation">
  <tr>${cells}</tr>
</table>`;
}

function buildBlackFeature(story) {
  if (!story) return '';
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#000000;" role="presentation">
  <tr>
    <td width="50%" valign="top" style="padding:12px 10px;">${imageTag(story, 280, 158)}</td>
    <td width="50%" valign="middle" style="padding:18px 20px;font-family:Arial, sans-serif;"><a href="${escapeHtml(trackedUrl(story.url))}" target="_blank" style="font-size:22px;line-height:24px;color:#ffffff;text-decoration:none;font-weight:bold;">${escapeHtml(story.title)}</a></td>
  </tr>
</table>`;
}

function divider() {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;" role="presentation"><tr><td style="padding:10px 20px;"><hr style="border:none;border-top:1px solid #D9D9D9;margin:0;"></td></tr></table>`;
}

function buildNewsletter(stories) {
  const lead = stories[0];
  const topTwo = stories.slice(1, 3);
  const black = stories[3];
  const lower = stories.slice(4);

  const lowerBlocks = [];
  for (let i = 0; i < lower.length; i += 2) {
    lowerBlocks.push(buildTwoColumn(lower.slice(i, i + 2)));
    if (i + 2 < lower.length) lowerBlocks.push(divider());
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Gulf Business Newsletter</title>
</head>
<body style="margin:0;padding:0;background:#FAFAFA;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;" role="presentation"><tr><td>
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#000000;" role="presentation">
    <tr>
      <td style="padding:15px 10px 10px 10px;"><a href="https://gulfbusiness.com/" target="_blank"><img src="https://gulfbusiness.com/wp-content/uploads/2021/06/gb-newsletter-logo.png" width="230" style="max-width:248px;width:100%;height:auto;border:0;"></a></td>
      <td align="right" style="padding:18px 10px 10px 10px;font-family:Arial,sans-serif;color:#ffffff;font-size:12px;">Gulf Business</td>
    </tr>
    <tr><td colspan="2" style="padding:0 10px 10px 10px;"><hr style="border:none;border-top:2px solid #007EFF;margin:0;"></td></tr>
  </table>
  ${lead ? buildLead(lead) : ''}
  ${divider()}
  ${buildTwoColumn(topTwo)}
  ${buildBlackFeature(black)}
  ${lowerBlocks.join('\n')}
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#000000;" role="presentation">
    <tr><td align="center" style="padding:18px 10px;font-family:Arial,sans-serif;color:#ffffff;font-size:12px;">© 2026 MOTIVATE MEDIA GROUP</td></tr>
  </table>
</td></tr></table>
</body>
</html>`;
}

export async function POST(req) {
  try {
    const { links } = await req.json();
    const urls = String(links || '')
      .split(/\n|,/) 
      .map(normaliseLink)
      .filter(Boolean);

    if (urls.length === 0) {
      return Response.json({ error: 'Paste at least one Gulf Business article link.' }, { status: 400 });
    }

    const stories = [];
    for (const url of urls) {
      stories.push(await fetchStory(url));
    }

    const html = buildNewsletter(stories);
    const subjectLines = stories[0] ? [
      stories[0].title,
      `Today on Gulf Business: ${stories[0].title}`,
      `Gulf Business newsletter: ${stories[0].title}`
    ] : [];

    const preheader = stories.slice(1, 3).map(s => s.title).join(' | ');

    return Response.json({ html, stories, subjectLines, preheader });
  } catch (err) {
    return Response.json({ error: err.message || 'Failed to generate newsletter.' }, { status: 500 });
  }
}
