# frozen_string_literal: true

require "rails_helper"

RSpec.describe ServiceTranslation, type: :model do
  let(:service) { Service.create!(service_category: ServiceCategory.create!, price: 100) }
  let(:language) { Language.create!(code: "en", name: "English") }

  it "is valid with a service, language, and name" do
    expect(ServiceTranslation.new(service: service, language: language, name: "Exterior Wash")).to be_valid
  end

  it "requires a name" do
    expect(ServiceTranslation.new(service: service, language: language)).not_to be_valid
  end

  it "requires a unique language per service" do
    ServiceTranslation.create!(service: service, language: language, name: "Exterior Wash")
    duplicate = ServiceTranslation.new(service: service, language: language, name: "Exterior Wash (duplicate)")
    expect(duplicate).not_to be_valid
  end
end
