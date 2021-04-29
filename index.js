class MPromise {
  static PENDING = 'pending';
  static FULFILLED = 'fulfilled';
  static REJECTED = 'rejected';

  constructor(executor) {
    this.status = MPromise.PENDING;
    this.value = null;
    this.callbacks = [];
    try {
      executor(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) { // 发生错误 状态改为 rejected
      this.reject(error)
    }
  }

  resolve(value) {
    if (this.status === MPromise.PENDING) {
      this.status = MPromise.FULFILLED;
      this.value = value;
      setTimeout(() => {
        this.callbacks.map(callback => {
          callback.onFulfilled(value);
        }); 
      });
    }
  }

  reject(reason) {
    if (this.status === MPromise.PENDING) {
      this.status = MPromise.REJECTED;
      this.value = reason;
      setTimeout(() => {
        this.callbacks.map(callback => {
          callback.onRejected(reason);
        }) 
      });
    }
  }

  then(onFulfilled, onRejected) {
    if (typeof onFulfilled !== 'function') { // then 的穿透
      onFulfilled = () => this.value;
    }
    if (typeof onRejected !== 'function') {
      onRejected = () => this.value;
    }
    let promise = new MPromise((resolve, reject) => {
      // 待定状态
      if (this.status === MPromise.PENDING) {
        this.callbacks.push({
          onFulfilled: value => {
            this.parse(promise, onFulfilled(this.value), resolve, reject);
          },
          onRejected: reason => {
            this.parse(promise, onRejected(this.value), resolve, reject);
          }
        })
      }
      
      // 成功状态
      if (this.status === MPromise.FULFILLED) {
        setTimeout(() => {
          this.parse(promise, onFulfilled(this.value), resolve, reject);
        })
      }
      // 失败状态
      if (this.status === MPromise.REJECTED) {
        setTimeout(() => {
          this.parse(promise, onRejected(this.value), resolve, reject);
        });
      }
    });
    return promise;
  }
  // 公共代码
  parse(promise, result, resolve, reject) {
    if (result === promise) { // 不允许返回自身的 Promise
      throw new TypeError('Chaining cycle detected');
    }
    try {
      if (result instanceof MPromise) {
        result.then(resolve, reject);
      } else {
        resolve(result);
      }
    } catch (error) {
      reject(error);
    }
  }

  static resolve(value) {
    return new MPromise((resolve, reject) => {
      if (value instanceof MPromise) {
        value.then(resolve, reject);
      } else {
        resolve(value)
      }
    })
  }
  
  static reject(reason) {
    return new MPromise((resolve, reject) => {
      reject(reason);
    })
  }

  static all(promises) {
    return new MPromise((resolve, reject) => {
      const values = [];
      promises.forEach(promise => {
        promise.then(
          value => {
            values.push(value);
            if (values.length === promises.length) {
              resolve(values)
            }
          },
          reason => {
            reject(reason);
          }
        )
      })
    })
  }
}