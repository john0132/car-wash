# frozen_string_literal: true

require "rails_helper"

RSpec.describe ServiceCategoryTranslation, type: :model do
  let(:service_category) { ServiceCategory.create! }
  let(:language) { Language.create!(code: "en", name: "English") }

  it "is valid with a service category, language, and name" do
    expect(ServiceCategoryTranslation.new(service_category: service_category, language: language, name: "Washing")).to be_valid
  end

  it "requires a name" do
    expect(ServiceCategoryTranslation.new(service_category: service_category, language: language)).not_to be_valid
  end

  it "requires a unique language per service category" do
    ServiceCategoryTranslation.create!(service_category: service_category, language: language, name: "Washing")
    duplicate = ServiceCategoryTranslation.new(service_category: service_category, language: language, name: "Washing (duplicate)")
    expect(duplicate).not_to be_valid
  end
end
