# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Users", type: :request do
  fixtures :users

  describe "GET /sign_up" do
    it "renders the sign up page" do
      get sign_up_path
      expect(response).to have_http_status(:success)
    end

    it "redirects authenticated users" do
      sign_in users(:one)
      get sign_up_path
      expect(response).to redirect_to(root_path)
    end
  end

  describe "POST /sign_up" do
    it "creates a new user" do
      expect {
        post sign_up_path, params: {
          name: "New User",
          email: "new@example.com",
          password: "Secret1*3*5*",
          password_confirmation: "Secret1*3*5*"
        }
      }.to change(User, :count).by(1)
      expect(response).to redirect_to(root_path)
    end

    it "stores the first and last name separately" do
      post sign_up_path, params: {
        name: "Sara", last_name: "Hassan", email: "sara@example.com",
        password: "Secret1*3*5*", password_confirmation: "Secret1*3*5*"
      }

      expect(User.find_by!(email: "sara@example.com")).to have_attributes(name: "Sara", last_name: "Hassan")
    end

    it "rejects invalid user" do
      expect {
        post sign_up_path, params: {
          name: "",
          email: "invalid",
          password: "short",
          password_confirmation: "short"
        }
      }.not_to change(User, :count)
      expect(response).to redirect_to(sign_up_path)
    end
  end

  describe "DELETE /users" do
    it "deactivates the current user and signs them out with a valid password" do
      user = users(:one)
      sign_in user
      expect {
        delete users_path, params: { delete_password: "Secret1*3*5*" }
      }.not_to change(User, :count)
      expect(response).to redirect_to(root_path)
      expect(user.reload).not_to be_is_active
      expect(user.sessions).to be_empty
    end

    it "rejects account deletion with wrong password" do
      sign_in users(:one)
      expect {
        delete users_path, params: { delete_password: "wrongpassword" }
      }.not_to change(User, :count)
      expect(users(:one).reload).to be_is_active
      expect(response).to redirect_to(profile_path)
    end
  end
end
