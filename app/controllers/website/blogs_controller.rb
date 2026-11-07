# frozen_string_literal: true

# Public blog: a paginated list of active blogs (newest first) and a single blog by slug.
class Website::BlogsController < Website::BaseController
  skip_before_action :authenticate
  before_action :perform_authentication

  include Website::Paginates

  PER_PAGE = 9

  def index
    blogs, pagination = paginate(
      Blog.where(is_active: true).order(created_at: :desc, id: :desc)
        .includes(:blog_translations, cover_image_attachment: :blob),
      per_page: PER_PAGE
    )

    render inertia: {
      blogs: blogs.map { |blog| card_props(blog) },
      page: pagination[:page],
      pages: pagination[:pages]
    }
  end

  def show
    blog = Blog.where(is_active: true).includes(:blog_translations, cover_image_attachment: :blob)
      .find_by!(slug: params[:slug])
    translation = blog.translation

    render inertia: {
      blog: card_props(blog).merge(
        body: blog.translated(:body),
        seo_title: translation&.seo_title.presence,
        seo_description: translation&.seo_description.presence
      ),
      related: related_props(blog)
    }
  end

  private

  def card_props(blog)
    {
      id: blog.id,
      slug: blog.slug,
      title: blog.translated(:title),
      subtitle: blog.translated(:subtitle),
      cover_image: blob_prop(blog.cover_image),
      published_at: blog.created_at.iso8601
    }
  end

  def related_props(blog)
    Blog.where(is_active: true).where.not(id: blog.id).order(created_at: :desc).limit(3)
      .includes(:blog_translations, cover_image_attachment: :blob)
      .map { |other| card_props(other) }
  end
end
