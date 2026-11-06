# frozen_string_literal: true

# Entries submitted through the website's contact us form.
class Admin::ContactMessagesController < Admin::BaseController
  include Admin::Pagination

  after_action :verify_authorized

  def index
    authorize ContactMessage

    messages, pagination = paginate(ContactMessage.search(params[:q]).newest_first)

    render inertia: {
      messages: messages.map { |message| message_props(message) },
      filters: { q: params[:q].presence },
      pagination: pagination
    }
  end

  def show
    message = ContactMessage.find(params[:id])
    authorize message

    render inertia: { message: message_props(message).merge(message: message.message) }
  end

  def destroy
    message = ContactMessage.find(params[:id])
    authorize message

    message.destroy!
    redirect_to admin_contact_messages_path, notice: "Message from #{message.full_name} was deleted"
  end

  private

  def message_props(message)
    {
      id: message.id,
      first_name: message.first_name,
      last_name: message.last_name,
      full_name: message.full_name,
      email: message.email,
      phone: message.phone,
      excerpt: message.message.truncate(90),
      created_at: message.created_at
    }
  end
end
