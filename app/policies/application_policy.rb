# frozen_string_literal: true

class ApplicationPolicy
  attr_reader :user, :record

  def initialize(user, record)
    @user = user
    @record = record
  end

  def index?
    false
  end

  def show?
    false
  end

  def create?
    false
  end

  def new?
    create?
  end

  def update?
    false
  end

  def edit?
    update?
  end

  def destroy?
    false
  end

  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    def resolve
      raise NoMethodError, "You must define #resolve in #{self.class}"
    end
  end

  private

  # DB-backed permission check against the Role/Permission tables, scoped to
  # the resource this policy governs (e.g. "cities", see Permission::CATALOG).
  # Only admins hold roles, so employees and customers never pass, see User#permission?.
  def permit?(action)
    user.permission?(resource_name, action)
  end

  def resource_name
    (record.is_a?(Class) ? record : record.class).model_name.plural
  end
end
