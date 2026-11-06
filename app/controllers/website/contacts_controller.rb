# frozen_string_literal: true

# Public contact us page. Its content is the CMS Page with slug "contact"
# (edited under Pages in the dashboard); the form below it stores submissions
# as ContactMessages for the dashboard.
class Website::ContactsController < Website::BaseController
  include Website::RendersPage

  SLUG = "contact"

  skip_before_action :authenticate
  before_action :perform_authentication

  # Public, unauthenticated write endpoint: throttle per IP to limit spam.
  rate_limit to: 5, within: 10.minutes, only: :create,
             with: -> { redirect_to contact_path, inertia: { errors: { message: [ t("website.errors.too_many_messages") ] } } }

  def show
    render inertia: {
      page: find_page(SLUG)&.render_props || fallback_page,
      defaults: Current.user ? { first_name: Current.user.name, last_name: Current.user.last_name, email: Current.user.email } : {}
    }
  end

  def create
    # Honeypot: real users never fill this hidden field; bots do. Pretend success.
    return redirect_to(contact_path) if params[:website].present?

    message = ContactMessage.new(message_params)

    if message.save
      redirect_to contact_path
    else
      redirect_to contact_path, inertia: { errors: message.errors.to_hash }
    end
  end

  private

  def message_params
    params.expect(contact_message: %i[first_name last_name email phone message])
  end

  # Shown until staff create (or after they disable) the "contact" page.
  def fallback_page
    { id: nil, slug: SLUG, title: "Contact us", subtitle: nil,
      seo: { title: "Contact us — Auto Atelier", description: nil, image: nil }, sections: [], components: {} }
  end
end
