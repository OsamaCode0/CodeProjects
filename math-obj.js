


const mathObj = {
  abs: function(x) {
    return Math.abs(x)
  },

  isEven: function(x) {
    if (x % 2 === 0) {
      return true;
    }else {
      return false;
    }
  },

  isOdd: function(x) {
    if (x % 2 !== 0) {
      return true;
    }else {
      return false;
    }
  },

  isStrictlyPositive: function(x) {
    if (x > 0) {
      return true
    }else{
      return false
    }
  },

  min: function(x, y) {
    if (x < y ) {
      return x;
    }else {
      return y;
    }
  },

  max: function(x, y) {
    if (x > y) {
      return x;
    }else {
      return y;
    }
  }
}