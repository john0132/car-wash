# frozen_string_literal: true

require "rails_helper"

RSpec.describe UserMailer, type: :mailer do
  fixtures :users

  describe "password_reset" do
    let(:mail) { described_class.with(user: users(:one)).password_reset }

    it "sends to the user's email" do
      expect(mail.to).to eq([ "one@example.com" ])
    end

    it "has the correct subject" do
      expect(mail.subject).to eq("Reset your password")
    end

    it "links into the English site, left to right" do
      expect(mail.body.encoded).to include("Reset my password").and include("/identity/password_reset/edit")
      expect(mail.body.encoded).not_to include("/ar/identity")
    end

    it "writes in Arabic, right to left, with a link into the Arabic site" do
      arabic_mail = I18n.with_locale(:ar) { described_class.with(user: users(:one)).password_reset.tap(&:body) }

      expect(arabic_mail.subject).to eq("إعادة تعيين كلمة المرور")
      body = arabic_mail.body.encoded.dup.force_encoding("UTF-8")
      expect(body).to include('dir="rtl"').and include("/ar/identity/password_reset/edit")
    end
  end
end
