# frozen_string_literal: true

# Builders for ServiceCategory/Service/Extra/Faq, which require a default-language (English) name.
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

  def create_extra(name = "Air Freshener", price: 20, **attrs)
    Extra.new(price: price, **attrs).tap do |extra|
      extra.extra_translations.build(language: english, name: name)
      extra.save!
    end
  end

  def create_faq(question = "Do you offer home service?", answer: "Yes, everywhere we operate.", **attrs)
    Faq.new(**attrs).tap do |faq|
      faq.faq_translations.build(language: english, question: question, answer: answer)
      faq.save!
    end
  end
end

RSpec.configure do |config|
  config.include CatalogHelpers
end
