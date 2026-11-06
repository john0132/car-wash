# frozen_string_literal: true

class AddHomepageDisplayToServicesAndServiceCategories < ActiveRecord::Migration[8.1]
  def change
    %i[services service_categories].each do |table|
      add_column table, :display_in_home_page, :boolean, null: false, default: false
      # The homepage only ever reads the flagged rows.
      add_index table, :display_in_home_page, where: "display_in_home_page", name: "index_#{table}_on_home_page"
    end
  end
end
