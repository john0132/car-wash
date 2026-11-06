# frozen_string_literal: true

# Page-number pagination for public listings. Mirrors Admin::Pagination: the
# `pagination` hash it returns matches `PaginationData` in the website types.
module Website::Paginates
  extend ActiveSupport::Concern

  private

  # Returns [records, pagination] for page `params[page_param]`. Runs one COUNT, and
  # no page query at all when nothing matches.
  def paginate(scope, per_page:, page_param: :page)
    total = scope.count(:all)
    pages = [ (total.to_f / per_page).ceil, 1 ].max
    page = params[page_param].to_i.clamp(1, pages)
    records = total.zero? ? [] : scope.limit(per_page).offset((page - 1) * per_page).to_a

    [ records, { page: page, pages: pages, total: total, per_page: per_page } ]
  end
end
