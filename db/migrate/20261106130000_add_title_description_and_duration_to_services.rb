# frozen_string_literal: true

# A service's headline and long-form description are translatable, so they live on
# service_translations. The duration is a language-neutral number of minutes.
class AddTitleDescriptionAndDurationToServices < ActiveRecord::Migration[8.1]
  def change
    add_column :service_translations, :title, :string
    add_column :service_translations, :description, :text
    add_column :services, :duration_minutes, :integer
  end
end
