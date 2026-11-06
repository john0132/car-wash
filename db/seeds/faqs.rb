# frozen_string_literal: true

# Starter FAQs for the public /faqs page. Loaded by db/seeds.rb in every
# environment. Only created once — re-seeding never overwrites them, so
# dashboard edits survive.

english = Language.find_or_create_by!(code: "en") { |l| l.name = "English" }

unless Faq.exists?
  [
    [ "How do I book a wash?",
      "Create an account, pick a service, choose a date and time, and confirm. You'll get a confirmation as soon as the booking is placed." ],
    [ "Do I need to be present during the service?",
      "No. As long as we can reach your car, you can drop it off and leave. We'll let you know when it's ready." ],
    [ "How long does a service take?",
      "It depends on the service. The duration is listed on each service page, from a quick exterior wash to a full detail." ],
    [ "Can I cancel or reschedule a booking?",
      "Yes. You can cancel or reschedule from your bookings page. Please do so at least 24 hours ahead to avoid a cancellation fee." ],
    [ "What payment methods do you accept?",
      "We accept major credit and debit cards, as well as cash on the day of the service." ],
    [ "Do you offer add-ons?",
      "Yes. When you book a service you can add extras such as interior fragrance, wax protection or engine bay cleaning." ],
    [ "Which products do you use?",
      "We use pH-balanced, paint-safe products and microfibre tools to protect your car's finish." ],
    [ "What if I'm not happy with the result?",
      "Tell us within 48 hours and we'll bring your car back in to put it right at no extra cost." ],
    [ "Do you offer memberships?",
      "Yes. Memberships give you regular washes at a lower price per visit. See the membership options on our website." ],
    [ "Can I save more than one car or address?",
      "Yes. Add as many cars and addresses as you like in your account, then choose the right ones when you book." ]
  ].each_with_index do |(question, answer), position|
    faq = Faq.new(sort_order: position, is_active: true)
    faq.faq_translations.build(language: english, question: question, answer: answer)
    faq.save!
  end
end
