# frozen_string_literal: true

# Valid pages, blog posts and components (each needs a name in the default
# language) for model and request specs. `english`/`arabic` come from LocationHelpers.
module ContentHelpers
  def create_page(slug: "about-us", name: "About", title: "About us", **attrs)
    Page.new(slug: slug, **attrs).tap do |page|
      page.page_translations.build(language: english, name: name, title: title)
      page.save!
    end
  end

  def create_blog(slug: "grand-opening", name: "Opening", title: "We're open", **attrs)
    Blog.new(slug: slug, **attrs).tap do |blog|
      blog.blog_translations.build(language: english, name: name, title: title)
      blog.save!
    end
  end

  def create_component(key: "hero", name: "Hero", fields: nil, **attrs)
    fields ||= [
      { key: "heading", type: "string", translatable: true, required: true },
      { key: "button_url", type: "url" }
    ]
    Component.new(key: key, fields: fields, **attrs).tap do |component|
      component.component_translations.build(language: english, name: name)
      component.save!
    end
  end

  # A blob as if direct-uploaded, for image fields.
  def uploaded_blob(filename: "photo.png")
    ActiveStorage::Blob.create_and_upload!(
      io: StringIO.new("\x89PNG\r\n\x1A\n#{'0' * 32}"), filename: filename, content_type: "image/png"
    )
  end
end

RSpec.configure do |config|
  config.include ContentHelpers
end
