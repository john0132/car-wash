# frozen_string_literal: true

require "axe-rspec"

# Helpers for browser specs of the public website.
module WebsiteSystemHelpers
  PHONE_SIZE = [ 375, 812 ].freeze

  # Runs the block in a phone-sized window, then puts the usual size back.
  def on_a_phone
    page.driver.browser.manage.window.resize_to(*PHONE_SIZE)
    yield
  ensure
    page.driver.browser.manage.window.resize_to(1400, 1400)
  end

  # The language switcher shows the language's own name, as the seeds do.
  def native_arabic
    Language.find_or_create_by!(code: "ar") { |l| l.name = "العربية" }
  end

  def horizontal_overflow?
    page.evaluate_script("document.documentElement.scrollWidth > document.documentElement.clientWidth")
  end

  # Radix selects are not <select>s: open the trigger, then pick the option by its text.
  def pick_option(trigger_selector, text)
    find(trigger_selector).click
    find("[role=option]", text: text).click
  end

  def focused_id
    page.evaluate_script("document.activeElement && document.activeElement.id")
  end

  def set_checkout_draft(service, draft)
    visit "/up"
    page.execute_script("sessionStorage.setItem('checkout:#{service.slug}', #{draft.to_json.to_json})")
  end
end

RSpec.configure do |config|
  config.include WebsiteSystemHelpers, type: :system
end
