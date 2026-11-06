# frozen_string_literal: true

# The single website footer: title, description and image per language, social
# links, and columns of links. Everything is saved in one request. Social links,
# columns and a column's links are each reconciled with what's submitted: known
# ids are updated, new entries created, missing ones deleted, and the list order
# sets `position`.
class Admin::FootersController < Admin::BaseController
  include Admin::ContentTranslations
  include Admin::NavigationItems

  TRANSLATION_FIELDS = %i[title description].freeze

  after_action :verify_authorized

  before_action :set_footer

  def edit
    authorize @footer
    render inertia: form_props
  end

  def update
    authorize @footer

    raw = params.to_unsafe_h[:footer] || {}
    assign_content_translations(@footer, raw[:translations] || {}, fields: TRANSLATION_FIELDS)
    assign_image(@footer, :image, raw[:image]) if raw.key?(:image)
    @socials = assign_social_links(raw[:social_links])
    @columns = assign_columns(raw[:columns])

    if @footer.save
      redirect_to edit_admin_footer_path, notice: "Footer was updated"
    else
      redirect_to edit_admin_footer_path, inertia: { errors: footer_errors }
    end
  end

  private

  def set_footer
    @footer = Footer.includes(
      :footer_translations, image_attachment: :blob,
      footer_social_links: { icon_attachment: :blob },
      footer_columns: [ :footer_column_translations, { footer_items: :footer_item_translations } ]
    ).first || Footer.create!
  end

  def assign_social_links(raw)
    links = submitted_entries(raw).each_with_index.map do |entry, index|
      link = find_or_build(@footer.footer_social_links, entry) { @footer.footer_social_links.build }
      link.assign_attributes(
        name: entry[:name].to_s.strip.presence, url: entry[:url].to_s.strip.presence,
        position: index, is_active: cast_boolean(entry.fetch(:is_active, true))
      )
      assign_image(link, :icon, entry[:icon]) if entry.key?(:icon)
      link
    end

    @footer.footer_social_links.each { |link| link.mark_for_destruction unless links.include?(link) }
    links
  end

  # Returns `[{ column:, items: [...] }]` in submitted order, for error keys.
  def assign_columns(raw)
    submitted = submitted_entries(raw).each_with_index.map do |entry, index|
      column = find_or_build(@footer.footer_columns, entry) { @footer.footer_columns.build }
      column.position = index
      column.is_active = cast_boolean(entry.fetch(:is_active, true))
      assign_content_translations(column, entry[:translations] || {}, fields: %i[title])

      items = submitted_entries(entry[:items]).each_with_index.map do |item_entry, item_index|
        item = find_or_build(column.footer_items, item_entry) { column.footer_items.build }
        assign_link(item, item_entry, position: item_index)
        item
      end
      column.footer_items.each { |item| item.mark_for_destruction unless items.include?(item) }

      { column: column, items: items }
    end

    columns = submitted.pluck(:column)
    @footer.footer_columns.each { |column| column.mark_for_destruction unless columns.include?(column) }
    submitted
  end

  def footer_errors
    errors = prefixed_errors(@footer, nested: %w[footer_columns footer_social_links footer_translations])

    @socials.each_with_index do |link, index|
      link.errors.to_hash.each { |attribute, messages| errors[:"social_links.#{index}.#{attribute}"] = messages }
    end
    @columns.each_with_index do |entry, index|
      errors.merge!(prefixed_errors(entry[:column], "columns.#{index}", nested: %w[footer_items footer_column_translations]))
      entry[:items].each_with_index do |item, item_index|
        errors.merge!(prefixed_errors(item, "columns.#{index}.items.#{item_index}", nested: %w[footer_item_translations]))
      end
    end

    errors[:columns] = [ "have errors, see the highlighted columns" ] if errors.keys.any? { |k| k.to_s.start_with?("columns.") }
    errors[:social_links] = [ "have errors, see the highlighted links" ] if errors.keys.any? { |k| k.to_s.start_with?("social_links.") }
    errors
  end

  def form_props
    {
      footer: { image: image_prop(@footer.image) },
      translations: translation_values(@footer, TRANSLATION_FIELDS),
      social_links: @footer.footer_social_links.map { |link|
        { id: link.id, name: link.name, url: link.url, is_active: link.is_active, icon: image_prop(link.icon) }
      },
      columns: @footer.footer_columns.map { |column|
        { id: column.id, is_active: column.is_active, translations: translation_values(column, %i[title]),
          items: column.footer_items.map { |item| link_props(item) } }
      },
      options: link_options,
      languages: languages_props
    }
  end
end
