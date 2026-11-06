# frozen_string_literal: true

# Fills the header's "Services" dropdown from the catalogue: the Services item
# becomes the parent of one item per category, and each category's item the
# parent of one item per service in it. Idempotent and additive — categories and
# services that already have an item are left alone, so dashboard edits (order,
# labels, removals of nested items) are never undone except by deleting an item
# and re-running this.
class HeaderServicesMenu
  PARENT_URL = "/#services"

  def self.sync! = new.sync!

  def sync!
    HeaderItem.transaction do
      parent = services_item
      ServiceCategory.includes(:service_category_translations, services: :service_translations).ordered_by_name.each do |category|
        category_item = linked_item(parent, category, link_type: "service_category", label_from: category)
        category.services.sort_by(&:id).each { |service| linked_item(category_item, service, link_type: "service", label_from: service) }
      end
    end
  end

  private

  def services_item
    HeaderItem.top_level.find_by(link_type: "url", url: PARENT_URL) || create_item(nil, link_type: "url", url: PARENT_URL, labels: { "en" => "Services" })
  end

  def linked_item(parent, record, link_type:, label_from:)
    key = link_type == "service" ? :service : :service_category
    HeaderItem.find_by(key => record) || create_item(parent, link_type: link_type, key => record, labels: names_of(label_from))
  end

  def names_of(record)
    record.translations.to_h { |t| [ t.language.code, t.name ] }
  end

  def create_item(parent, labels:, **attrs)
    item = HeaderItem.new(parent: parent, position: HeaderItem.where(parent_id: parent&.id).count, **attrs)
    Language.where(code: labels.keys).each do |language|
      item.header_item_translations.build(language: language, label: labels[language.code])
    end
    item.save!
    item
  end
end
