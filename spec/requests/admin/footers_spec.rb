# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin footer", type: :request do
  fixtures :users

  let(:admin) { users(:admin) }

  before do
    english
    arabic
    sign_in admin
  end

  def link(label: "About", **attrs)
    { link_type: "url", url: "/about", is_active: true,
      translations: { english.id.to_s => { label: label }, arabic.id.to_s => { label: "" } } }.merge(attrs)
  end

  def column(title: "Company", items: [ link ], **attrs)
    { is_active: true, items: items,
      translations: { english.id.to_s => { title: title }, arabic.id.to_s => { title: "" } } }.merge(attrs)
  end

  def footer_params(title: "Atelier", columns: [ column ], social_links: [], **attrs)
    { footer: { translations: { english.id.to_s => { title: title, description: "Care" }, arabic.id.to_s => { title: "", description: "" } },
                social_links: social_links, columns: columns }.merge(attrs) }
  end

  describe "GET /admin/footer/edit" do
    it "renders the footer, creating the single record when missing" do
      grant(admin, "footers.read")
      create_footer_item(label: "About")

      expect { get edit_admin_footer_path }.not_to change(Footer, :count)

      expect_inertia.to render_component("admin/footers/edit")
      expect(inertia.props[:columns].first[:items].first[:translations][english.id.to_s.to_sym][:label]).to eq("About")
      expect(inertia.props[:translations][english.id.to_s.to_sym].to_h.symbolize_keys).to eq(title: "", description: "")
    end

    it "is forbidden without footers.read" do
      get edit_admin_footer_path

      expect(response).to redirect_to(admin_root_path)
    end
  end

  describe "PATCH /admin/footer" do
    before { grant(admin, "footers.read", "footers.update") }

    it "saves the content, social links, columns and their links" do
      patch admin_footer_path, as: :json, params: footer_params(
        social_links: [ { name: "Instagram", url: "https://instagram.com/x", is_active: true } ],
        columns: [ column(title: "Company", items: [ link(label: "About"), link(label: "Blog", url: "/blog") ]), column(title: "Help", items: []) ]
      )

      expect(response).to redirect_to(edit_admin_footer_path)
      footer = Footer.instance
      expect(footer.translated(:title)).to eq("Atelier")
      expect(footer.footer_translations.count).to eq(1)
      expect(footer.footer_social_links.pluck(:name)).to eq([ "Instagram" ])
      expect(footer.footer_columns.map { |c| c.translated(:title) }).to eq(%w[Company Help])
      expect(footer.footer_columns.first.footer_items.map { |i| i.translated(:label) }).to eq(%w[About Blog])
    end

    it "reconciles columns and links with what was submitted" do
      kept = create_footer_item(label: "About")
      removed_item = create_footer_item(column: kept.footer_column, label: "Old", url: "/old", position: 1)
      other = create_footer_column(title: "Gone")

      patch admin_footer_path, as: :json, params: footer_params(
        columns: [ column(id: kept.footer_column_id, title: "Renamed", items: [ link(id: kept.id, label: "About us") ]) ]
      )

      expect(FooterItem.exists?(removed_item.id)).to be(false)
      expect(FooterColumn.exists?(other.id)).to be(false)
      expect(kept.footer_column.reload.translated(:title)).to eq("Renamed")
      expect(kept.reload.translated(:label)).to eq("About us")
    end

    it "attaches a social icon and the footer image from uploaded blobs" do
      patch admin_footer_path, as: :json, params: footer_params(
        image: uploaded_blob.signed_id,
        social_links: [ { name: "Instagram", url: "https://instagram.com/x", icon: uploaded_blob.signed_id } ]
      )

      footer = Footer.instance
      expect(footer.image).to be_attached
      expect(footer.footer_social_links.first.icon).to be_attached
    end

    it "removes the image when submitted blank" do
      Footer.instance.image.attach(uploaded_blob)

      patch admin_footer_path, as: :json, params: footer_params(image: nil)

      expect(Footer.instance.image).not_to be_attached
    end

    it "reports errors by column, link and social link, saving nothing" do
      patch admin_footer_path, as: :json, params: footer_params(
        social_links: [ { name: "", url: "nope" } ],
        columns: [ column(title: "", items: [ link(label: "", url: "") ]) ]
      )

      follow_redirect!
      errors = inertia.props[:errors]
      expect(errors).to include("social_links.0.name", "social_links.0.url", "columns.0.translations",
        "columns.0.items.0.url", "columns.0.items.0.translations", "columns", "social_links")
      expect(FooterColumn.count).to eq(0)
      expect(FooterSocialLink.count).to eq(0)
    end

    it "is forbidden without footers.update" do
      admin.roles.clear
      grant(admin, "footers.read")

      patch admin_footer_path, as: :json, params: footer_params

      expect(Footer.instance.footer_columns).to be_empty
      expect(flash[:alert]).to eq("You are not authorized to perform this action")
    end
  end
end
