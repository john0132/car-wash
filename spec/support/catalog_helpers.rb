# frozen_string_literal: true

# Builders for ServiceCategory/Service, which require a default-language (English) name.
# Uses LocationHelpers#english.
module CatalogHelpers
  def create_service_category(name = "Exterior", **attrs)
    ServiceCategory.new(**attrs).tap do |category|
      category.service_category_translations.build(language: english, name: name)
      category.save!
    end
  end

  def build_service(name = "Exterior Wash", service_category: create_service_category, price: 100, **attrs)
    Service.new(service_category: service_category, price: price, **attrs).tap do |service|
      service.service_translations.build(language: english, name: name)
    end
  end

  def create_service(...)
    build_service(...).tap(&:save!)
  end
end

RSpec.configure do |config|
  config.include CatalogHelpers
end
