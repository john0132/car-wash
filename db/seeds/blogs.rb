# frozen_string_literal: true

# Example blog posts (English). Idempotent: a blog is only created when its slug is missing, and a missing cover image is attached.

english = Language.find_or_create_by!(code: "en") { |l| l.name = "English" }

# Cover illustrations live in db/seeds/images/blogs/<slug>.png. They are PNGs on purpose: Active Storage serves SVG
# as a download (application/octet-stream), so browsers will not render it in an <img>.
cover_for = lambda do |slug|
  path = Rails.root.join("db/seeds/images/blogs/#{slug}.png")
  { io: File.open(path), filename: "#{slug}.png", content_type: "image/png", identify: false }
end

[
  {
    slug: "how-often-should-you-wash-your-car",
    title: "How often should you wash your car?",
    subtitle: "A simple rhythm that keeps paint protected without over-washing.",
    body: "<p>For most daily drivers, a wash every two weeks is the sweet spot. Dust, bird droppings and road film " \
      "are mildly abrasive and acidic, and the longer they sit the more they dull the clear coat.</p>" \
      "<h2>When to wash sooner</h2><p>After a long trip, a sandstorm, or any time you spot bird droppings or tree sap, " \
      "rinse and wash as soon as you can.</p>"
  },
  {
    slug: "hand-wash-vs-automatic-car-wash",
    title: "Hand wash vs. automatic car wash",
    subtitle: "Why brushes are the leading cause of swirl marks.",
    body: "<p>Automatic tunnels are quick, but the shared brushes hold grit from every car before yours. " \
      "That grit is what creates the fine circular scratches known as swirl marks.</p>" \
      "<p>A careful hand wash with clean mitts and the two-bucket method removes dirt without grinding it into the paint.</p>"
  },
  {
    slug: "what-is-ceramic-coating",
    title: "What is a ceramic coating, really?",
    subtitle: "Durable gloss and easier cleaning, explained without the hype.",
    body: "<p>A ceramic coating is a liquid polymer that bonds to your paint and cures into a hard, slick layer. " \
      "It adds depth and gloss, repels water and makes everyday dirt far easier to wash off.</p>" \
      "<p>It is not scratch-proof, but it gives paint a sacrificial shield that lasts years rather than weeks.</p>"
  },
  {
    slug: "protecting-your-interior-from-the-sun",
    title: "Protecting your interior from the sun",
    subtitle: "Simple habits that stop cracked dashboards and faded leather.",
    body: "<p>Heat and UV are the biggest enemies of dashboards, leather and plastics. " \
      "Park in shade when you can, use a windscreen sunshade, and apply a UV-protectant dressing every month or two.</p>" \
      "<p>Conditioning leather a few times a year keeps it supple and prevents cracking.</p>"
  },
  {
    slug: "preparing-your-car-for-summer",
    title: "Preparing your car for summer",
    subtitle: "A short checklist before the heat arrives.",
    body: "<ul><li>Check tyre pressure — hot roads raise it.</li><li>Test the A/C and replace the cabin filter.</li>" \
      "<li>Wax or seal the paint for extra protection.</li><li>Top up coolant and washer fluid.</li></ul>"
  }
].each_with_index do |attrs, index|
  existing = Blog.find_by(slug: attrs[:slug])
  if existing
    existing.cover_image.attach(cover_for.(attrs[:slug])) unless existing.cover_image.attached?
    next
  end

  blog = Blog.new(slug: attrs[:slug], is_active: true, created_at: (index * 3).days.ago)
  blog.blog_translations.build(language: english, name: attrs[:title], title: attrs[:title],
                               subtitle: attrs[:subtitle], body: attrs[:body])
  blog.cover_image.attach(cover_for.(attrs[:slug]))
  blog.save!
end
