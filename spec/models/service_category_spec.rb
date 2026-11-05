# frozen_string_literal: true

require "rails_helper"

RSpec.describe ServiceCategory, type: :model do
  it "is valid with no attributes set" do
    expect(ServiceCategory.new).to be_valid
  end

  it "defaults is_active to true" do
    expect(ServiceCategory.create!.is_active).to be(true)
  end

  it "destroys its services when destroyed" do
    category = ServiceCategory.create!
    service = Service.create!(service_category: category, price: 100)

    category.destroy

    expect(Service.exists?(service.id)).to be(false)
  end
end
