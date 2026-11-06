# frozen_string_literal: true

# The public homepage, built from the starter components (see components.rb).
# Loaded by db/seeds.rb in every environment. Only created once — re-seeding
# never overwrites it, so dashboard edits survive.

english = Language.find_or_create_by!(code: "en") { |l| l.name = "English" }

unless Page.exists?(slug: "home")
  hero = Component.find_by!(key: "hero")
  features = Component.find_by!(key: "features")
  cta = Component.find_by!(key: "cta")

  page = Page.new(slug: "home", is_active: true)
  page.page_translations.build(
    language: english,
    name: "Home",
    title: "Auto Atelier — Hand-Finished Auto Care",
    subtitle: "An unhurried shine for your car"
  )

  page.page_sections.build(component: hero, position: 0).assign_values(
    settings: { "alignment" => "left", "button_url" => "/sign_up" },
    content_by_language: {
      english.id => {
        "heading" => "An unhurried shine for your car",
        "subheading" => "Hand washing, interior detailing and ceramic protection, " \
          "carried out the slow way, by people who care about the result, not the clock.",
        "button_label" => "Book your visit"
      }
    }
  )

  page.page_sections.build(component: features, position: 1).assign_values(
    settings: {
      "items" => [
        { "_id" => "wash" },
        { "_id" => "interior" },
        { "_id" => "ceramic" },
        { "_id" => "mobile" }
      ]
    },
    content_by_language: {
      english.id => {
        "heading" => "Care, by hand",
        "items" => {
          "wash" => {
            "title" => "Hand Wash & Dry",
            "text" => "A full exterior wash, clay-bar decontamination and hand dry — no brushes, no automated tunnel."
          },
          "interior" => {
            "title" => "Interior Detail",
            "text" => "Seats, carpets and every panel vacuumed, conditioned and wiped down by hand."
          },
          "ceramic" => {
            "title" => "Ceramic Coating",
            "text" => "A long-lasting protective finish that keeps the shine, and the clean, between visits."
          },
          "mobile" => {
            "title" => "Mobile Valet",
            "text" => "We bring the detail bay to you — home, office or anywhere you've parked."
          }
        }
      }
    }
  )

  page.page_sections.build(component: features, position: 2).assign_values(
    settings: {
      "items" => [
        { "_id" => "handfinished" },
        { "_id" => "products" },
        { "_id" => "schedule" }
      ]
    },
    content_by_language: {
      english.id => {
        "heading" => "Why Auto Atelier",
        "items" => {
          "handfinished" => {
            "title" => "Hand-finished, never automated",
            "text" => "Every car is washed and dried by hand. No brush tunnels, no shortcuts."
          },
          "products" => {
            "title" => "Products we'd use on our own cars",
            "text" => "We use the same waxes, shampoos and leather care we trust on our own vehicles."
          },
          "schedule" => {
            "title" => "Booked around your day",
            "text" => "Morning drop-off, evening collection, or a mobile visit — fit the detail around " \
              "your schedule, not the other way round."
          }
        }
      }
    }
  )

  page.page_sections.build(component: cta, position: 3).assign_values(
    settings: { "variant" => "primary", "button_url" => "/sign_up" },
    content_by_language: {
      english.id => {
        "heading" => "Make it a habit, not an errand",
        "text" => "Members get a standing slot, priority booking and a car that always looks like this. " \
          "Ask us about plans when you book.",
        "button_label" => "Become a member"
      }
    }
  )

  page.save!
end

unless Page.exists?(slug: "about")
  rich_text = Component.find_by!(key: "rich_text")

  page = Page.new(slug: "about", is_active: true)
  page.page_translations.build(
    language: english,
    name: "About Us",
    title: "About Us — Auto Atelier",
    subtitle: "Hand-finished auto care, by people who care",
    seo_description: "Who we are, how we work and why we wash every car by hand."
  )

  page.page_sections.build(component: rich_text, position: 0).assign_values(
    settings: {},
    content_by_language: {
      english.id => {
        "body" => <<~HTML.squish
          <h1>About Auto Atelier</h1>
          <p>Auto Atelier began with a single detail bay and a simple conviction: a car deserves the same patience and craft
          as anything else you own. We were tired of brush tunnels, rushed turnarounds and results that looked clean only
          until the first bit of sunlight. So we did it the slow way, by hand, one car at a time.</p>
          <h2>Our story</h2>
          <p>What started as a weekend project for friends and neighbours grew by word of mouth. Today our small team of trained
          detailers looks after hundreds of cars, from daily drivers to weekend classics, in our studio and at your door.
          We have grown, but the way we work has not changed: every vehicle gets a careful inspection, the right products
          for its paint and interior, and as much time as it takes to get it right.</p>
          <h2>How we work</h2>
          <p>Every wash is done by hand with clean mitts, filtered water and pH-balanced shampoos, followed by a gentle hand dry
          that leaves no swirls behind. Interiors are vacuumed, conditioned and wiped panel by panel, and protective treatments
          such as wax and ceramic coating are applied only where they will genuinely help. We use the same products on our own
          cars, and we would not offer a service we would not book ourselves.</p>
          <h2>Our promise</h2>
          <p>Clear prices before we start, visits that begin on time, and results we are proud to put our name to. If something
          is not right, tell us and we will fix it. Your car is more than transport, and we treat it that way.</p>
          <p>Whether you drop in, schedule a morning pickup or ask us to come to you, we would love to look after your car.</p>
        HTML
      }
    }
  )

  page.save!
end

# Terms & Conditions: a plain rich-text page, linked only from the footer
# (see site_chrome.rb), not the header.
unless Page.exists?(slug: "terms-and-conditions")
  rich_text = Component.find_by!(key: "rich_text")

  page = Page.new(slug: "terms-and-conditions", is_active: true)
  page.page_translations.build(
    language: english,
    name: "Terms & Conditions",
    title: "Terms & Conditions — Auto Atelier",
    subtitle: "The terms that apply when you book with us",
    seo_description: "The terms and conditions for booking and using Auto Atelier's services."
  )

  page.page_sections.build(component: rich_text, position: 0).assign_values(
    settings: {},
    content_by_language: {
      english.id => {
        "body" => <<~HTML.squish
          <h1>Terms &amp; Conditions</h1>
          <p>These terms apply to every booking and service provided by Auto Atelier. By booking with us you agree to them.</p>
          <h2>Bookings</h2>
          <p>Bookings are confirmed once you receive a confirmation from us. Please arrive on time, or be available at the
          agreed location for mobile visits, so that we can give your car the full time it needs.</p>
          <h2>Cancellations and changes</h2>
          <p>You can cancel or reschedule free of charge up to 24 hours before your appointment. Later changes may be
          subject to a fee, and we may need to reschedule in cases of severe weather or illness.</p>
          <h2>Prices and payment</h2>
          <p>Prices are shown before you book. Payment is due on completion of the service unless agreed otherwise.
          If a vehicle needs significantly more work than described, we will tell you and agree the price before proceeding.</p>
          <h2>Your vehicle</h2>
          <p>Please remove valuables before your visit. We take great care with every vehicle but are not responsible for
          pre-existing damage, or for items left in the car. Please tell us about any known issues before we begin.</p>
          <h2>Our guarantee</h2>
          <p>If you are not happy with the result, tell us within 48 hours and we will put it right at no extra charge.</p>
          <h2>Contact</h2>
          <p>Questions about these terms? Get in touch and we will be glad to help.</p>
        HTML
      }
    }
  )

  page.save!
end
