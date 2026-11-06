# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Website contact us", type: :request do
  before { english }

  let(:valid) { { contact_message: { first_name: "Sara", last_name: "Ali", email: "sara@example.com", phone: "0100", message: "Hi" } } }

  it "renders the CMS contact page" do
    create_page(slug: "contact", name: "Contact", title: "Talk to us")

    get contact_path

    expect_inertia.to render_component("website/contacts/show")
    expect(inertia.props[:page]).to include(slug: "contact", title: "Talk to us")
  end

  it "still renders the form before staff create the contact page" do
    get contact_path

    expect_inertia.to render_component("website/contacts/show")
    expect(inertia.props[:page][:title]).to eq("Contact us")
  end

  it "stores a submission" do
    expect { post contact_path, params: valid, as: :json }.to change(ContactMessage, :count).by(1)

    expect(response).to redirect_to(contact_path)
    expect(ContactMessage.last).to have_attributes(first_name: "Sara", email: "sara@example.com", message: "Hi")
  end

  it "rejects an invalid submission" do
    valid[:contact_message][:email] = "nope"

    expect { post contact_path, params: valid, as: :json }.not_to change(ContactMessage, :count)

    expect(response).to redirect_to(contact_path)
    expect(session[:inertia_errors]).to include(:email)
  end
end
