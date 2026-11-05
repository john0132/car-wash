# frozen_string_literal: true

require "rails_helper"

RSpec.describe Translatable do
  let!(:english) { Language.create!(code: "en", name: "English") }
  let!(:arabic) { Language.create!(code: "ar", name: "Arabic") }
  let(:membership) do
    Membership.create!(egp_to_points: 1, points_to_egp: 0.1, background_color: "#C0C0C0", text_color: "#000000")
  end

  it "picks the translation for the requested language" do
    membership.membership_translations.create!(language: english, name: "Gold")
    membership.membership_translations.create!(language: arabic, name: "ذهبي")

    expect(membership.translation(:ar).name).to eq("ذهبي")
    expect(membership.translation(:en).name).to eq("Gold")
  end

  it "falls back to the default locale, then to any translation" do
    membership.membership_translations.create!(language: english, name: "Gold")
    expect(membership.translation(:fr).name).to eq("Gold")

    other = Membership.create!(egp_to_points: 1, points_to_egp: 0.1, background_color: "#C0C0C0", text_color: "#000000")
    other.membership_translations.create!(language: arabic, name: "فضي")
    expect(other.translation(:en).name).to eq("فضي")
  end

  it "returns nil without translations" do
    expect(membership.translation).to be_nil
  end
end
