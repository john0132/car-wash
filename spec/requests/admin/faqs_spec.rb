# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin faqs", type: :request do
  fixtures :users

  let(:admin) { users(:admin) }

  before do
    english
    arabic
    sign_in admin
  end

  def faq_params(question: "Do you offer home service?", answer: "Yes, everywhere we operate.", sort_order: 0, is_active: true)
    { faq: { sort_order: sort_order, is_active: is_active,
             translations: { english.id.to_s => { question: question, answer: answer },
                              arabic.id.to_s => { question: "", answer: "" } } } }
  end

  describe "GET /admin/faqs" do
    it "lists faqs in sort order, filtered by question and status" do
      grant(admin, "faqs.read")
      create_faq("Second?", sort_order: 1)
      create_faq("First?", sort_order: 0, is_active: false)

      get admin_faqs_path

      expect_inertia.to render_component("admin/faqs/index")
      expect(inertia.props[:faqs].pluck(:question)).to eq([ "First?", "Second?" ])

      get admin_faqs_path, params: { q: "second" }
      expect(inertia.props[:faqs].pluck(:question)).to eq([ "Second?" ])

      get admin_faqs_path, params: { status: "active" }
      expect(inertia.props[:faqs].pluck(:question)).to eq([ "Second?" ])
    end

    it "is forbidden without faqs.read" do
      get admin_faqs_path

      expect(response).to redirect_to(admin_root_path)
      expect(flash[:alert]).to eq("You are not authorized to perform this action")
    end
  end

  describe "GET /admin/faqs/new" do
    it "offers the next sort order and one blank translation per language" do
      grant(admin, "faqs.create")
      create_faq(sort_order: 3)

      get new_admin_faq_path

      expect_inertia.to render_component("admin/faqs/new")
      expect(inertia.props[:faq][:sort_order]).to eq(4)
      expect(inertia.props[:translations].pluck(:code, :default, :question, :answer))
        .to eq([ [ "en", true, "", "" ], [ "ar", false, "", "" ] ])
    end
  end

  describe "POST /admin/faqs" do
    it "creates a faq with its translations" do
      grant(admin, "faqs.create")

      post admin_faqs_path, params: faq_params(question: "Do you offer home service?"), as: :json

      faq = Faq.last
      expect(response).to redirect_to(admin_faqs_path)
      expect(faq.sort_order).to eq(0)
      expect(faq.translation.question).to eq("Do you offer home service?")
    end

    it "requires a question and answer in the default language" do
      grant(admin, "faqs.create")

      expect {
        post admin_faqs_path, params: faq_params(question: ""), as: :json
      }.not_to change(Faq, :count)

      expect(response).to redirect_to(new_admin_faq_path)
      expect(session[:inertia_errors]).to include(:translations)
    end

    it "is forbidden without faqs.create" do
      grant(admin, "faqs.read")

      expect {
        post admin_faqs_path, params: faq_params, as: :json
      }.not_to change(Faq, :count)
    end
  end

  describe "PATCH /admin/faqs/:id" do
    it "updates the question, answer and sort order" do
      grant(admin, "faqs.update")
      faq = create_faq("Old question?")

      patch admin_faq_path(faq), params: faq_params(question: "New question?", sort_order: 5), as: :json

      expect(response).to redirect_to(admin_faqs_path)
      faq.reload
      expect(faq.sort_order).to eq(5)
      expect(faq.translation.question).to eq("New question?")
    end
  end

  describe "PATCH /admin/faqs/:id/activation" do
    it "disables the faq" do
      grant(admin, "faqs.update")
      faq = create_faq

      patch activation_admin_faq_path(faq), params: { is_active: false }

      expect(faq.reload).not_to be_is_active
    end
  end

  describe "DELETE /admin/faqs/:id" do
    it "deletes the faq" do
      grant(admin, "faqs.delete")
      faq = create_faq

      expect { delete admin_faq_path(faq) }.to change(Faq, :count).by(-1)
      expect(response).to redirect_to(admin_faqs_path)
    end
  end
end
