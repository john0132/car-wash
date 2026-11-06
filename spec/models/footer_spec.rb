# frozen_string_literal: true

require "rails_helper"

RSpec.describe Footer, type: :model do
  before { english }

  it "has exactly one instance" do
    expect { Footer.instance }.to change(Footer, :count).by(1)
    expect { Footer.instance }.not_to change(Footer, :count)
  end

  it "needs no translations of its own" do
    expect(Footer.new).to be_valid
  end

  describe FooterColumn do
    it "requires a title in the default language" do
      column = Footer.instance.footer_columns.build

      expect(column).not_to be_valid
      expect(column.errors[:translations]).to eq([ "must include a title in English" ])
    end
  end

  describe FooterItem do
    it "belongs to a column, shares Linkable validations and needs a label" do
      item = create_footer_column.footer_items.build(link_type: "url")

      expect(item).not_to be_valid
      expect(item.errors[:url]).to be_present
      expect(item.errors[:translations]).to eq([ "must include a label in English" ])
    end
  end

  describe FooterSocialLink do
    it "requires a name and a valid url" do
      link = Footer.instance.footer_social_links.build(url: "not a url")

      expect(link).not_to be_valid
      expect(link.errors[:name]).to be_present
      expect(link.errors[:url]).to be_present
    end
  end

  it "is touched by everything inside it" do
    footer = Footer.instance
    item = create_footer_item(column: create_footer_column(footer: footer))

    expect { travel(1.minute) { item.footer_item_translations.first.update!(label: "About us") } }
      .to(change { footer.reload.updated_at })
  end

  it "deletes its columns, items and links with it" do
    create_footer_item
    footer = Footer.instance
    footer.footer_social_links.create!(name: "Instagram", url: "https://instagram.com/x")

    expect { footer.destroy! }.to change { [ FooterColumn.count, FooterItem.count, FooterSocialLink.count ] }.to([ 0, 0, 0 ])
  end
end
