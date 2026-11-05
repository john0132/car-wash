# frozen_string_literal: true

# Website pages, built from ordered sections that are instances of staff-defined
# Components. The form saves the page, its translations and all of its sections
# in one request. Sections are reconciled with what's submitted: known ids are
# updated, new entries created, missing ones deleted, and the order sets `position`.
class Admin::PagesController < Admin::BaseController
  include Admin::Activation
  include Admin::Pagination
  include Admin::ContentTranslations
  include Admin::ComponentOptions

  TRANSLATION_FIELDS = %i[name title subtitle seo_title seo_description].freeze
  TRANSLATION_IMAGES = %i[seo_image].freeze

  after_action :verify_authorized

  before_action :set_page, only: %i[edit update destroy activation]

  def index
    authorize Page

    scope = Page.search_name(params[:q]).with_status(params[:status])
    pages, pagination = paginate(scope.order(:slug))
    pages = pages.includes(:page_translations)
    sections = PageSection.where(page_id: pages.map(&:id)).group(:page_id).count

    render inertia: {
      pages: pages.map { |page| page_row(page).merge(sections_count: sections.fetch(page.id, 0)) },
      filters: { q: params[:q].presence, status: params[:status].presence },
      pagination: pagination
    }
  end

  def new
    page = Page.new(is_active: true)
    authorize page
    render inertia: form_props(page)
  end

  def create
    page = Page.new
    authorize page

    if save(page)
      redirect_to edit_admin_page_path(page), notice: "#{display_name(page)} was created"
    else
      redirect_to new_admin_page_path, inertia: { errors: page_errors(page) }
    end
  end

  def edit
    authorize @page, :update?
    render inertia: form_props(@page)
  end

  def update
    authorize @page

    if save(@page)
      redirect_to edit_admin_page_path(@page), notice: "#{display_name(@page)} was updated"
    else
      redirect_to edit_admin_page_path(@page), inertia: { errors: page_errors(@page) }
    end
  end

  def destroy
    authorize @page

    if @page.destroy
      redirect_to admin_pages_path, notice: "#{display_name(@page)} was deleted"
    else
      redirect_back_or_to edit_admin_page_path(@page), alert: @page.errors.full_messages.to_sentence
    end
  end

  def activation
    authorize @page, :update?
    update_record_activation(@page, name: display_name(@page), fallback: admin_pages_path)
  end

  private

  def set_page
    @page = Page.includes(
      page_translations: { seo_image_attachment: :blob },
      page_sections: [ :page_section_translations, :component, { images_attachments: :blob } ]
    ).find(params[:id])
  end

  def page_params
    params.expect(page: %i[slug is_active])
  end

  def save(page)
    page.assign_attributes(page_params)
    page.slug = page.slug.to_s.strip.downcase
    raw = params.to_unsafe_h[:page] || {}
    assign_content_translations(page, raw[:translations] || {}, fields: TRANSLATION_FIELDS, images: TRANSLATION_IMAGES)
    @submitted_sections = assign_sections(page, raw[:sections])
    page.save
  end

  # Returns the sections in submitted order, for error keys.
  def assign_sections(page, entries)
    entries = entries.is_a?(Hash) ? entries.sort_by { |k, _| k.to_i }.map(&:last) : Array(entries)
    components = Component.where(id: entries.map { |e| e[:component_id] }).index_by(&:id)
    language_ids = Language.ids.to_set

    sections = entries.each_with_index.map do |entry, index|
      section = entry[:id].presence && page.page_sections.find { |s| s.id == entry[:id].to_i }
      section ||= page.page_sections.build(component: components[entry[:component_id].to_i])

      content = (entry[:content] || {}).select { |language_id, _| language_ids.include?(language_id.to_i) }
      section.position = index
      section.is_active = ActiveModel::Type::Boolean.new.cast(entry.fetch(:is_active, true))
      section.assign_values(settings: entry[:settings] || {}, content_by_language: content)
      section
    end

    page.page_sections.each { |s| s.mark_for_destruction unless sections.include?(s) }
    sections
  end

  # Page and translation errors (see Admin::ContentTranslations#content_errors),
  # plus each section's as `sections.<index>.<attribute>` in submitted order.
  def page_errors(page)
    errors = content_errors(page).reject { |key, _| key.to_s.start_with?("page_sections") }
    Array(@submitted_sections).each_with_index do |section, index|
      section.errors.to_hash.each do |attribute, messages|
        errors[:"sections.#{index}.#{attribute}"] = messages
      end
    end
    errors[:sections] = [ "have errors, see the highlighted sections" ] if Array(@submitted_sections).any? { |s| s.errors.any? }
    errors
  end

  def display_name(page)
    page.translation&.name || page.slug.presence || "Page"
  end

  def page_row(page)
    translation = page.translation
    {
      id: page.id,
      slug: page.slug,
      name: translation&.name,
      title: translation&.title,
      is_active: page.is_active,
      languages: page.page_translations.filter_map { |t| Language.ids_by_code.key(t.language_id) },
      updated_at: page.updated_at
    }
  end

  def section_props(section)
    {
      id: section.id,
      component_id: section.component_id,
      is_active: section.is_active,
      settings: section.settings,
      content: languages.to_h { |l| [ l.id, section.content_for(l.id) ] },
      image_urls: section.image_urls
    }
  end

  def form_props(page)
    used_ids = page.page_sections.map(&:component_id)
    components = Component.where(is_active: true).or(Component.where(id: used_ids))
      .includes(:component_translations).ordered_by_name

    {
      page: {
        id: page.id,
        slug: page.slug.to_s,
        is_active: page.is_active,
        name: page.persisted? ? display_name(page) : nil
      },
      translations: content_translations_props(page, fields: TRANSLATION_FIELDS, images: TRANSLATION_IMAGES),
      sections: page.page_sections.map { |section| section_props(section) },
      components: components.map { |c| component_option(c) },
      languages: languages_props
    }
  end
end
