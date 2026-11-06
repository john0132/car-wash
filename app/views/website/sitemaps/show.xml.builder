xml.instruct!
xml.urlset xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9", "xmlns:xhtml": "http://www.w3.org/1999/xhtml" do
  localized = lambda do |path, locale|
    prefix = locale == I18n.default_locale ? "" : "/#{locale}"
    "#{request.base_url}#{path == '/' ? (prefix.presence || '/') : "#{prefix}#{path}"}"
  end

  @entries.each do |entry|
    @locales.each do |locale|
      xml.url do
        xml.loc localized.call(entry[:path], locale)
        xml.lastmod entry[:lastmod].iso8601 if entry[:lastmod]
        @locales.each do |alternate|
          xml.xhtml :link, rel: "alternate", hreflang: alternate, href: localized.call(entry[:path], alternate)
        end
        xml.xhtml :link, rel: "alternate", hreflang: "x-default", href: localized.call(entry[:path], I18n.default_locale)
      end
    end
  end
end
