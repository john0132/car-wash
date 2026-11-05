# frozen_string_literal: true

require "rails_helper"

RSpec.describe City, type: :model do
  it "requires a name in the default language" do
    city = City.new
    city.city_translations.build(language: arabic, name: "القاهرة")
    english

    expect(city).not_to be_valid
    expect(city.errors[:translations]).to eq([ "must include a name in English" ])
  end

  it "doesn't count a translation marked for destruction" do
    city = create_city
    city.city_translations.first.mark_for_destruction

    expect(city).not_to be_valid
  end

  it "can't be deleted while it has areas" do
    city = create_city
    create_area(city: city)

    expect(city.destroy).to be(false)
    expect(City.exists?(city.id)).to be(true)
  end

  it "deletes its translations with it" do
    city = create_city

    expect { city.destroy }.to change(CityTranslation, :count).by(-1)
  end
end
