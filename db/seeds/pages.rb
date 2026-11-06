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
