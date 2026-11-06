# frozen_string_literal: true

# Public FAQ page: every active FAQ, in the dashboard's sort order.
class Website::FaqsController < Website::BaseController
  skip_before_action :authenticate
  before_action :perform_authentication

  def index
    faqs = Faq.where(is_active: true).ordered.includes(:faq_translations)

    render inertia: {
      faqs: faqs.map do |faq|
        { id: faq.id, question: faq.translated(:question), answer: faq.translated(:answer) }
      end
    }
  end
end
