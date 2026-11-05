# frozen_string_literal: true

# Allowlist sanitizer for HTML written in the dashboard's rich text editor
# (blog bodies, `rich_text` component fields). Everything not listed here is
# stripped, so the website can render the stored HTML as-is.
module HtmlSanitizer
  TAGS = %w[
    p br hr h2 h3 h4 strong b em i u s code pre blockquote
    ul ol li a img figure figcaption
  ].freeze

  ATTRIBUTES = %w[href title target rel src alt width height].freeze

  def self.sanitize(html)
    return nil if html.nil?

    clean = sanitizer.sanitize(html.to_s, tags: TAGS, attributes: ATTRIBUTES).strip
    clean = clean.gsub(/<a\s(?![^>]*\brel=)/, '<a rel="noopener noreferrer" ')
    blank?(clean) ? "" : clean
  end

  # True for editor output with no text or images, e.g. "<p></p>".
  def self.blank?(html)
    return true if html.blank?

    fragment = Nokogiri::HTML5.fragment(html)
    fragment.text.strip.empty? && fragment.css("img").empty?
  end

  def self.sanitizer
    @sanitizer ||= Rails::HTML5::SafeListSanitizer.new
  end
  private_class_method :sanitizer
end
