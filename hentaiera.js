// A gallery's own address on HentaiEra, /gallery/<id>/, from its page or a page of its reader (/view/<id>/<n>/), else
// null.
function hentaieraGallery(url) {
  const page = new URL(url, location.href)
  const id = /^\/(?:gallery|view)\/(\d+)\//.exec(page.pathname)?.[1]
  return /(?:^|\.)hentaiera\.com$/.test(page.hostname) && id ? `${page.origin}/gallery/${id}/` : null
}

// The file of each of a gallery's pages, in order, from the folder its page names (#load_server, #load_dir, #load_id)
// and the kind of each page's file (g_th, a list a script of the page sets: "w,1280,1807" for a WebP page 1280 wide).
function hentaieraPages() {
  const value = id => document.getElementById(id)?.getAttribute('value')
  const [server, dir, folder] = ['load_server', 'load_dir', 'load_id'].map(value)
  const pages = Number(value('load_pages')) || 0
  let kinds = {}
  for (const script of document.querySelectorAll('script:not([src])')) {
    const list = /\bg_th\s*=\s*\$\.parseJSON\('(.*?)'\)/s.exec(script.textContent)?.[1]
    if (list) {
      try {
        kinds = JSON.parse(list)
      } catch {}
    }
  }
  if (!server || !dir || !folder || !pages) {
    return []
  }
  const extensions = { j: 'jpg', p: 'png', g: 'gif', w: 'webp', a: 'avif' }
  return Array.from({ length: pages }, (_, i) => {
    const extension = extensions[String(kinds[i + 1] || '').split(',')[0]] || 'jpg'
    return `![](https://m${server}.hentaiera.com/${dir}/${folder}/${i + 1}.${extension})`
  })
}

// A gallery's page (/gallery/1771376/) reads as its title, its original title where it has one, then each of its
// pages as a picture (see hentaieraPages). Its details are what it is filed under (tags, artists, groups, parodies,
// characters, languages and category), each a link to its listing, which it links to with weight 0.5, its artists' and
// groups' with weight 1; and it links to the galleries the page offers as like it by their place. Any other page (the
// home page, a tag, an artist, a search) is a listing of the galleries it shows.
function parseHentaiEra(_profileId) {
  if (!/(?:^|\.)hentaiera\.com$/.test(location.hostname)) {
    return null
  }
  const gallery = hentaieraGallery(location.href)
  const title = document.querySelector('.gallery_first h1')?.textContent.trim()
  if (!gallery || !title) {
    return listingOf(linkUrls('a[href*="/gallery/"]').map(hentaieraGallery).filter(url => url && url !== gallery)) ?? { listing: true }
  }
  const filed = {}
  for (const row of document.querySelectorAll('.galleries_info li')) {
    const name = row.querySelector('.tags_text')?.textContent.trim().toLowerCase()
    if (name) {
      filed[name] = Array.from(row.querySelectorAll('a.tag[href]'), a => ({ text: a.querySelector('.item_name')?.textContent.trim() || linkName(a), url: a.href }))
    }
  }
  const original = document.querySelector('.gallery_first .subtitle')?.textContent.trim()
  const content = [...(original ? [original] : []), ...hentaieraPages()]
  const links = new Map()
  for (const [name, values] of Object.entries(filed)) {
    for (const { text, url } of values) {
      links.set(url, { url, title: text, score: ['artists', 'groups'].includes(name) ? 1 : 0.5 })
    }
  }
  let rank = 0
  for (const url of linkUrls('.related_section a[href*="/gallery/"]').map(hentaieraGallery)) {
    if (url && url !== gallery && !links.has(url)) {
      links.set(url, { url, score: 1 / (1 + rank++ / 10) })
    }
  }
  return {
    title,
    content,
    links: [...links.values()],
    details: ['tags', 'artists', 'groups', 'parodies', 'characters', 'languages', 'category'].map(name => [name, filed[name] || []]),
  }
}

// The parser a scrape calls.
registerParser(parseHentaiEra)
