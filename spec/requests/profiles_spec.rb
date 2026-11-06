# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Profiles", type: :request do
  fixtures :users

  describe "GET /profile" do
    it "redirects signed-out visitors to sign in" do
      get profile_path
      expect(response).to redirect_to(sign_in_path)
    end

    it "renders the profile page for a customer" do
      sign_in users(:one)
      get profile_path
      expect(response).to have_http_status(:success)
    end
  end

  describe "PATCH /profile" do
    before { sign_in users(:one) }

    it "updates the name without asking for a password" do
      patch profile_path, params: { name: "Renamed", last_name: "Person" }
      expect(response).to redirect_to(profile_path)
      expect(users(:one).reload).to have_attributes(name: "Renamed", last_name: "Person")
    end

    it "changes the email when the current password is right" do
      patch profile_path, params: { email: "new@example.com", email_password: "Secret1*3*5*" }
      expect(response).to redirect_to(profile_path)
      expect(users(:one).reload.email).to eq("new@example.com")
    end

    it "keeps the email when the current password is wrong" do
      patch profile_path, params: { email: "new@example.com", email_password: "wrong" }
      expect(response).to redirect_to(profile_path)
      expect(session[:inertia_errors]).to eq(email_password: [ "is invalid" ])
      expect(users(:one).reload.email).to eq("one@example.com")
    end

    it "does not require a password when the email is unchanged" do
      patch profile_path, params: { name: "Same", email: users(:one).email }
      expect(users(:one).reload.name).to eq("Same")
    end
  end

  describe "PATCH /password" do
    before { sign_in users(:one) }

    it "updates the password with the right challenge" do
      patch password_path, params: {
        password: "NewPassword1*3*", password_confirmation: "NewPassword1*3*", password_challenge: "Secret1*3*5*"
      }
      expect(response).to redirect_to(profile_path)
      expect(flash[:notice]).to eq("Your password has been changed")
    end

    it "rejects a wrong current password" do
      patch password_path, params: {
        password: "NewPassword1*3*", password_confirmation: "NewPassword1*3*", password_challenge: "wrong"
      }
      expect(response).to redirect_to(profile_path)
      expect(session[:inertia_errors]).to eq(password_challenge: [ "is invalid" ])
    end
  end
end
