# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin contact messages", type: :request do
  fixtures :users

  let(:admin) { users(:admin) }

  before { sign_in admin }

  def create_message(first_name: "Sara", **attrs)
    ContactMessage.create!({ first_name: first_name, last_name: "Ali", email: "sara@example.com", phone: "0100123456", message: "Hello there" }.merge(attrs))
  end

  it "lists messages newest first and searches them" do
    grant(admin, "contact_messages.read")
    create_message(first_name: "Old")
    create_message(first_name: "New")

    get admin_contact_messages_path
    expect_inertia.to render_component("admin/contact_messages/index")
    expect(inertia.props[:messages].pluck(:first_name)).to eq(%w[New Old])

    get admin_contact_messages_path, params: { q: "old" }
    expect(inertia.props[:messages].pluck(:first_name)).to eq(%w[Old])
  end

  it "shows a message" do
    grant(admin, "contact_messages.read")
    message = create_message

    get admin_contact_message_path(message)

    expect_inertia.to render_component("admin/contact_messages/show")
    expect(inertia.props[:message][:message]).to eq("Hello there")
  end

  it "is forbidden without contact_messages.read" do
    get admin_contact_messages_path

    expect(response).to redirect_to(admin_root_path)
  end

  it "deletes a message with contact_messages.delete" do
    grant(admin, "contact_messages.delete")
    message = create_message

    expect { delete admin_contact_message_path(message) }.to change(ContactMessage, :count).by(-1)
  end
end
