# frozen_string_literal: true

# Builders for ServiceCategory/Service/Extra/Faq/PaymentMethod/Membership, which require a
# default-language (English) name.
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

  def create_payment_method(code = "cash", name: code.humanize, **attrs)
    PaymentMethod.new(code: code, **attrs).tap do |method|
      method.payment_method_translations.build(language: english, name: name)
      method.save!
    end
  end

  def create_membership(name = "Gold", egp_to_points: 1, points_to_egp: 0.1,
                        background_color: "#D4AF37", text_color: "#1F2937", **attrs)
    Membership.new(egp_to_points: egp_to_points, points_to_egp: points_to_egp,
                   background_color: background_color, text_color: text_color, **attrs).tap do |membership|
      membership.membership_translations.build(language: english, name: name)
      membership.save!
    end
  end
end

RSpec.configure do |config|
  config.include CatalogHelpers
end
