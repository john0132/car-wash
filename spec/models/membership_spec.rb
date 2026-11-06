# frozen_string_literal: true

require "rails_helper"

RSpec.describe Membership, type: :model do
  def build_membership(**attrs)
    Membership.new(egp_to_points: 1, points_to_egp: 1, background_color: "#FFFFFF", text_color: "#000000", **attrs).tap do |membership|
      membership.membership_translations.build(language: english, name: "Gold")
    end
  end

  it "is valid with valid attributes" do
    expect(build_membership).to be_valid
  end

  it "requires egp_to_points to be greater than 0" do
    expect(build_membership(egp_to_points: 0)).not_to be_valid
  end

  it "requires background_color to be a hex color" do
    expect(build_membership(background_color: "not-a-color")).not_to be_valid
  end

  it "requires a name in the default language" do
    english # the rule only applies once the default language exists
    membership = Membership.new(egp_to_points: 1, points_to_egp: 1, background_color: "#FFFFFF", text_color: "#000000")
    membership.membership_translations.build(language: arabic, name: "ذهبي")

    expect(membership).not_to be_valid
    expect(membership.errors[:translations]).to eq([ "must include a name in English" ])
  end

  it "defaults is_active to true" do
    expect(create_membership.is_active).to be(true)
  end
end
