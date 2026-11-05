# frozen_string_literal: true

class Current < ActiveSupport::CurrentAttributes
  attribute :session
  attribute :user_agent, :ip_address
  attribute :language_ids_by_code # memo for Language.ids_by_code

  delegate :user, to: :session, allow_nil: true
end
