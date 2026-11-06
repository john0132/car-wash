# frozen_string_literal: true

# The website header's links, edited as a tree and saved in one request. Each
# submitted entry may carry `children: [entries…]`, nested to any depth. Links
# are reconciled with what's submitted: known ids are updated (and moved to
# wherever they now sit), new entries created, missing ones deleted, and the
# order among siblings sets `position`.
class Admin::HeaderItemsController < Admin::BaseController
  include Admin::ContentTranslations
  include Admin::NavigationItems

  after_action :verify_authorized

  def edit
    authorize HeaderItem
    render inertia: {
      items: tree_props(nil),
      options: link_options,
      languages: languages_props
    }
  end

  def update
    authorize HeaderItem

    existing = HeaderItem.includes(:header_item_translations).to_a
    entries = []
    items = build_items(submitted_entries((params.to_unsafe_h[:header] || {})[:items]), existing, nil, entries)

    if items.map(&:valid?).all?
      HeaderItem.transaction do
        items.each(&:save!)
        HeaderItem.where(id: existing.map(&:id) - items.filter_map(&:id)).destroy_all
      end
      redirect_to edit_admin_header_navigation_path, notice: "Header navigation was updated"
    else
      redirect_to edit_admin_header_navigation_path, inertia: { errors: errors_for(entries) }
    end
  end

  private

  # Builds (without saving) a record for each entry and its descendants, in
  # parent-before-children order. `entries` collects `[record, path]` pairs,
  # where path is the entry's place in the posted tree (`items.0.children.1`).
  def build_items(list, existing, parent, entries, path = "items")
    list.each_with_index.flat_map do |entry, index|
      item = find_or_build(existing, entry) { HeaderItem.new }
      assign_link(item, entry, position: index)
      item.parent = parent
      entries << [ item, "#{path}.#{index}" ]
      [ item ] + build_items(submitted_entries(entry[:children]), existing, item, entries, "#{path}.#{index}.children")
    end
  end

  def tree_props(parent_id)
    @items_by_parent ||= HeaderItem.ordered.includes(:header_item_translations).group_by(&:parent_id)
    @items_by_parent.fetch(parent_id, []).map { |item| link_props(item).merge(children: tree_props(item.id)) }
  end

  def errors_for(entries)
    errors = {}
    entries.each { |item, path| errors.merge!(prefixed_errors(item, path, nested: %w[header_item_translations])) }
    errors[:items] = [ "have errors, see the highlighted links" ] if errors.any?
    errors
  end
end
