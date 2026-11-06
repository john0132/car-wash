# frozen_string_literal: true

require "rails_helper"

RSpec.describe FaqTranslation, type: :model do
  let(:faq) { create_faq }
  let(:language) { arabic }

  it "is valid with a faq, language, question, and answer" do
    expect(FaqTranslation.new(faq: faq, language: language, question: "هل تقدمون خدمة منزلية؟", answer: "نعم")).to be_valid
  end

  it "requires a question" do
    expect(FaqTranslation.new(faq: faq, language: language, answer: "نعم")).not_to be_valid
  end

  it "requires an answer" do
    expect(FaqTranslation.new(faq: faq, language: language, question: "هل تقدمون خدمة منزلية؟")).not_to be_valid
  end

  it "requires a unique language per faq" do
    FaqTranslation.create!(faq: faq, language: language, question: "Q", answer: "A")
    duplicate = FaqTranslation.new(faq: faq, language: language, question: "Q2", answer: "A2")
    expect(duplicate).not_to be_valid
  end
end
