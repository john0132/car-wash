# frozen_string_literal: true

# Page-number pagination for dashboard lists. The `pagination` hash matches the
# `Pagination` type in app/javascript/admin/types.
module Admin::Pagination
  extend ActiveSupport::Concern

  PER_PAGE = 20

  private

  # Returns [records, pagination] for page `params[page_param]`. Pass `total`
  # when it is already known, to skip the COUNT query.
  def paginate(scope, total: nil, page_param: :page, per_page: PER_PAGE)
    total ||= scope.count(:all)
    pages = [ (total.to_f / per_page).ceil, 1 ].max
    page = params[page_param].to_i.clamp(1, pages)

    [ scope.limit(per_page).offset((page - 1) * per_page), { page: page, pages: pages, total: total } ]
  end
end
