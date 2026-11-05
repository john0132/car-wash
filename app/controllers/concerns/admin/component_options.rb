# frozen_string_literal: true

# What the dashboard's schema-driven section editor needs to know about a
# Component: its key, name and field schema (see ComponentSchema#as_json).
module Admin::ComponentOptions
  extend ActiveSupport::Concern

  private

  def component_option(component)
    translation = component.translation
    {
      id: component.id,
      key: component.key,
      name: translation&.name || component.key.to_s.humanize,
      description: translation&.description,
      is_active: component.is_active,
      fields: component.schema.as_json
    }
  end
end
