# frozen_string_literal: true

require "rails_helper"

RSpec.describe HtmlSanitizer do
  it "keeps the editor's formatting" do
    html = "<h2>Title</h2><p><strong>Bold</strong> <em>it</em> <u>u</u></p><ul><li>One</li></ul><blockquote>q</blockquote>"
    expect(described_class.sanitize(html)).to eq(html)
  end

  it "strips scripts, event handlers and javascript: links" do
    html = %(<p onclick="steal()">Hi</p><script>alert(1)</script><a href="javascript:alert(1)">x</a>)
    expect(described_class.sanitize(html)).to eq("<p>Hi</p>alert(1)<a>x</a>")
  end

  it "adds rel to links and keeps images" do
    html = %(<a href="https://example.com">x</a><img src="/rails/active_storage/blobs/a/b.png" alt="Car">)
    expect(described_class.sanitize(html)).to eq(
      %(<a rel="noopener noreferrer" href="https://example.com">x</a><img src="/rails/active_storage/blobs/a/b.png" alt="Car">)
    )
  end

  it "turns empty editor output into an empty string" do
    expect(described_class.sanitize("<p></p><p> </p>")).to eq("")
    expect(described_class.sanitize(nil)).to be_nil
  end
end
