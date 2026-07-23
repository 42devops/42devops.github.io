require 'liquid'

module Liquid
  class Variable
    def taint_check(*args)
      nil
    end
  end
end

class Object
  def tainted?
    false
  end
  def taint
    self
  end
  def untaint
    self
  end
end
