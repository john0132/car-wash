# frozen_string_literal: true

# Header items form a tree (any depth) and header/footer links can point at a
# service category or a service.
class AddNestingAndCatalogLinksToNavigation < ActiveRecord::Migration[8.1]
  def change
    add_reference :header_items, :parent, foreign_key: { to_table: :header_items }

    %i[header_items footer_items].each do |table|
      add_reference table, :service_category, foreign_key: true
      add_reference table, :service, foreign_key: true
    end
  end
end
