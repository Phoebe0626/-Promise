class MPromise {
  static PENDING = 'pending';
  static FULFILLED = 'fulfilled';
  static REJECTED = 'rejected';

  constructor(executor) {
    this.status = MPromise.PENDING;
    this.value = null;
    executor(this.resolve.bind(this), this.reject.bind(this));
  }

  resolve(value) {
    if (this.status === MPromise.PENDING) {
      this.status = MPromise.FULFILLED;
      this.value = value;
    }
  }
  reject(reason) {
    if (this.status === MPromise.PENDING) {
      this.status = MPromise.REJECTED;
      this.value = reason;
    }
  }
}