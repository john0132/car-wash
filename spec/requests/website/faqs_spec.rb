# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Website FAQs", type: :request do
  def create_faq(question:, sort_order: 0, is_active: true)
    language = english
    faq = Faq.new(sort_order: sort_order, is_active: is_active)
    faq.faq_translations.build(language: language, question: question, answer: "Answer to #{question}")
    faq.save!
    faq
  end

  it "lists active FAQs in sort order and hides inactive ones" do
    create_faq(question: "Second?", sort_order: 2)
    create_faq(question: "First?", sort_order: 1)
    create_faq(question: "Hidden?", sort_order: 0, is_active: false)

    get faqs_path

    expect(response).to have_http_status(:success)
    expect_inertia.to render_component("website/faqs/index")
    expect(inertia.props[:faqs].pluck(:question)).to eq([ "First?", "Second?" ])
  end
end
