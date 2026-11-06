# frozen_string_literal: true

# Arabic versions of the starter website content (header and footer links, the home and
# about pages, FAQs and blog posts), so the /ar site isn't half English. Loaded by
# db/seeds.rb in every environment, after the English content it translates.
#
# Idempotent and additive, like the other starter seeds: a record that already has an
# Arabic translation is left alone, so dashboard edits survive re-seeding. Content that
# staff created themselves (their own pages, FAQs, posts) is not touched; they add the
# Arabic text from the dashboard.
#
# Also points the "Book your visit" / "Become a member" buttons at the services page.
# They used to go to the sign-up page, which only bounced signed-in customers back
# with "You are already signed in".

english = Language.find_or_create_by!(code: "en") { |l| l.name = "English" }
arabic = Language.find_or_create_by!(code: "ar") { |l| l.name = "العربية" }

# Adds the Arabic translation of `record` unless it has one.
add = lambda do |record, association, **attrs|
  translations = record.public_send(association)
  translations.create!(language: arabic, **attrs) unless translations.exists?(language_id: arabic.id)
end

# --- Header and footer ----------------------------------------------------------

header_labels = {
  [ "url", "/#services" ] => "الخدمات",
  [ "route", "faqs" ] => "الأسئلة الشائعة",
  [ "route", "contact" ] => "تواصل معنا",
  [ "page", "about" ] => "من نحن"
}

HeaderItem.top_level.find_each do |item|
  key = case item.link_type
  when "url" then [ "url", item.url ]
  when "route" then [ "route", item.route_key ]
  when "page" then [ "page", item.page&.slug ]
  end
  label = header_labels[key]
  add.(item, :header_item_translations, label: label) if label
end

footer = Footer.first
if footer
  add.(footer, :footer_translations, title: "Auto Atelier", description: "عناية يدوية متقنة بالسيارات، بموعد مسبق.")

  column_titles = { "Account" => "الحساب" }
  footer_labels = {
    [ "route", "sign_in" ] => "تسجيل الدخول",
    [ "route", "services" ] => "احجز زيارتك",
    [ "route", "faqs" ] => "الأسئلة الشائعة",
    [ "route", "blogs" ] => "المدونة",
    [ "route", "contact" ] => "تواصل معنا",
    [ "page", "terms-and-conditions" ] => "الشروط والأحكام"
  }

  footer.footer_columns.includes(:footer_column_translations, footer_items: [ :footer_item_translations, :page ]).each do |column|
    title = column_titles[column.footer_column_translations.find { |t| t.language_id == english.id }&.title]
    add.(column, :footer_column_translations, title: title) if title

    column.footer_items.each do |item|
      # "Book your visit" used to point at the sign-up page.
      english_label = item.footer_item_translations.find { |t| t.language_id == english.id }&.label
      item.update!(route_key: "services") if item.link_type == "route" && item.route_key == "sign_up" && english_label == "Book your visit"

      key = item.link_type == "page" ? [ "page", item.page&.slug ] : [ item.link_type, item.route_key ]
      label = footer_labels[key]
      add.(item, :footer_item_translations, label: label) if label
    end
  end
end

# --- FAQs -----------------------------------------------------------------------

faqs = {
  "How do I book a wash?" => [
    "كيف أحجز غسيلًا؟",
    "أنشئ حسابًا، واختر خدمة، وحدّد التاريخ والوقت، ثم أكّد. ستصلك رسالة تأكيد بمجرد تسجيل الحجز."
  ],
  "Do I need to be present during the service?" => [
    "هل يجب أن أكون حاضرًا أثناء الخدمة؟",
    "لا. ما دمنا نستطيع الوصول إلى سيارتك فيمكنك تسليمها والمغادرة. سنخبرك عندما تصبح جاهزة."
  ],
  "How long does a service take?" => [
    "كم تستغرق الخدمة؟",
    "يعتمد ذلك على الخدمة. المدة مذكورة في صفحة كل خدمة، من غسيل خارجي سريع إلى تنظيف شامل."
  ],
  "Can I cancel or reschedule a booking?" => [
    "هل يمكنني إلغاء الحجز أو تغيير موعده؟",
    "نعم. يمكنك الإلغاء أو تغيير الموعد من صفحة حجوزاتك. يرجى فعل ذلك قبل 24 ساعة على الأقل لتجنّب رسوم الإلغاء."
  ],
  "What payment methods do you accept?" => [
    "ما طرق الدفع المقبولة؟",
    "نقبل بطاقات الائتمان والخصم الرئيسية، إضافة إلى الدفع نقدًا يوم الخدمة."
  ],
  "Do you offer add-ons?" => [
    "هل تقدمون إضافات؟",
    "نعم. عند حجز خدمة يمكنك إضافة خدمات مثل معطّر للمقصورة أو حماية بالشمع أو تنظيف حجرة المحرك."
  ],
  "Which products do you use?" => [
    "ما المنتجات التي تستخدمونها؟",
    "نستخدم منتجات متوازنة الحموضة وآمنة على الطلاء، وأدوات من الألياف الدقيقة لحماية لمعان سيارتك."
  ],
  "What if I'm not happy with the result?" => [
    "ماذا لو لم تعجبني النتيجة؟",
    "أخبرنا خلال 48 ساعة وسنعيد سيارتك إلينا لنصحّح الأمر دون أي تكلفة إضافية."
  ],
  "Do you offer memberships?" => [
    "هل تقدمون عضويات؟",
    "نعم. تمنحك العضويات غسلات منتظمة بسعر أقل للزيارة. اطّلع على خيارات العضوية في موقعنا."
  ],
  "Can I save more than one car or address?" => [
    "هل يمكنني حفظ أكثر من سيارة أو عنوان؟",
    "نعم. أضف ما تشاء من السيارات والعناوين في حسابك، ثم اختر المناسب منها عند الحجز."
  ]
}

Faq.includes(:faq_translations).find_each do |faq|
  english_question = faq.faq_translations.find { |t| t.language_id == english.id }&.question
  question, answer = faqs[english_question]
  add.(faq, :faq_translations, question: question, answer: answer) if question
end

# --- Blog posts -----------------------------------------------------------------

blogs = {
  "how-often-should-you-wash-your-car" => {
    title: "كم مرة يجب أن تغسل سيارتك؟",
    subtitle: "إيقاع بسيط يحمي الطلاء دون إفراط في الغسيل.",
    body: "<p>لمعظم سائقي الاستخدام اليومي، غسلة كل أسبوعين هي النقطة المثالية. فالغبار وفضلات الطيور وطبقة الطريق " \
      "خشنة قليلًا وحمضية، وكلما بقيت أطول أكلت من لمعان الطبقة الشفافة.</p>" \
      "<h2>متى تغسل أبكر</h2><p>بعد رحلة طويلة أو عاصفة رملية، أو كلما لاحظت فضلات طيور أو عصارة أشجار، " \
      "اشطف سيارتك واغسلها في أقرب وقت ممكن.</p>"
  },
  "hand-wash-vs-automatic-car-wash" => {
    title: "الغسيل اليدوي مقابل المغسلة الآلية",
    subtitle: "لماذا تُعدّ الفُرش السبب الأول لخدوش الدوامات.",
    body: "<p>المغاسل الآلية سريعة، لكن فُرشها المشتركة تحمل رمالًا من كل سيارة سبقتك. " \
      "وهذه الرمال هي ما يصنع الخدوش الدائرية الدقيقة المعروفة بخدوش الدوامات.</p>" \
      "<p>أما الغسيل اليدوي الدقيق بقفازات نظيفة وطريقة الدلوين فيزيل الأوساخ دون أن يحكّها على الطلاء.</p>"
  },
  "what-is-ceramic-coating" => {
    title: "ما هو طلاء السيراميك حقًا؟",
    subtitle: "لمعان يدوم وتنظيف أسهل، مشروحًا بلا مبالغة.",
    body: "<p>طلاء السيراميك بوليمر سائل يلتصق بطلاء سيارتك ويتصلّب ليصبح طبقة صلبة وملساء. " \
      "يمنح عمقًا ولمعانًا، ويطرد الماء، ويجعل أوساخ الاستخدام اليومي أسهل بكثير في الإزالة.</p>" \
      "<p>وهو ليس مضادًا للخدوش، لكنه يمنح الطلاء درعًا يتحمّل عنه ويدوم سنوات لا أسابيع.</p>"
  },
  "protecting-your-interior-from-the-sun" => {
    title: "حماية المقصورة الداخلية من الشمس",
    subtitle: "عادات بسيطة تمنع تشقق لوحة القيادة وبهتان الجلد.",
    body: "<p>الحرارة والأشعة فوق البنفسجية أكبر أعداء لوحة القيادة والجلد والبلاستيك. " \
      "اركن في الظل متى استطعت، واستخدم ساترًا للزجاج الأمامي، وضع طبقة واقية من الأشعة فوق البنفسجية كل شهر أو شهرين.</p>" \
      "<p>ترطيب الجلد بضع مرات في السنة يُبقيه مرنًا ويمنع تشققه.</p>"
  },
  "preparing-your-car-for-summer" => {
    title: "جهّز سيارتك للصيف",
    subtitle: "قائمة قصيرة قبل وصول الحرارة.",
    body: "<ul><li>افحص ضغط الإطارات — فالطرق الحارة ترفعه.</li><li>جرّب المكيّف وبدّل فلتر المقصورة.</li>" \
      "<li>ضع شمعًا أو مادة عازلة على الطلاء لحماية إضافية.</li><li>أضف سائل التبريد وسائل غسيل الزجاج.</li></ul>"
  }
}

blogs.each do |slug, attrs|
  blog = Blog.find_by(slug: slug)
  add.(blog, :blog_translations, name: attrs[:title], **attrs) if blog
end

# --- Pages ----------------------------------------------------------------------

# Arabic text for a rich-text section's `body` (the page's only section). No <h1>: the page header
# already shows the title, and the HTML sanitizer strips <h1> anyway.
about_body = <<~HTML.squish
  <p>بدأت Auto Atelier بمحطة تنظيف واحدة وقناعة بسيطة: السيارة تستحق من الصبر والإتقان ما يستحقه أي شيء آخر تملكه.
  سئمنا من أنفاق الفُرش والتسليم المتعجّل ونتائج تبدو نظيفة حتى أول شعاع شمس. فاخترنا الطريقة البطيئة: بأيدينا، سيارة واحدة في كل مرة.</p>
  <h2>قصتنا</h2>
  <p>ما بدأ مشروعًا في عطلة نهاية الأسبوع للأصدقاء والجيران كبر بالكلمة الطيبة. واليوم يعتني فريقنا الصغير من الفنيين المدرَّبين
  بمئات السيارات، من سيارات الاستخدام اليومي إلى الكلاسيكيات، في ورشتنا وعند بابك. كبرنا، لكن طريقتنا في العمل لم تتغير:
  كل سيارة تحظى بفحص دقيق، وبالمنتجات المناسبة لطلائها ومقصورتها، وبالوقت الذي يلزم لإتقان العمل.</p>
  <h2>كيف نعمل</h2>
  <p>يُنجز كل غسيل يدويًا بقفازات نظيفة وماء مُرشَّح وشامبو متوازن الحموضة، يتبعه تجفيف يدوي لطيف لا يترك خدوشًا.
  وتُنظَّف المقصورات بالمكنسة وتُرطَّب وتُمسح سطحًا سطحًا، ولا تُطبَّق المعالجات الواقية كالشمع وطلاء السيراميك إلا حيث تفيد فعلًا.
  نستخدم المنتجات نفسها على سياراتنا، ولن نقدّم خدمة لا نحجزها لأنفسنا.</p>
  <h2>وعدنا</h2>
  <p>أسعار واضحة قبل أن نبدأ، وزيارات تبدأ في موعدها، ونتائج نفخر بأن نضع اسمنا عليها. وإن كان هناك ما ليس على ما يرام
  فأخبرنا وسنصلحه. سيارتك أكثر من وسيلة تنقل، ونعاملها على هذا الأساس.</p>
  <p>سواء مررت علينا، أو حجزت استلامًا صباحيًا، أو طلبت منا القدوم إليك، يسعدنا أن نعتني بسيارتك.</p>
HTML

terms_body = <<~HTML.squish
  <p>تسري هذه الشروط على كل حجز وخدمة تقدمها Auto Atelier. بحجزك لدينا فإنك توافق عليها.</p>
  <h2>الحجوزات</h2>
  <p>يتأكد الحجز عند وصول رسالة التأكيد منا. يرجى الحضور في الموعد، أو التواجد في المكان المتفق عليه في الزيارات المتنقلة،
  لنتمكن من منح سيارتك الوقت الكامل الذي تحتاجه.</p>
  <h2>الإلغاء والتعديل</h2>
  <p>يمكنك الإلغاء أو تغيير الموعد مجانًا حتى 24 ساعة قبل موعدك. وقد تترتب رسوم على التعديلات المتأخرة، وقد نضطر إلى
  إعادة الجدولة في حالات الطقس القاسي أو المرض.</p>
  <h2>الأسعار والدفع</h2>
  <p>تُعرض الأسعار قبل الحجز. يُستحق الدفع عند إتمام الخدمة ما لم يُتفق على غير ذلك. وإن احتاجت السيارة إلى عمل
  يفوق ما وُصف بكثير، فسنخبرك ونتفق على السعر قبل المتابعة.</p>
  <h2>سيارتك</h2>
  <p>يرجى إخراج الأشياء الثمينة قبل زيارتك. نعتني بكل سيارة عناية فائقة، لكننا لسنا مسؤولين عن الأضرار السابقة
  ولا عن الأغراض المتروكة داخل السيارة. يرجى إخبارنا بأي مشكلات معروفة قبل أن نبدأ.</p>
  <h2>ضماننا</h2>
  <p>إن لم تعجبك النتيجة فأخبرنا خلال 48 ساعة وسنصلحها دون أي رسوم إضافية.</p>
  <h2>تواصل معنا</h2>
  <p>هل لديك أسئلة عن هذه الشروط؟ تواصل معنا وسيسعدنا مساعدتك.</p>
HTML

contact_body = "<p>لديك أسئلة أو ملاحظات أو طلب خاص؟ أرسل لنا رسالة أدناه وسنعاود التواصل معك قريبًا.</p>"

# Sets the Arabic content of a page's section at `position` (and optional new settings).
add_section_content = lambda do |page, position, content, **settings|
  section = page.page_sections.order(:position).to_a[position]
  next unless section && section.content_for(arabic.id).empty?

  section.assign_values(settings: section.settings.merge(settings.stringify_keys), content_by_language: { arabic.id => content })
  section.save!
end

pages = {
  "home" => {
    translation: { name: "الرئيسية", title: "Auto Atelier — عناية متقنة بالسيارات يدويًا", subtitle: "لمعان هادئ لسيارتك" },
    sections: lambda do |page|
      add_section_content.(page, 0, {
        "heading" => "لمعان هادئ لسيارتك",
        "subheading" => "غسيل يدوي وتنظيف داخلي وحماية بالسيراميك، يُنجز على مهل على أيدي أشخاص يهتمون بالنتيجة لا بالساعة.",
        "button_label" => "احجز زيارتك"
      })
      add_section_content.(page, 1, {
        "heading" => "عناية بالأيدي",
        "items" => {
          "wash" => { "title" => "غسيل وتجفيف يدوي",
                      "text" => "غسيل خارجي كامل وإزالة للشوائب بالطين الخاص وتجفيف يدوي — بلا فُرش ولا أنفاق آلية." },
          "interior" => { "title" => "تنظيف داخلي متكامل",
                          "text" => "المقاعد والسجاد وكل سطح تُنظَّف بالمكنسة وتُرطَّب وتُمسح يدويًا." },
          "ceramic" => { "title" => "طلاء السيراميك",
                         "text" => "طبقة حماية طويلة الأمد تحافظ على اللمعان والنظافة بين الزيارات." },
          "mobile" => { "title" => "خدمة متنقلة",
                        "text" => "نحضر ورشة التنظيف إليك — في المنزل أو المكتب أو أينما ركنت سيارتك." }
        }
      })
      add_section_content.(page, 2, {
        "heading" => "لماذا Auto Atelier",
        "items" => {
          "handfinished" => { "title" => "إتقان يدوي بلا آلات",
                              "text" => "كل سيارة تُغسل وتُجفّف يدويًا. بلا أنفاق فُرش ولا اختصارات." },
          "products" => { "title" => "منتجات نستخدمها على سياراتنا",
                          "text" => "نستخدم الشموع والشامبو ومنتجات العناية بالجلد نفسها التي نثق بها لسياراتنا." },
          "schedule" => { "title" => "حجز يناسب يومك",
                          "text" => "تسليم صباحًا واستلام مساءً، أو زيارة متنقلة — ننسّق العناية حول جدولك أنت لا العكس." }
        }
      })
      add_section_content.(page, 3, {
        "heading" => "اجعلها عادة لا مهمة شاقة",
        "text" => "يحصل الأعضاء على موعد ثابت وأولوية في الحجز وسيارة تبدو دائمًا بهذا الشكل. اسألنا عن الباقات عند الحجز.",
        "button_label" => "كن عضوًا"
      })
    end
  },
  "about" => {
    translation: { name: "من نحن", title: "من نحن — Auto Atelier", subtitle: "عناية يدوية متقنة بالسيارات، على أيدي من يهتمون",
                   seo_description: "من نحن، وكيف نعمل، ولماذا نغسل كل سيارة بأيدينا." },
    sections: ->(page) { add_section_content.(page, 0, { "body" => about_body }) }
  },
  "contact" => {
    translation: { name: "تواصل معنا", title: "تواصل معنا — Auto Atelier", subtitle: "يسعدنا أن نسمع منك",
                   seo_description: "لديك أسئلة أو ملاحظات أو طلب خاص؟ أرسل لنا رسالة." },
    sections: ->(page) { add_section_content.(page, 0, { "body" => contact_body }) }
  },
  "terms-and-conditions" => {
    translation: { name: "الشروط والأحكام", title: "الشروط والأحكام — Auto Atelier", subtitle: "الشروط التي تسري عند حجزك لدينا",
                   seo_description: "الشروط والأحكام الخاصة بحجز خدمات Auto Atelier واستخدامها." },
    sections: ->(page) { add_section_content.(page, 0, { "body" => terms_body }) }
  }
}

pages.each do |slug, attrs|
  page = Page.find_by(slug: slug)
  next unless page

  add.(page, :page_translations, **attrs[:translation])
  attrs[:sections].(page)
end

# --- Buttons that led to the sign-up page ---------------------------------------

home = Page.find_by(slug: "home")
home&.page_sections&.includes(:component)&.each do |section|
  next unless %w[hero cta].include?(section.component.key) && section.settings["button_url"] == "/sign_up"

  section.update!(settings: section.settings.merge("button_url" => "/services"))
end
