# frozen_string_literal: true

require "rails_helper"

RSpec.describe Extra, type: :model do
  it "is valid with a price and a name" do
    expect(create_extra(price: 20)).to be_valid
  end

  it "requires a price" do
    expect(Extra.new).not_to be_valid
  end

  it "requires a name in the default language" do
    extra = Extra.new(price: 20)
    english

    expect(extra).not_to be_valid
    expect(extra.errors[:translations]).to eq([ "must include a name in English" ])
  end

  it "defaults is_active to true" do
    expect(create_extra.is_active).to be(true)
  end

  it "deletes its translations with it" do
    extra = create_extra

    expect { extra.destroy }.to change(ExtraTranslation, :count).by(-1)
  end
end
