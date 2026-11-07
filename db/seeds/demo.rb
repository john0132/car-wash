# frozen_string_literal: true

# Demo data: catalog with photos, staff, customers, bookings, payments and contact messages.
# Loaded by db/seeds.rb in development, and elsewhere with SEED_DEMO=1.
# Idempotent: records are looked up by a natural key (email, code, English name)
# and bookings are only generated for customers who have none yet.

# The development password is in the repo, so other environments never use it: demo staff and customers
# get DEMO_PASSWORD, or a random password nobody knows (they exist to fill the dashboard, not to sign in).
demo_password =
  if Rails.env.development?
    "password123456"
  else
    ENV["DEMO_PASSWORD"].presence || SecureRandom.base58(32)
  end
if demo_password.length < 12
  abort "DEMO_PASSWORD must be at least 12 characters."
end
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

# Created in every environment by db/seeds/payment_methods.rb.
payment_methods = PaymentMethod.where(code: %w[cash card wallet]).to_a
payment_by_code = payment_methods.index_by(&:code)

# Photos live in db/seeds/images/ (sources and licenses in CREDITS.md). They are JPEGs on purpose:
# Active Storage serves SVG as a download, so browsers will not render it in an <img>.
photo = lambda do |path|
  { io: File.open(Rails.root.join("db/seeds/images", path)), filename: File.basename(path),
    content_type: "image/jpeg", identify: false }
end
# Attaches the photo unless the record already has a real image. Replaces the SVG placeholders
# that older versions of this file attached.
attach_photo = lambda do |record, path|
  next if record.image.attached? && record.image.content_type != "image/svg+xml"

  record.image.attach(photo.(path))
end

# English name => [Arabic name, shown on the homepage, image]
category_catalog = {
  "Exterior" => [ "خارجي", true, "categories/exterior.jpg" ],
  "Interior" => [ "داخلي", true, "services/interior-detailing.jpg" ],
  "Detailing" => [ "التلميع والعناية", true, "services/paint-polish-wax.jpg" ],
  "Protection" => [ "حماية", false, "categories/protection.jpg" ]
}
exterior, interior, detailing, protection = category_catalog.map do |en_name, (ar_name, on_home_page, image)|
  category = translated.(ServiceCategory, en_name, ar_name)
  category.update!(is_active: true, display_in_home_page: on_home_page)
  attach_photo.(category, image)
  category
end

# Every service gets a full page: prices, duration, copy, SEO text and a photo
# (db/seeds/images/services/<slug>.jpg), so no section of the single-service page renders empty.
# English name => [Arabic name, category, price, sale price, minutes,
#                  { code => [title, description, seo title, seo description] }]
service_catalog = {
  "Exterior Wash" => [ "غسيل خارجي", exterior, 150, 120, 45, {
    "en" => [ "A careful hand wash, top to bottom",
              "We rinse away road film with a pH-neutral foam, wash panel by panel with clean mitts, and dry with soft microfibre so nothing is dragged across the paint.\n\nWheels, arches and door shuts are cleaned too, and the glass is left streak-free.",
              "Exterior Hand Car Wash",
              "A careful pH-neutral hand wash with wheels, arches and glass cleaned, done at your door." ],
    "ar" => [ "غسيل يدوي دقيق من الأعلى إلى الأسفل",
              "نزيل أوساخ الطريق برغوة متعادلة، ونغسل كل جزء من السيارة بقفازات نظيفة، ثم نجففها بقماش ناعم حتى لا يتأذى الطلاء.\n\nننظف العجلات والأطراف الداخلية للأبواب، ونترك الزجاج لامعًا بلا أثر.",
              "غسيل خارجي يدوي للسيارة",
              "غسيل يدوي دقيق برغوة متعادلة مع تنظيف العجلات والزجاج، حتى باب منزلك." ]
  } ],
  "Full Wash" => [ "غسيل كامل", exterior, 400, 350, 120, {
    "en" => [ "The complete clean, inside and out",
              "Our full exterior hand wash plus a thorough interior: vacuumed seats and carpets, wiped surfaces and cleaned glass.\n\nThe best choice when the car hasn't had attention in a while, or before a long trip.",
              "Full Interior and Exterior Car Wash",
              "A full hand wash plus a thorough interior clean: vacuumed seats and carpets, wiped surfaces and spotless glass." ],
    "ar" => [ "تنظيف شامل من الداخل والخارج",
              "غسيل خارجي يدوي كامل مع تنظيف داخلي دقيق: شفط المقاعد والسجاد، ومسح الأسطح، وتنظيف الزجاج.\n\nالخيار الأمثل عندما تحتاج سيارتك إلى عناية كاملة أو قبل رحلة طويلة.",
              "غسيل كامل للسيارة داخليًا وخارجيًا",
              "غسيل يدوي كامل مع تنظيف داخلي شامل للمقاعد والسجاد والأسطح والزجاج." ]
  } ],
  "Interior Detailing" => [ "تنظيف داخلي", interior, 300, 260, 150, {
    "en" => [ "A cabin that feels new again",
              "Deep vacuuming, steam cleaning of fabric and carpets, and conditioning for leather and plastics.\n\nWe work through vents, seams and door pockets, where dust and crumbs collect.",
              "Interior Car Detailing",
              "Deep vacuuming, steam cleaning and leather conditioning that make your cabin feel new again." ],
    "ar" => [ "مقصورة تبدو كأنها جديدة",
              "شفط عميق، وتنظيف بالبخار للأقمشة والسجاد، وتغذية الجلد والبلاستيك.\n\nنصل إلى فتحات التهوية والدرزات وجيوب الأبواب حيث يتجمع الغبار والفتات.",
              "تنظيف وتلميع داخلي للسيارة",
              "شفط عميق وتنظيف بالبخار وتغذية للجلد لتبدو مقصورتك كأنها جديدة." ]
  } ],
  "Ceramic Coating" => [ "طلاء السيراميك", protection, 2500, 2200, 240, {
    "en" => [ "Lasting gloss and protection",
              "After a full paint decontamination, we apply a ceramic coating that bonds to the clear coat and repels water, dirt and UV.\n\nThe paint stays glossy and is far easier to wash for up to two years.",
              "Ceramic Paint Coating",
              "A durable ceramic coating that repels water, dirt and UV and keeps your paint glossy for up to two years." ],
    "ar" => [ "لمعان وحماية تدومان طويلًا",
              "بعد تنظيف الطلاء بالكامل، نضع طبقة سيراميك تلتصق بالطلاء الشفاف وتطرد الماء والأوساخ والأشعة فوق البنفسجية.\n\nيبقى الطلاء لامعًا وأسهل في الغسيل لمدة تصل إلى عامين.",
              "طلاء السيراميك للسيارة",
              "طبقة سيراميك متينة تطرد الماء والأوساخ وتحافظ على لمعان الطلاء حتى عامين." ]
  } ],
  "Paint Polish & Wax" => [ "تلميع ودهان الشمع", detailing, 600, 520, 180, {
    "en" => [ "Deep shine with a protective wax finish",
              "We machine-polish the paint to remove swirls and light scratches, then seal it with a hand-applied wax.\n\nThe result is a deep, mirror-like shine that protects the paint for months.",
              "Paint Polish and Wax",
              "Machine polishing removes swirls and light scratches, followed by a protective hand-applied wax." ],
    "ar" => [ "لمعان عميق مع طبقة شمع واقية",
              "نصقل الطلاء آليًا لإزالة الخدوش الخفيفة والدوامات، ثم نغطيه بطبقة شمع تُوضع يدويًا.\n\nالنتيجة لمعان عميق كالمرآة وحماية للطلاء لعدة أشهر.",
              "تلميع الطلاء ودهان الشمع",
              "تلميع آلي يزيل الخدوش الخفيفة متبوعًا بطبقة شمع واقية تُوضع يدويًا." ]
  } ],
  "Headlight Polishing" => [ "تلميع المصابيح", protection, 250, 200, 60, {
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

services = service_catalog.map do |en_name, (ar_name, category, price, sale_price, minutes, content)|
  service = translated.(Service, en_name, ar_name, service_category: category, price: price)
  service.update!(service_category: category, price: price, sale_price: sale_price, duration_minutes: minutes,
                  is_active: true)
  content.each do |code, (title, description, seo_title, seo_description)|
    language = code == "en" ? english : arabic
    service.service_translations.find_by!(language: language)
      .update!(title: title, description: description, seo_title: seo_title, seo_description: seo_description)
  end
  attach_photo.(service, "services/#{en_name.parameterize}.jpg")
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
    u.assign_attributes(name: name, last_name: last_name, password: demo_password, role: :admin, is_active: active)
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
    u.assign_attributes(name: name, last_name: last_name, password: demo_password, role: :employee, is_active: active)
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

car_models = [ %w[Toyota Corolla], %w[Hyundai Elantra], %w[Kia Sportage], %w[Nissan Sunny], %w[BMW X5] ]
car_colors = %w[White Black Silver Blue Red]
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
    u.assign_attributes(name: name, last_name: last_name, password: demo_password, role: :customer,
      is_active: active, membership: memberships[tier], package: package, created_at: (400 - index * 30).days.ago)
  end
  if customer.cars.none?
    rng.rand(1..2).times do
      make, model = car_models.sample(random: rng)
      customer.cars.create!(make: make, model: model, color: car_colors.sample(random: rng),
        license_plate: "#{Array.new(3) { ("A".."Z").to_a.sample(random: rng) }.join} #{rng.rand(1000..9999)}")
    end
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

winter_blog = Blog.find_or_initialize_by(slug: "winter-car-care-tips")
if winter_blog.new_record?
  blog = winter_blog
  blog.blog_translations.build(language: english, name: "Winter tips", title: "5 winter car care tips",
    subtitle: "Keep your car clean when the weather isn't",
    body: "<p>Cold weather is hard on paint.</p><ul><li>Wash every two weeks</li><li>Protect with wax</li></ul>",
    seo_description: "Simple ways to protect your car in winter.")
  blog.save!
end
unless winter_blog.cover_image.attached?
  winter_blog.cover_image.attach(io: File.open(Rails.root.join("db/seeds/images/blogs/winter-car-care-tips.png")),
                                 filename: "winter-car-care-tips.png", content_type: "image/png", identify: false)
end

# Messages from the contact us form, for the dashboard inbox. Looked up by email.
[
  [ "Ahmed", "Fawzy", "ahmed.fawzy@example.com", "+20 100 123 4567", 2,
    "Hello, do you cover 6th of October City? I would like a full wash for two cars every Friday morning." ],
  [ "Rana", "Samy", "rana.samy@example.com", "+20 111 765 4321", 5,
    "I booked a ceramic coating for next week. How long should I avoid washing the car after it is applied?" ],
  [ "Karim", "Lotfy", "karim.lotfy@example.com", "+20 122 555 0198", 9,
    "We run a small office with eight company cars. Do you offer a monthly contract with an invoice for businesses?" ],
  [ "Mai", "Adel", "mai.adel@example.com", "+20 109 222 3344", 16,
    "Your team did a great job on my interior today, thank you! Can I request the same washer for my next booking?" ]
].each do |first_name, last_name, email, phone, days_ago, message|
  ContactMessage.find_or_create_by!(email: email) do |m|
    m.assign_attributes(first_name: first_name, last_name: last_name, phone: phone, message: message,
      created_at: days_ago.days.ago.change(hour: 10 + days_ago % 8))
  end
end

# Header "Services" dropdown: categories, and each category's services.
HeaderServicesMenu.sync!
