# frozen_string_literal: true

# Shared by every website controller that renders a Page by slug — the home
# page and any other page (see Website::PagesController) built from the
# admin-side Page/PageSection/Component CMS.
module Website::RendersPage
  extend ActiveSupport::Concern

  private

  # The active Page at `slug`, eager-loaded for Page#render_props, or nil.
  def find_page(slug)
    Page.where(is_active: true).includes(
      :page_translations,
      page_sections: [ :page_section_translations, :component, { images_attachments: :blob } ]
    ).find_by(slug: slug)
  end
end
