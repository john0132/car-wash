# frozen_string_literal: true

class UserMailer < ApplicationMailer
  # Sent in the language the customer asked in (ActiveJob carries I18n.locale to the job),
  # with a link into the same language's site.
  def password_reset
    @user = params[:user]
    @signed_id = @user.generate_token_for(:password_reset)
    @reset_url = edit_identity_password_reset_url(sid: @signed_id, script_name: locale_script_name)
    @rtl = Website::Localized::RTL_LOCALES.include?(I18n.locale.to_s)

    mail to: @user.email, subject: I18n.t("website.mailers.password_reset.subject")
  end

  private

  def locale_script_name
    I18n.locale == I18n.default_locale ? "" : "/#{I18n.locale}"
  end
end
