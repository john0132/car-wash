# frozen_string_literal: true

require "rails_helper"

RSpec.describe Faq, type: :model do
  it "is valid with a question and answer" do
    expect(create_faq).to be_valid
  end

  it "requires a question and answer in the default language" do
    faq = Faq.new
    english

    expect(faq).not_to be_valid
    expect(faq.errors[:translations]).to eq([ "must include a question and answer in English" ])
  end

  it "defaults is_active to true and sort_order to 0" do
    faq = create_faq

    expect(faq.is_active).to be(true)
    expect(faq.sort_order).to eq(0)
  end

  it "requires a non-negative integer sort_order" do
    faq = Faq.new(sort_order: -1)
    faq.faq_translations.build(language: english, question: "Q?", answer: "A")

    expect(faq).not_to be_valid
    expect(faq.errors[:sort_order]).to be_present
  end

  it "deletes its translations with it" do
    faq = create_faq

    expect { faq.destroy }.to change(FaqTranslation, :count).by(-1)
  end

  describe ".ordered" do
    it "orders by sort_order, then id" do
      second = create_faq("Second?", sort_order: 1)
      first = create_faq("First?", sort_order: 0)

      expect(Faq.ordered).to eq([ first, second ])
    end
  end

  describe ".search_question" do
    it "matches a question in any language" do
      create_faq("Do you offer home service?")
      create_faq("What payment methods do you accept?")

      expect(Faq.search_question("payment").count).to eq(1)
      expect(Faq.search_question(nil).count).to eq(2)
    end
  end
end
