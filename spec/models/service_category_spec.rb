# frozen_string_literal: true

require "rails_helper"

RSpec.describe ServiceCategory, type: :model do
  it "defaults is_active to true" do
    expect(create_service_category.is_active).to be(true)
  end

  it "requires a name in the default language" do
    category = ServiceCategory.new
    category.service_category_translations.build(language: arabic, name: "خارجي")
    english

    expect(category).not_to be_valid
    expect(category.errors[:translations]).to eq([ "must include a name in English" ])
  end

  it "can't be deleted while it has services" do
    category = create_service_category
    create_service(service_category: category)

    expect(category.destroy).to be(false)
    expect(ServiceCategory.exists?(category.id)).to be(true)
  end

  it "deletes its translations with it" do
    category = create_service_category

    expect { category.destroy }.to change(ServiceCategoryTranslation, :count).by(-1)
  end
end
