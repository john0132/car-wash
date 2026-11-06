# frozen_string_literal: true

# The website header's links, edited as one ordered list and saved in one
# request. Links are reconciled with what's submitted: known ids are updated,
# new entries created, missing ones deleted, and the order sets `position`.
class Admin::HeaderItemsController < Admin::BaseController
  include Admin::ContentTranslations
  include Admin::NavigationItems

  after_action :verify_authorized

  def edit
    authorize HeaderItem
    render inertia: {
      items: existing_items.map { |item| link_props(item) },
      options: link_options,
      languages: languages_props
    }
  end

  def update
    authorize HeaderItem

    existing = existing_items.to_a
    items = submitted_entries((params.to_unsafe_h[:header] || {})[:items]).each_with_index.map do |entry, index|
      item = find_or_build(existing, entry) { HeaderItem.new }
      assign_link(item, entry, position: index)
      item
    end

    if items.map(&:valid?).all?
      HeaderItem.transaction do
        (existing - items).each(&:destroy!)
        items.each(&:save!)
      end
      redirect_to edit_admin_header_navigation_path, notice: "Header navigation was updated"
    else
      redirect_to edit_admin_header_navigation_path, inertia: { errors: errors_for(items) }
    end
  end

  private

  def existing_items
    HeaderItem.ordered.includes(:header_item_translations)
  end

  def errors_for(items)
    errors = {}
    items.each_with_index { |item, index| errors.merge!(prefixed_errors(item, "items.#{index}", nested: %w[header_item_translations])) }
    errors[:items] = [ "have errors, see the highlighted links" ] if errors.any?
    errors
  end
end
