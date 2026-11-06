# frozen_string_literal: true

# Demo data for local development. Loaded by db/seeds.rb in development only.
# Idempotent: records are looked up by a natural key (email, code, English name)
# and bookings are only generated for customers who have none yet.

demo_password = "password123456"
rng = Random.new(2026)
geo = RGeo::Geographic.spherical_factory(srid: 4326)

english = Language.find_or_create_by!(code: "en") { |l| l.name = "English" }
arabic = Language.find_or_create_by!(code: "ar") { |l| l.name = "العربية" }

# Finds a record by its English translation name, or creates it with `attrs`,
# then makes sure both the English and Arabic translations exist. New records
# are saved together with their translations (City and Area require an English name).
translated = lambda do |klass, en_name, ar_name, **attrs|
  association = :"#{klass.model_name.singular}_translations"
  names = { english => en_name, arabic => ar_name }
  record = klass.joins(association).find_by(association => { name: en_name, language_id: english.id })

  if record
    names.each do |language, name|
      record.public_send(association).find_or_create_by!(language: language) { |t| t.name = name }
    end
  else
    record = klass.new(**attrs)
    names.each { |language, name| record.public_send(association).build(language: language, name: name) }
    record.save!
  end
  record
end

# --- Catalog ----------------------------------------------------------------

memberships = {
  silver: translated.(Membership, "Silver", "فضي",
    egp_to_points: 1, points_to_egp: 0.10, background_color: "#C0C0C0", text_color: "#1F2937"),
  gold: translated.(Membership, "Gold", "ذهبي",
    egp_to_points: 1.5, points_to_egp: 0.15, background_color: "#D4AF37", text_color: "#1F2937"),
  platinum: translated.(Membership, "Platinum", "بلاتيني",
    egp_to_points: 2, points_to_egp: 0.20, background_color: "#1F2937", text_color: "#F9FAFB")
}

packages = [
  Package.find_or_create_by!(name: "Monthly Basic") { |p| p.price = 499; p.description = "4 exterior washes a month" },
  Package.find_or_create_by!(name: "Monthly Premium") { |p| p.price = 899; p.description = "4 full washes and 1 interior detail a month" }
]

cairo = translated.(City, "Cairo", "القاهرة")
giza = translated.(City, "Giza", "الجيزة")

# A square geofence of ±`half` degrees around a center point.
square = lambda do |lat, lng, half = 0.015|
  corners = [ [ -half, -half ], [ half, -half ], [ half, half ], [ -half, half ], [ -half, -half ] ]
  geo.polygon(geo.linear_ring(corners.map { |dlng, dlat| geo.point(lng + dlng, lat + dlat) }))
end

# [area, center latitude, center longitude]. Each area gets a square geofence
# around its center, including areas seeded before geofences were required.
areas = [
  [ "Maadi", "المعادي", cairo, 1.0, 29.9602, 31.2569 ],
  [ "Zamalek", "الزمالك", cairo, 1.2, 30.0609, 31.2194 ],
  [ "New Cairo", "القاهرة الجديدة", cairo, 1.1, 30.0300, 31.4700 ],
  [ "Dokki", "الدقي", giza, 1.0, 30.0385, 31.2123 ],
  [ "Sheikh Zayed", "الشيخ زايد", giza, 1.3, 30.0444, 30.9833 ]
].map do |en_name, ar_name, city, rate, lat, lng|
  record = translated.(Area, en_name, ar_name, city: city, rate: rate, geofence: square.(lat, lng))
  record.update!(geofence: square.(lat, lng)) if record.geofence.nil?
  [ record, lat, lng ]
end

payment_methods = [ [ "cash", "Cash", "نقدي" ], [ "card", "Card", "بطاقة" ], [ "wallet", "Wallet", "المحفظة" ] ].map do |code, en, ar|
  PaymentMethod.find_or_create_by!(code: code).tap do |method|
    { english => en, arabic => ar }.each do |language, name|
      method.payment_method_translations.find_or_create_by!(language: language) { |t| t.name = name }
    end
  end
end
payment_by_code = payment_methods.index_by(&:code)

exterior = translated.(ServiceCategory, "Exterior", "خارجي")
interior = translated.(ServiceCategory, "Interior", "داخلي")
protection = translated.(ServiceCategory, "Protection", "حماية")

# Every service gets a full page: prices, duration, copy, SEO text and an image,
# so no section of the single-service page renders empty.
# English name => [Arabic name, category, price, sale price, minutes, accent color,
#                  { code => [title, description, seo title, seo description] }]
service_catalog = {
  "Exterior Wash" => [ "غسيل خارجي", exterior, 150, 120, 45, "#2B6CB0", {
    "en" => [ "A careful hand wash, top to bottom",
              "We rinse away road film with a pH-neutral foam, wash panel by panel with clean mitts, and dry with soft microfibre so nothing is dragged across the paint.\n\nWheels, arches and door shuts are cleaned too, and the glass is left streak-free.",
              "Exterior Hand Car Wash",
              "A careful pH-neutral hand wash with wheels, arches and glass cleaned, done at your door." ],
    "ar" => [ "غسيل يدوي دقيق من الأعلى إلى الأسفل",
              "نزيل أوساخ الطريق برغوة متعادلة، ونغسل كل جزء من السيارة بقفازات نظيفة، ثم نجففها بقماش ناعم حتى لا يتأذى الطلاء.\n\nننظف العجلات والأطراف الداخلية للأبواب، ونترك الزجاج لامعًا بلا أثر.",
              "غسيل خارجي يدوي للسيارة",
              "غسيل يدوي دقيق برغوة متعادلة مع تنظيف العجلات والزجاج، حتى باب منزلك." ]
  } ],
  "Full Wash" => [ "غسيل كامل", exterior, 400, 350, 120, "#2F855A", {
    "en" => [ "The complete clean, inside and out",
              "Our full exterior hand wash plus a thorough interior: vacuumed seats and carpets, wiped surfaces and cleaned glass.\n\nThe best choice when the car hasn't had attention in a while, or before a long trip.",
              "Full Interior and Exterior Car Wash",
              "A full hand wash plus a thorough interior clean: vacuumed seats and carpets, wiped surfaces and spotless glass." ],
    "ar" => [ "تنظيف شامل من الداخل والخارج",
              "غسيل خارجي يدوي كامل مع تنظيف داخلي دقيق: شفط المقاعد والسجاد، ومسح الأسطح، وتنظيف الزجاج.\n\nالخيار الأمثل عندما تحتاج سيارتك إلى عناية كاملة أو قبل رحلة طويلة.",
              "غسيل كامل للسيارة داخليًا وخارجيًا",
              "غسيل يدوي كامل مع تنظيف داخلي شامل للمقاعد والسجاد والأسطح والزجاج." ]
  } ],
  "Interior Detailing" => [ "تنظيف داخلي", interior, 300, 260, 150, "#B7791F", {
    "en" => [ "A cabin that feels new again",
              "Deep vacuuming, steam cleaning of fabric and carpets, and conditioning for leather and plastics.\n\nWe work through vents, seams and door pockets, where dust and crumbs collect.",
              "Interior Car Detailing",
              "Deep vacuuming, steam cleaning and leather conditioning that make your cabin feel new again." ],
    "ar" => [ "مقصورة تبدو كأنها جديدة",
              "شفط عميق، وتنظيف بالبخار للأقمشة والسجاد، وتغذية الجلد والبلاستيك.\n\nنصل إلى فتحات التهوية والدرزات وجيوب الأبواب حيث يتجمع الغبار والفتات.",
              "تنظيف وتلميع داخلي للسيارة",
              "شفط عميق وتنظيف بالبخار وتغذية للجلد لتبدو مقصورتك كأنها جديدة." ]
  } ],
  "Ceramic Coating" => [ "طلاء السيراميك", protection, 2500, 2200, 240, "#6B46C1", {
    "en" => [ "Lasting gloss and protection",
              "After a full paint decontamination, we apply a ceramic coating that bonds to the clear coat and repels water, dirt and UV.\n\nThe paint stays glossy and is far easier to wash for up to two years.",
              "Ceramic Paint Coating",
              "A durable ceramic coating that repels water, dirt and UV and keeps your paint glossy for up to two years." ],
    "ar" => [ "لمعان وحماية تدومان طويلًا",
              "بعد تنظيف الطلاء بالكامل، نضع طبقة سيراميك تلتصق بالطلاء الشفاف وتطرد الماء والأوساخ والأشعة فوق البنفسجية.\n\nيبقى الطلاء لامعًا وأسهل في الغسيل لمدة تصل إلى عامين.",
              "طلاء السيراميك للسيارة",
              "طبقة سيراميك متينة تطرد الماء والأوساخ وتحافظ على لمعان الطلاء حتى عامين." ]
  } ],
  "Paint Polish & Wax" => [ "تلميع ودهان الشمع", ServiceCategory.find_by(slug: "detailing") || protection, 600, 520, 180, "#C53030", {
    "en" => [ "Deep shine with a protective wax finish",
              "We machine-polish the paint to remove swirls and light scratches, then seal it with a hand-applied wax.\n\nThe result is a deep, mirror-like shine that protects the paint for months.",
              "Paint Polish and Wax",
              "Machine polishing removes swirls and light scratches, followed by a protective hand-applied wax." ],
    "ar" => [ "لمعان عميق مع طبقة شمع واقية",
              "نصقل الطلاء آليًا لإزالة الخدوش الخفيفة والدوامات، ثم نغطيه بطبقة شمع تُوضع يدويًا.\n\nالنتيجة لمعان عميق كالمرآة وحماية للطلاء لعدة أشهر.",
              "تلميع الطلاء ودهان الشمع",
              "تلميع آلي يزيل الخدوش الخفيفة متبوعًا بطبقة شمع واقية تُوضع يدويًا." ]
  } ],
  "Headlight Polishing" => [ "تلميع المصابيح", protection, 250, 200, 60, "#C05621", {
    "en" => [ "Clear, bright headlights again",
              "We sand and polish yellowed or foggy headlight lenses, then seal them against UV so they stay clear.\n\nBetter night visibility and a car that looks years younger.",
              "Headlight Polishing and Restoration",
              "Restore yellowed, foggy headlights to a clear finish with a UV seal for better night visibility." ],
    "ar" => [ "مصابيح أمامية صافية ومضيئة من جديد",
              "نصقل عدسات المصابيح المصفرة أو الضبابية ونغطيها بطبقة حماية من الأشعة فوق البنفسجية لتبقى صافية.\n\nرؤية أفضل ليلًا ومظهر أحدث للسيارة.",
              "تلميع وتجديد المصابيح الأمامية",
              "استعادة صفاء المصابيح المصفرة مع طبقة حماية لرؤية أفضل ليلًا." ]
  } ]
}

# A simple branded placeholder illustration: a car silhouette on a tinted backdrop.
service_image = lambda do |label, color|
  svg = <<~SVG
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <rect width="800" height="600" fill="#{color}" opacity="0.15"/>
      <rect width="800" height="600" fill="#F6F1E7" opacity="0.6"/>
      <path d="M130 380 L180 290 Q200 260 240 260 L520 260 Q570 260 600 300 L660 380 Z" fill="#{color}"/>
      <rect x="110" y="370" width="580" height="60" rx="24" fill="#{color}"/>
      <circle cx="240" cy="440" r="42" fill="#2B3A32"/><circle cx="240" cy="440" r="18" fill="#F6F1E7"/>
      <circle cx="560" cy="440" r="42" fill="#2B3A32"/><circle cx="560" cy="440" r="18" fill="#F6F1E7"/>
      <text x="400" y="540" text-anchor="middle" font-family="sans-serif" font-size="40" fill="#2B3A32">#{label}</text>
    </svg>
  SVG
  { io: StringIO.new(svg), filename: "#{label.parameterize}.svg", content_type: "image/svg+xml" }
end

protection.update!(is_active: true)
unless protection.image.attached?
  protection.image.attach(service_image.("Protection", "#6B46C1"))
end

services = service_catalog.map do |en_name, (ar_name, category, price, sale_price, minutes, color, content)|
  service = translated.(Service, en_name, ar_name, service_category: category, price: price)
  service.update!(price: price, sale_price: sale_price, duration_minutes: minutes, is_active: true)
  content.each do |code, (title, description, seo_title, seo_description)|
    language = code == "en" ? english : arabic
    service.service_translations.find_by!(language: language)
      .update!(title: title, description: description, seo_title: seo_title, seo_description: seo_description)
  end
  service.image.attach(service_image.(en_name, color)) unless service.image.attached?
  service
end
extras = [
  translated.(Extra, "Tire Shine", "تلميع الإطارات", price: 50),
  translated.(Extra, "Wax Coating", "طبقة شمع", price: 120),
  translated.(Extra, "Air Freshener", "معطر جو", price: 30),
  translated.(Extra, "Headlight Restoration", "تجديد المصابيح الأمامية", price: 180),
  translated.(Extra, "Engine Bay Cleaning", "تنظيف حجرة المحرك", price: 140),
  translated.(Extra, "Leather Conditioning", "تغذية الجلد", price: 160),
  translated.(Extra, "Pet Hair Removal", "إزالة شعر الحيوانات", price: 90)
]

# --- Roles and staff ----------------------------------------------------------

permission = ->(key) { Permission.find_by!(resource: key.split(".").first, action: key.split(".").last) }
role_definitions = {
  "Operations Manager" => [ "Runs daily operations and the field team",
    %w[customers.read customers.update employees.read employees.create employees.update employees.delete] ],
  "Support Agent" => [ "Handles customer accounts", %w[customers.read customers.update] ],
  "HR Manager" => [ "Manages staff accounts", %w[employees.read employees.create employees.update employees.delete admins.read] ]
}
roles = role_definitions.to_h do |name, (description, keys)|
  role = Role.find_or_create_by!(name: name) { |r| r.description = description }
  role.permissions << (keys.map(&permission) - role.permissions)
  [ name, role ]
end

[
  [ "sara.manager@example.com", "Sara", "Mostafa", "Operations Manager", true ],
  [ "omar.support@example.com", "Omar", "Hassan", "Support Agent", true ],
  [ "layla.hr@example.com", "Layla", "Fathy", "HR Manager", false ]
].each do |email, name, last_name, role_name, active|
  admin = User.find_or_create_by!(email: email) do |u|
    u.assign_attributes(name: name, last_name: last_name, password: demo_password, role: :admin, verified: true, is_active: active)
  end
  admin.roles << roles[role_name] unless admin.roles.include?(roles[role_name])
end

employees = [
  [ "karim.washer@example.com", "Karim", "Adel", true ],
  [ "mahmoud.washer@example.com", "Mahmoud", "Samir", true ],
  [ "youssef.washer@example.com", "Youssef", "Nabil", true ],
  [ "ahmed.washer@example.com", "Ahmed", "Tarek", true ],
  [ "hany.washer@example.com", "Hany", "Gamal", false ]
].map do |email, name, last_name, active|
  User.find_or_create_by!(email: email) do |u|
    u.assign_attributes(name: name, last_name: last_name, password: demo_password, role: :employee, verified: true, is_active: active)
  end
end
active_employees = employees.select(&:is_active?)

# --- Customers, addresses, bookings, payments ---------------------------------

customers = [
  [ "Mona", "Ibrahim", :platinum, packages[1], true ],
  [ "Tamer", "Ezzat", :gold, packages[0], true ],
  [ "Nour", "Khaled", :gold, nil, true ],
  [ "Hassan", "Ali", :silver, nil, true ],
  [ "Dina", "Fouad", :silver, packages[0], true ],
  [ "Ramy", "Saeed", nil, nil, true ],
  [ "Salma", "Wael", :platinum, nil, true ],
  [ "Mostafa", "Reda", :silver, nil, false ],
  [ "Yasmin", "Sherif", nil, nil, true ],
  [ "Khaled", "Mansour", :gold, nil, true ]
]

address_labels = [ "Home", "Work", "Gym", "Parents' house" ]
statuses_by_age = ->(days_ago) {
  if days_ago.negative? then %w[pending confirmed confirmed]
  elsif days_ago.zero? then %w[in_progress confirmed]
  else %w[completed completed completed completed cancelled]
  end
}

customers.each_with_index do |(name, last_name, tier, package, active), index|
  email = "#{name.downcase}.#{last_name.downcase}@example.com"
  customer = User.find_or_create_by!(email: email) do |u|
    u.assign_attributes(name: name, last_name: last_name, password: demo_password, role: :customer, verified: true,
      is_active: active, membership: memberships[tier], package: package, created_at: (400 - index * 30).days.ago)
  end
  next if customer.bookings.any?

  addresses = Array.new(rng.rand(1..3)) do |i|
    area, lat, lng = areas[(index + i) % areas.size]
    customer.addresses.create!(name: address_labels[i], area: area,
      location: geo.point(lng + rng.rand(-0.01..0.01), lat + rng.rand(-0.01..0.01)))
  end

  rng.rand(3..9).times do
    days_ago = rng.rand < 0.3 ? rng.rand(-7..0) : rng.rand(1..120)
    status = statuses_by_age.(days_ago).sample(random: rng)
    service = services.sample(random: rng)
    chosen_extras = extras.sample(rng.rand(0..2), random: rng)
    subtotal = service.sale_price || service.price
    extras_total = chosen_extras.sum(&:price)
    discounts = rng.rand < 0.2 ? 25 : 0
    payment_status =
      case status
      when "completed" then "paid"
      when "cancelled" then %w[unpaid refunded].sample(random: rng)
      when "in_progress" then %w[unpaid paid].sample(random: rng)
      else "unpaid"
      end
    employee = status == "pending" && rng.rand < 0.5 ? nil : active_employees.sample(random: rng)
    scheduled_at = days_ago.days.ago.change(hour: rng.rand(8..19), min: [ 0, 30 ].sample(random: rng))

    booking = customer.bookings.create!(
      employee: employee, package: customer.package, status: status, payment_status: payment_status,
      subtotal: subtotal, extras_total: extras_total, discounts: discounts,
      total_amount: subtotal + extras_total - discounts,
      scheduled_at: scheduled_at, created_at: scheduled_at - rng.rand(1..5).days
    )
    booking.booking_items.create!(itemable: service, quantity: 1, price: subtotal)
    chosen_extras.each { |extra| booking.booking_items.create!(itemable: extra, quantity: 1, price: extra.price) }

    address = addresses.sample(random: rng)
    booking.create_booking_address!(address: address, name: address.name, location: address.location,
      area_name: address.area.translation(:en).name, city_name: address.area.city.translation(:en).name)

    next if payment_status == "unpaid"

    method = payment_methods.sample(random: rng)
    customer.payment_transactions.create!(booking: booking, payment_method: method, amount: booking.total_amount,
      status: payment_status == "refunded" ? "refunded" : "completed",
      reference: "TX-#{booking.id.to_s.rjust(6, '0')}", created_at: scheduled_at)
  end

  # A couple of wallet top-ups, not tied to a booking.
  wallet_topups = Array.new(rng.rand(0..2)) { [ 200, 500, 1000 ].sample(random: rng) }
  wallet_topups.each_with_index do |amount, i|
    customer.payment_transactions.create!(payment_method: payment_by_code["card"], amount: amount, status: "completed",
      reference: "TOPUP-#{customer.id}-#{i + 1}", created_at: rng.rand(5..90).days.ago)
  end

  rate = customer.membership&.egp_to_points || 1
  lifetime_points = (customer.bookings.paid.sum(:total_amount) * rate).to_i
  spent_from_wallet = rng.rand(0..wallet_topups.sum / 2)
  customer.update!(
    lifetime_points: lifetime_points,
    points: (lifetime_points * rng.rand(0.3..1.0)).to_i,
    wallet: wallet_topups.sum - spent_from_wallet
  )
end

# --- Content ----------------------------------------------------------------

unless Page.exists?(slug: "about")
  components = Component.where(key: %w[hero rich_text cta features]).index_by(&:key)
  page = Page.new(slug: "about")
  page.page_translations.build(language: english, name: "About", title: "About us",
    subtitle: "Mobile car care since 2020", seo_description: "Who we are and how our mobile car wash works.")
  page.page_translations.build(language: arabic, name: "من نحن", title: "من نحن", subtitle: "عناية متنقلة بالسيارات منذ 2020")

  section = ->(key, position, settings, content) {
    page.page_sections.build(component: components.fetch(key), position: position)
      .assign_values(settings: settings, content_by_language: content)
  }
  section.("hero", 0, { "button_url" => "/sign_up", "alignment" => "center" },
    english.id => { "heading" => "We come to you", "subheading" => "Book a wash and we'll be at your door.", "button_label" => "Book now" },
    arabic.id => { "heading" => "نأتي إليك", "button_label" => "احجز الآن" })
  section.("features", 1, { "items" => [ { "_id" => "fast" }, { "_id" => "eco" } ] },
    english.id => { "heading" => "Why us", "items" => { "fast" => { "title" => "Fast", "text" => "Most washes take under an hour." },
                                                         "eco" => { "title" => "Eco-friendly", "text" => "Waterless products." } } },
    arabic.id => { "heading" => "لماذا نحن", "items" => { "fast" => { "title" => "سريع" }, "eco" => { "title" => "صديق للبيئة" } } })
  section.("rich_text", 2, {},
    english.id => { "body" => "<h2>Our story</h2><p>We started with one van and a simple idea: car care should come to you.</p>" })
  section.("cta", 3, { "button_url" => "/sign_up", "variant" => "primary" },
    english.id => { "heading" => "Ready for a spotless car?", "button_label" => "Create an account" })
  page.save!
end

unless Blog.exists?(slug: "winter-car-care-tips")
  blog = Blog.new(slug: "winter-car-care-tips")
  blog.blog_translations.build(language: english, name: "Winter tips", title: "5 winter car care tips",
    subtitle: "Keep your car clean when the weather isn't",
    body: "<p>Cold weather is hard on paint.</p><ul><li>Wash every two weeks</li><li>Protect with wax</li></ul>",
    seo_description: "Simple ways to protect your car in winter.")
  blog.save!
end
