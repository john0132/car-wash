# frozen_string_literal: true

# Content Security Policy, in report-only mode: browsers log what the policy
# would block (the console, and `/csp-violation-report-endpoint` if one is added)
# without blocking anything. Tighten it, then switch `report_only` off, once a
# production run shows no violations.
#
# What the site loads: its own scripts and styles (the Vite bundles), uploaded
# images from Active Storage, OpenStreetMap tiles on the checkout/address map,
# and nothing from third parties (fonts are self-hosted).
Rails.application.configure do
  config.content_security_policy do |policy|
    policy.default_src :self
    policy.base_uri    :self
    policy.form_action :self
    policy.frame_ancestors :self
    policy.object_src  :none
    policy.font_src    :self, :data
    policy.img_src     :self, :data, :blob, "https://tile.openstreetmap.org"
    policy.style_src   :self, :unsafe_inline # Radix/Leaflet set inline styles
    policy.script_src  :self
    policy.connect_src :self

    if Rails.env.development?
      # The Vite dev server (scripts, HMR socket) on another port.
      policy.script_src  :self, :unsafe_eval, :unsafe_inline, "http://localhost:*", "http://127.0.0.1:*"
      policy.style_src   :self, :unsafe_inline, "http://localhost:*", "http://127.0.0.1:*"
      policy.connect_src :self, "http://localhost:*", "http://127.0.0.1:*", "ws://localhost:*", "ws://127.0.0.1:*"
      policy.font_src    :self, :data, "http://localhost:*", "http://127.0.0.1:*"
      policy.img_src     :self, :data, :blob, "https://tile.openstreetmap.org", "http://localhost:*", "http://127.0.0.1:*"
    end
  end

  # Inline scripts (the dashboard's theme script) carry a per-request nonce.
  config.content_security_policy_nonce_generator = ->(_request) { SecureRandom.base64(16) }
  config.content_security_policy_nonce_directives = %w[script-src]

  config.content_security_policy_report_only = true
end
