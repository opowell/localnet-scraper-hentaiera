import { afterEach, describe, expect, it } from 'vitest'
import { parserLoader, resetPage, visit } from '#scraper-test'

// The parser, evaluated with the helpers it is injected with, as a scrape runs it.
const load = parserLoader(__dirname)

afterEach(resetPage)

describe('hentaiEra', () => {
  it('reads a HentaiEra gallery as its pages, from the folder the page names, and what it is filed under', () => {
    const { parseHentaiEra } = load('hentaiera.js', ['parseHentaiEra'])
    visit('https://hentaiera.com/gallery/1771376/', `<div class="gallery_first"><h1>A gallery</h1><p class="subtitle">ある</p>
      <ul class="galleries_info"><li><span class="tags_text">Tags</span><div><a class="tag" href="/tag/anal/"><span class="item_name"> anal</span></a></div></li>
      <li><span class="tags_text">Artists</span><div><a class="tag" href="/artist/ico-plus/"><span class="item_name"> ico plus</span></a></div></li></ul></div>
      <input id="load_server" value="11"><input id="load_dir" value="033"><input id="load_id" value="etsxvp9yw5"><input id="load_pages" value="2">
      <script>var g_th = $.parseJSON('{"1":"w,1280,1807","2":"j,1280,1807"}');</script>`)
    const parsed = parseHentaiEra()
    expect(parsed.content).toEqual(['ある', '![](https://m11.hentaiera.com/033/etsxvp9yw5/1.webp)', '![](https://m11.hentaiera.com/033/etsxvp9yw5/2.jpg)'])
    expect(parsed.links).toEqual([
      { url: 'https://hentaiera.com/tag/anal/', title: 'anal', score: 0.5 },
      { url: 'https://hentaiera.com/artist/ico-plus/', title: 'ico plus', score: 1 },
    ])
  })

  it('reads https://hentaiera.com/ as a listing of what it links to', async () => {
    const { parseHentaiEra } = load('hentaiera.js', ['parseHentaiEra'])
    visit('https://hentaiera.com/', '<a href="/gallery/1771376/">A</a><a href="/tag/anal/">B</a>')
    expect(await parseHentaiEra()).toEqual({ listing: true, links: [{ url: 'https://hentaiera.com/gallery/1771376/', score: 1 }] })
  })
})
